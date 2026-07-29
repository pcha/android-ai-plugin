---
name: android-architecture-principles
description: "Use this skill when working on an Android project and the user asks about architecture design, best practices for structuring app code, separation of concerns, unidirectional data flow (UDF), single source of truth (SSOT), or how to organize responsibilities across layers. Also use when implementing a new feature and guidance is needed on which layer code belongs in, or when reviewing existing architecture decisions."
---

# Android Architecture Core Principles

Four non-negotiable principles that govern all architectural decisions.

## 1. Separation of Concerns
- Never store application data or state in `Activity` or `Fragment`
- UI components have ephemeral lifecycles and are frequently destroyed/recreated
- Each layer has one responsibility; don't mix UI logic with business logic

## 2. Drive UI from Data Models
- Base the app on persistent data models independent from UI elements
- Users don't lose data when the OS destroys the app
- App continues working during network interruptions

## 3. Single Source of Truth (SSOT)
- Each data type has exactly one owner
- SSOT exposes data using immutable types
- Only the SSOT modifies data; everything else triggers events to request changes
- Centralizes changes, protects data from tampering, makes bugs easier to trace

## 4. Unidirectional Data Flow (UDF)
- State flows in one direction: data sources → Domain → UI
- Events flow in the opposite direction: UI → Domain → data sources
- Never pass mutable state downward and let child layers mutate it upward

## Anti-patterns to avoid
- Storing data in Activities, Services, or Broadcast Receivers
- Spreading data-loading logic across multiple classes
- Mixing unrelated responsibilities in the same class
- Blocking the main thread with I/O or heavy computation
- Assuming portrait orientation or a specific screen size
