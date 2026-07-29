---
name: new-android
description: "Use this skill when the user wants to create or scaffold a new Android project from Google's architecture templates, optionally including a GitHub repository, release automation, or Play Store publishing configuration."
---

# Create a New Android Project

Follow the complete workflow in [`../../commands/new-android.md`](../../commands/new-android.md).

Treat that document as the authoritative procedure, with these Codex-specific rules:

- Use Codex's normal approval and sandbox rules for cloning repositories, installing dependencies, opening pages, creating GitHub repositories, or changing external state.
- Do not assume that `model: sonnet` in the source document applies to Codex.
- Preserve the validation, secret-handling, and confirmation requirements in the source workflow.
- When a requested action is unavailable, finish every safe local step and clearly identify the remaining manual action.
