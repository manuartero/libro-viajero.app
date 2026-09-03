# Vision

## The Story

It's Friday afternoon, 3pm. Twenty five-year-olds are pulling on coats and stuffing folders into backpacks. María — the teacher — is running the traveling book handoff at the same time.

She should have twenty books back. She counts nineteen. She checks her notebook, but last week's ink smeared. Was it Sofía? Or did Sofía have the blue book, and Lucía the one about dinosaurs? She'll figure it out Monday. By Monday she's forgotten. This is week 7 of a 20-week initiative. The chaos compounds.

Now the same Friday with this app: she opens her phone before she even opens the backpack basket and sees a grid of her children. For every book that comes back, she taps the child's avatar — green circle, done. Nineteen of twenty; one tap away from knowing exactly who, which book, and a ready-to-paste message for the parent group chat. One more tap confirms next week's rotation. The whole thing took 90 seconds.

Not a complex system. A small, focused tool that removes friction from something a teacher does every single week, for the whole school year. There are hundreds of Marías, running the same initiative, fighting the same notebook.

---

## The Real Problem

The traveling book initiative is wonderful: children get excited about books, parents engage with reading at home. But it was designed for the children — not for the teacher who runs it.

The overhead is invisible: tracking twenty book-child pairs, remembering who has read what, chasing unreturned books, composing parent reminders. None of it is hard. All of it takes a slice of attention teachers don't have on a Friday afternoon.

**The initiative fails not because the idea is bad, but because the tracking is broken.**

---

## Design Philosophy

**Mobile-first, always.** The teacher is standing in a classroom with a phone in one hand and a backpack in the other. Everything must be tappable; nothing should require precision — in portrait, without glasses. Desktop is an afterthought: the same layout, centered. (The concrete device rules live in AGENTS.md.)

**Speed over completeness.** A Friday check-in should take under 2 minutes. Any feature that adds time to the Friday flow is the wrong feature. Friction is the enemy.

**No real names.** Children's names are sensitive. The app uses emoji + color avatars and teacher-chosen nicknames or tags. The teacher knows who "🐸 Verde" is. No one else does. Privacy by design, not by policy.

**Joy over utility.** This app should feel like a small pleasure to open, not a chore. Satisfying taps, visual books with covers, avatars with personality. A tool that respects the teacher's time also respects her sense of aesthetics.

**Zero infrastructure.** No server. No database. No subscription. No terms of service to read. No login, because there is nothing to log in to. The teacher's data lives in her browser and nowhere else — the same place, and the same protection, as the notes app on her phone. The only thing that ever leaves the phone is a book title, sent to Open Library to find a cover, and the app says so in plain words from the dashboard. She can download a copy of everything whenever she wants. If the app disappeared tomorrow, there's nothing to lose and nothing to protect.

Scope is a feature.
