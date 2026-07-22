# Helm — Project Overview

> This file **summarizes**. `foundation.md` is the complete, authoritative source — read it for the full reasoning behind every decision below. If this file and `foundation.md` ever disagree, `foundation.md` wins.

## About the project

Helm is a personal **MCP server** built on the **MCP Apps standard** (SEP-1865). Instead of returning plain text, its tools return an **interactive widget** that renders inline in the chat client (Claude Desktop, claude.ai). Module one is a **launch-readiness board**: a checklist you and Claude can create, check off, edit, delete, and reorder, backed by a real Postgres database. It's both a working personal tool and a portfolio piece proving fluency on the first official MCP extension — and it's deliberately built as *module one of a larger command surface*, not a one-off.

## The problem it solves

Two problems at once. (1) A **practical** one: a personal launch/prep checklist that lives *inside the chat* where the work already happens — Claude can read it, update it, and reason about it in conversation, and you can click through it in a widget. (2) A **portfolio** one: a clean, self-hostable demonstration that the builder can ship on the MCP Apps standard, with a real backend and a considered extensibility design.

## The apps / surfaces

- **The widget** — a React UI rendered in a sandboxed iframe inside the chat client. The user clicks/drags here.
- **Claude in conversation** — reads board state and operates the board through the same tools.
- **A `/launch-board` prompt** — the discoverable trigger that renders the widget.

## Core end-to-end flow

User picks the `launch-board` prompt (or asks) → Claude calls the `launch_board_show` tool → the server returns the `ui://` widget resource + current items → the host renders the widget → the user checks/edits/reorders items (widget calls tools) **or** tells Claude to (Claude calls the same tools) → the server persists to Postgres → the widget re-renders and Claude can reason about the new state. (Full flows: `foundation.md` §6.)

## Key invariants

- Every item query is **scoped by `user_id`**, from one resolver — an unscoped query is a bug, not a style choice. (The single-tenant seam; `foundation.md` §7 #6.)
- **No secret ever ships in the widget bundle** — the widget HTML is sent to the client.
- **Every tool sets `visibility` explicitly** — reads/writes are `model+app`; `launch_item_reorder` is `app`-only.
- **Modules never import each other** — a module = tool-prefix + `ui://` widget + own tables + registry row.
- The **render surface is proven before features** — the Layer-0 spike gates everything.

## Features in scope (v1)

- Launch-readiness board with full CRUD + drag-reorder, operable from the widget **and** from Claude.
- `launch_board_show`, `launch_status`, the `launch-board` prompt.
- Single-tenant Postgres persistence (`user_id` present, unenforced).
- Deployed on Railway; a public, self-hostable repo.
- A Claude demo (Desktop primary). *(Reasoning: `foundation.md` §8.)*

## Features out of scope (deferred)

Auth / multi-user hosting · additional modules (pipeline, project states) · the `launch_prefs_set` tool · theming beyond a clean default · real-time multi-client sync.

## Target users

The builder (personally, and as portfolio author); other developers who self-host; reviewers evaluating MCP Apps fluency. *(`foundation.md` §2.)*

## Success criteria & stage

**Stage:** greenfield, day 0. **Portfolio-ready** = a recorded demo of the board rendering in Claude, CRUD + reorder from both widget and Claude, state surviving a reload, plus a clean self-hostable repo. *(`foundation.md` §3.)*

---

Summary only. For the complete picture and the reasoning behind every decision, read `foundation.md`. For the technical shape, see `architecture.md`.
