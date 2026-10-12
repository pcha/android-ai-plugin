import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { promisify } from "node:util"
import test from "node:test"
import plugin from "../opencode/index.js"
import { loadContent, parseMarkdown } from "../opencode/content.js"

const exec = promisify(execFile)
const root = fileURLToPath(new URL("../", import.meta.url))
const ids = [
  "android-architecture-principles", "android-data-layer", "android-di-testing",
  "android-layers", "android-play-store-setup", "android-ui-layer",
  "android-viewmodel", "new-android",
]

async function register(definition) {
  const skills = []
  const commands = []
  const prompts = []
  await definition.setup({
    skill: { transform: async (callback) => callback({ add: (skill) => skills.push(skill) }) },
    command: { transform: async (callback) => callback({ add: (command) => commands.push(command) }) },
    session: { prompt: async (prompt) => prompts.push(prompt) },
  })
  return { skills, commands, prompts }
}

test("loads all eight shared skills with valid paths and descriptions", async () => {
  const { skills, commands } = await loadContent()
  assert.deepEqual(skills.map((skill) => skill.id), ids)
  assert.equal(commands.length, 2)
  for (const skill of skills) {
    assert.ok(skill.description.length > 0)
    assert.equal(skill.autoinvoke, true)
    assert.ok(skill.content.length > 0)
    assert.ok(!skill.content.startsWith("---"))
    assert.equal(await readFile(skill.path, "utf8").then((text) => parseMarkdown(text).content), skill.content)
    // Every local Markdown reference remains readable in the installed package layout.
    for (const match of skill.content.matchAll(/\]\((\.\.?\/[^)]+\.md)\)/g)) {
      assert.ok((await readFile(resolve(dirname(skill.path), match[1]), "utf8")).length > 0)
    }
  }
})

test("parses YAML without leaking Claude model overrides into skill content", () => {
  const { metadata, content } = parseMarkdown('---\r\nname: demo\r\ndescription: "A: workflow"\r\nmodel: sonnet\r\n---\r\nDo the work.\r\n')
  assert.equal(metadata.description, "A: workflow")
  assert.equal(content, "Do the work.")
  assert.throws(() => parseMarkdown("No metadata"), /frontmatter/)
  assert.throws(() => parseMarkdown("---\ndescription: ''\n---\nBody"), /description/)
})

test("commands explicitly attach workflow skills and preserve prompt context", async () => {
  const { skills, commands, prompts } = await register(plugin)
  assert.equal(plugin.id, "android-ai-plugin")
  assert.equal(skills.length, 8)
  assert.deepEqual(commands.map((command) => command.name), ["android-play-store-setup", "new-android"])
  for (const command of commands) {
    const prompt = {
      text: "com.example.app Task",
      files: [{ uri: "file:///project/spec.md" }],
      skills: [{ id: "android-layers" }],
      agents: [{ name: "build" }],
    }
    await command.execute({ sessionID: "ses_test", prompt, delivery: "queue" })
    const submitted = prompts.at(-1)
    assert.equal(submitted.text, prompt.text)
    assert.deepEqual(submitted.files, prompt.files)
    assert.deepEqual(submitted.agents, prompt.agents)
    assert.deepEqual(submitted.skills, [...prompt.skills, { id: command.name }])
    assert.equal(submitted.delivery, "queue")
    assert.equal(submitted.sessionID, "ses_test")
    assert.ok(!("model" in submitted))
    assert.equal(prompt.skills.length, 1)

    await command.execute({ sessionID: "ses_test", prompt: { text: "", skills: [{ id: command.name }] }, delivery: "steer" })
    assert.equal(prompts.at(-1).skills.length, 1)
    assert.equal(prompts.at(-1).text, `Follow the ${command.name} workflow.`)
    assert.equal(prompts.at(-1).delivery, "steer")
  }
})

test("client manifests and lockfile share the release version", async () => {
  const manifests = await Promise.all(["package.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", "package-lock.json"].map(async (path) => JSON.parse(await readFile(join(root, path), "utf8"))))
  assert.equal(new Set(manifests.map((manifest) => manifest.version)).size, 1)
  assert.equal(manifests[3].packages[""].version, manifests[0].version)
})

test("release hook synchronizes both lockfile versions without changing dependencies", async (t) => {
  const directory = await mkdtemp(join(process.env.OPENCODE_TEST_TMPDIR ?? tmpdir(), "android-ai-plugin-release-test-"))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const lock = { version: "1.3.0", packages: { "": { version: "1.3.0" }, "node_modules/yaml": { version: "2.8.1" } } }
  await writeFile(join(directory, "package-lock.json"), JSON.stringify(lock))
  const hook = join(root, "scripts/release-lock.cjs")
  await exec(process.execPath, ["-e", `require(${JSON.stringify(hook)}).preCommit({version: "1.4.0"})`], { cwd: directory })
  const updated = JSON.parse(await readFile(join(directory, "package-lock.json"), "utf8"))
  assert.equal(updated.version, "1.4.0")
  assert.equal(updated.packages[""].version, "1.4.0")
  assert.deepEqual(updated.packages["node_modules/yaml"], lock.packages["node_modules/yaml"])
})

test("packed and installed plugin retains all skills and workflow references", { timeout: 120_000 }, async (t) => {
  const directory = await mkdtemp(join(process.env.OPENCODE_TEST_TMPDIR ?? tmpdir(), "android-ai-plugin-test-"))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const packed = await exec("npm", ["pack", "--json", "--pack-destination", directory], { cwd: root })
  const [archive] = JSON.parse(packed.stdout)
  assert.ok(archive.files.some((file) => file.path === "opencode/index.js"))
  assert.ok(!archive.files.some((file) => /^(?:\.claude\/|\.idea\/|test\/|node_modules\/)/.test(file.path)))
  await exec("npm", ["install", "--prefix", directory, "--ignore-scripts", "--no-audit", "--no-fund", join(directory, archive.filename)], { timeout: 90_000 })
  const installedRoot = join(directory, "node_modules/android-ai-plugin")
  const { default: installed } = await import(pathToFileURL(join(installedRoot, "opencode/index.js")).href)
  const { skills, commands } = await register(installed)
  assert.deepEqual(skills.map((skill) => skill.id), ids)
  assert.equal(commands.length, 2)
  for (const skill of skills) {
    assert.ok(skill.path.startsWith(installedRoot))
    for (const match of skill.content.matchAll(/\]\((\.\.?\/[^)]+\.md)\)/g)) {
      assert.ok((await readFile(resolve(dirname(skill.path), match[1]), "utf8")).length > 0)
    }
  }
})
