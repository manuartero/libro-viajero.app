# libro-viajero.app

> The traveling book dashboard — making Friday handoffs effortless for classroom teachers.

---

## What is this?

**libro-viajero** (Spanish: *traveling book*) is a dashboard for teachers managing the "traveling book" classroom initiative — where each child takes home a different book every week.

Every Friday the teacher needs to:
- Collect returned books
- Track who didn't bring theirs back
- Decide which book goes in which backpack for next week
- Remind parents when needed

This app makes all of that frictionless. Open it Friday afternoon, tap through the check-in, confirm next week's assignments. Done in under 2 minutes.

**All data lives in your browser. No server. No accounts stored anywhere. Just you and your classroom.**

**Mobile-first**: built for the phone in the teacher's hand (user testing on a Xiaomi Redmi 15C). Desktop just gets the same layout, centered.

---

## Features

- **Google Sign-In**: identification only — data never leaves your device
- **Child avatars**: emoji + color, no real names
- **Book covers**: found automatically via Open Library search
- **Friday check-in**: tap to mark returns; see who's missing, with a ready-to-copy parent reminder
- **Smart rotation**: next week's assignments suggested automatically — every child reads every book
- **History**: every past week's check-in

---

## Setup

### 1. Google OAuth Client ID

You need a free Google Cloud OAuth Client ID:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Type: **Web application**
4. Authorized JavaScript origins: `http://localhost:5173` (dev) and your production domain
5. Copy the Client ID

### 2. Environment

```bash
cp .env.example .env
# Edit .env and set your Client ID:
# VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Running the Project

```bash
pnpm install
pnpm dev         # Vite dev server at http://localhost:5173
pnpm test        # Vitest
pnpm build       # TypeScript check + Vite production build
pnpm blue-ball   # lint + test + build — run before pushing
```

---

## Docs

- [VISION.md](VISION.md) — the story behind this project
- [SPEC.md](SPEC.md) — product spec, user stories, acceptance criteria
- [AGENTS.md](AGENTS.md) — AI agent working instructions
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — data model reference

---

## License

MIT — Manuel Artero
