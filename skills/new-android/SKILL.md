---
name: new-android
description: "Use this skill when the user wants to create or scaffold a new Android project from Google's architecture templates, optionally including a GitHub repository, release automation, or Play Store publishing configuration."
---

# Create a New Android Project

Follow the complete workflow in [`../../commands/new-android.md`](../../commands/new-android.md).

Treat that document as the authoritative procedure, with these client-independent rules:

- Use the current client's approval, permission, and sandbox rules for cloning repositories, installing dependencies, opening pages, creating GitHub repositories, or changing external state. Confirm external changes with the user before proceeding.
- The source document's frontmatter configures the Claude command only; in Codex and OpenCode, use the user's selected model.
- Preserve the validation, secret-handling, and confirmation requirements in the source workflow.
- When a requested action is unavailable, finish every safe local step and clearly identify the remaining manual action.
