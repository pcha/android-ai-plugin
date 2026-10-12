const { readFileSync, writeFileSync } = require("node:fs")

exports.preCommit = ({ version }) => {
  const path = "package-lock.json"
  const lock = JSON.parse(readFileSync(path, "utf8"))
  lock.version = version
  lock.packages[""].version = version
  writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`)
}
