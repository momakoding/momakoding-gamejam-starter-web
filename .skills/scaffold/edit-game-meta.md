# Skill: Edit Game Metadata

## Purpose

Quickly update the game's basic info (title, subtitle, description, tags) and team info (team name, members) without browsing source code.

## Files to modify (only these two)

| File | Content |
|---|---|
| `src/contents/game-info/game-meta.ts` | Game title, subtitle, description, tags |
| `src/contents/game-info/team.ts` | Team name, team description, member list |

**Do not modify any other files.** Page components read from these two files automatically.

---

## Field reference

### game-meta.ts — `GAME_META`

```ts
{
  title: string          // Game title (required)
  subtitle?: string      // Subtitle (optional)
  description?: string   // Short description shown on the About page game card (optional)
  tags?: string[]        // Tag list, e.g. ['Action', 'Puzzle', 'Game Jam'] (optional)
  showGameCard: boolean  // Whether to show the game info card on the About page (default: true)
  ossCredits?: Array<{   // Open-source dependencies shown on the About page (optional)
    name: string         // Library name
    desc: string         // Short description
    url?: string         // Link to homepage/repo (optional)
  }>
}
```

### team.ts — `TEAM_INFO`

```ts
{
  teamName: string       // Team name
  description: string    // Team description
  members: Array<{
    name: string         // Member name
    role: string         // Role, e.g. 'Design / Programming'
    avatar?: string      // Emoji or image URL (optional, defaults to '👤')
    introId?: string     // Detail page ID (optional, not yet active)
  }>
}
```

---

## Steps

1. Parse the user's request and extract the field values to change.
2. Use `replace_in_file` to surgically replace only the relevant field values inside the `GAME_META` or `TEAM_INFO` object literal.
3. **Do not** touch the interface definitions (`interface GameMeta` / `interface TeamInfo` / `interface TeamMember`).
4. **Do not** modify any `.vue` files or other files under `src/`.
5. After the edit, briefly confirm which fields were changed.

---

## Example prompts

> "Set the game title to 'Stellar Escape', subtitle to 'A journey about survival', and add two tags: Action, Survival."

Action: edit only `title`, `subtitle`, and `tags` in `game-meta.ts`.

> "Team name is Pixel Forge. Members: Alex (Programming) and Sam (Art, avatar 🎨)."

Action: edit only `teamName` and `members` in `team.ts`.
