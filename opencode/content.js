import { readdir, readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { Skill } from "@opencode/plugin"

/** @param {string} source */
export function parseMarkdown(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  if (!match) throw new Error("Expected YAML frontmatter")
  const metadata = parse(match[1])
  if (typeof metadata?.description !== "string" || !metadata.description.trim()) {
    throw new Error("Expected a non-empty description")
  }
  return { metadata, content: source.slice(match[0].length).trim() }
}

export async function loadContent() {
  // Resolve from the installed package, never from the consumer's working directory.
  const root = new URL("../", import.meta.url)
  const entries = await readdir(new URL("skills/", root), { withFileTypes: true })
  const skills = await Promise.all(entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
    const url = new URL(`skills/${entry.name}/SKILL.md`, root)
    const { metadata, content } = parseMarkdown(await readFile(url, "utf8"))
    return Skill.Info.make({
      id: Skill.ID.make(entry.name),
      name: Skill.Name.make(metadata.name ?? entry.name),
      description: metadata.description,
      autoinvoke: metadata["disable-model-invocation"] !== true && metadata.metadata?.["opencode/autoinvoke"] !== false,
      path: Skill.Info.fields.path.make(fileURLToPath(url)),
      content,
    })
  }))
  const files = await readdir(new URL("commands/", root))
  const commands = await Promise.all(files.filter((file) => file.endsWith(".md")).sort().map(async (file) => {
    const name = file.slice(0, -3)
    if (!skills.some((skill) => skill.id === name)) throw new Error(`Command ${name} needs a matching workflow skill`)
    const { metadata } = parseMarkdown(await readFile(new URL(`commands/${file}`, root), "utf8"))
    return { name, description: metadata.description }
  }))
  return { skills, commands }
}
