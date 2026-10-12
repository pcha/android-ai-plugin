import { Plugin } from "@opencode/plugin"
import { loadContent } from "./content.js"

export default Plugin.define({
  id: "android-ai-plugin",
  async setup(ctx) {
    const { skills, commands } = await loadContent()
    await ctx.skill.transform((editor) => {
      for (const skill of skills) editor.add(skill)
    })
    await ctx.command.transform((editor) => {
      for (const command of commands) {
        editor.add({
          ...command,
          async execute({ sessionID, prompt, delivery }) {
            // Attach the shared skill explicitly, retaining permissions, files, and argument text.
            // Claude's command-level model override is intentionally not applied.
            const selected = prompt.skills ?? []
            await ctx.session.prompt({
              ...prompt,
              sessionID,
              text: prompt.text || `Follow the ${command.name} workflow.`,
              skills: selected.some((skill) => skill.id === command.name)
                ? selected
                : [...selected, { id: command.name }],
              delivery,
            })
          },
        })
      }
    })
  },
})
