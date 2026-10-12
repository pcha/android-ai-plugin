---
name: android-play-store-setup
description: "Use this skill when the user wants to configure Android signing and GitHub secrets for Play Store publishing, including a keystore, signing credentials, or a Google Play service account."
---

# Configure Android Play Store Publishing

Follow the complete workflow in [`../../commands/android-play-store-setup.md`](../../commands/android-play-store-setup.md).

Treat that document as the authoritative procedure, with these client-independent rules:

- Use the current client's approval, permission, and sandbox rules for commands, browser steps, GitHub changes, and other external state. Confirm external changes with the user before proceeding.
- The source document's frontmatter configures the Claude command only; in Codex and OpenCode, use the user's selected model.
- Never print, persist, or commit passwords, private keys, service-account JSON, or base64-encoded keystores.
- Prefer interactive secret entry and verify secret names without exposing secret values.
