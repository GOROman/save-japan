# Save Japan!

<p align="center">
  <img src="assets/save-japan-key-art.png" alt="Save Japan! — nationwide cooperative UFO defense game" width="760">
</p>

## Demo

<p align="center">
  <img src="assets/save-japan-demo.gif" alt="Save Japan! live multiplayer demo" width="560">
</p>

- **Player:** [save-japan.goroman.workers.dev](https://save-japan.goroman.workers.dev/)
- **Projector:** [save-japan.goroman.workers.dev/display](https://save-japan.goroman.workers.dev/display)

**Reignite Japan's spirit—one hometown at a time.**

**Massive Multiplayer Online Shooting Game (MMOSG)** — one shared battle,
one Japan, and every phone becomes an interceptor.

Japan once astonished the world with its energy, imagination, and shared belief in a brighter future. Today, many people feel that confidence and connection fading. **Save Japan!** asks a hopeful question: what if we could awaken that spirit again—not by returning to the past, but by bringing its courage, creativity, and solidarity into the future?

Save Japan! turns people across the country into one nationwide defense team for an intense two-minute live experience. **One worldwide game starts every day at 21:00 Japan Standard Time.** Until launch, players scan the QR code, choose a nickname and home prefecture, and wait together as the synchronized countdown approaches zero. Each daily battle uses a different fictional crisis scenario, three regional missions, and a synchronized final boss fight.

## Inspiration

Save Japan! was inspired by a simple question: **how can we turn people's love for their hometown and for Japan into a shared feeling of action?**

Many digital experiences focus on individual competition. We wanted to create something different: a nationwide cooperative experience where people from every prefecture work toward one goal. The UFO invasion is fictional, but the emotion behind the project is real. We want players to feel that their participation matters, that their hometown matters, and that Japan becomes stronger when people act together.

The Showa era is remembered by many as a time when Japan was filled with momentum: communities were growing, bold ideas felt possible, and people shared confidence in tomorrow. We do not want to recreate the past. We want to carry its best qualities—courage, creativity, and solidarity—into the future.

Defending Japan inside the game is the first step. The larger vision is to awaken motivation, strengthen community spirit, and inspire people to contribute to Japan in the real world.

> **47 prefectures. One shared future. Let's make Japan shine again.**

## What it does

Save Japan! is a cooperative mobile game that brings a live audience together to defend Japan from a UFO invasion.

Players scan a QR code, enter a nickname, and select their hometown prefecture. No GPS, exact address, account, or app installation is required. Each player receives an interceptor on their phone, while the shared command screen immediately shows new arrivals, participating regions, regional activity, and nationwide progress.

At 20:59 JST, GPT-5.6 prepares a new Japan-in-crisis scenario and a four-stage mission sequence in Japanese, English, and Simplified Chinese. At exactly 21:00 JST, the single worldwide game starts automatically. The sequence moves from regional action to cross-region support, a coordinated attack, and a nationwide final defense. Every action from every phone contributes to the same shared objective.

During the climax, all players receive the same final command and press **DEFEND!** together. Energy from the participating prefectures combines to save Japan. The goal is not for one prefecture to defeat the others: the final outcome depends on nationwide cooperation.

## Why it matters

Most multiplayer games turn geography into rivalry. Save Japan! uses hometown identity to create the opposite behavior: individual participation becomes visible, regional activity strengthens the whole map, and success requires cooperation across prefectural boundaries.

The format is designed for festivals, schools, conferences, community events, and public installations. It requires no app installation, account, GPS permission, or exact location. A nickname and player-selected prefecture are enough to create personal presence while minimizing collected data.

The UFO battle is intentionally playful, but the interaction model has a broader purpose: make collective action feel immediate, legible, and emotionally rewarding. The same platform could support disaster-preparedness drills, volunteering campaigns, local initiatives, and civic participation.

## How we built it

We designed Save Japan! as one synchronized experience across a projector and the audience's smartphones.

The mobile browser handles instant registration, hometown selection, mission instructions, personal contribution, haptic feedback, and the final command. The shared screen handles QR onboarding, new-player arrivals, regional participation, the UFO battle, mission progress, and the final result. Socket.IO synchronizes every action in real time without requiring accounts or a database.

GPT-5.6 uses structured output to create a reliable daily crisis scenario and four-mission sequence. A date-seeded library of fictional crises keeps the daily scenario changing and the live game playable if generation is unavailable. Codex supported product scoping, architecture, implementation, debugging, visual design, testing, and documentation in one primary development thread.

## Challenges we ran into

One of our biggest challenges was balancing ambition with live-event reliability. Unrestricted generation during gameplay would make pacing and difficulty unpredictable. We constrained GPT-5.6 to a strict four-stage mission structure and JSON schema, generate once before play begins, and keep a tested fallback ready.

We also had to make players from all 47 prefectures feel important even when participation is uneven. Larger regions may bring more players, but every phone contributes to the same national objective. The shared screen keeps hometown representation visible without turning the final experience into regional winners and losers.

Finally, the entire onboarding path had to work in seconds. QR entry, nickname, prefecture selection, and launch are intentionally one straight line with no installation, account, GPS permission, or tutorial.

## Accomplishments that we're proud of

- A player can join in seconds and immediately affect a shared national experience.
- Phones and the projector stay synchronized in real time.
- Hometown identity remains visible while the outcome depends on cooperation.
- GPT-5.6 has a practical, reliable role in the product rather than being added as a generic chatbot.
- The complete multiplayer experience was taken from an empty repository to a working prototype during the hackathon sprint.

## What we learned

AI does not need to generate everything continuously to provide meaningful value. For a live multiplayer experience, reliability and pacing are essential. Structured generation gives us the creative benefits of AI without making the event unpredictable.

We also learned that location can create a strong sense of identity without collecting sensitive location data. Selecting a hometown prefecture is enough to make participation personal while respecting privacy.

Most importantly, cooperation becomes more powerful when players can see their individual action become part of something larger. Regional participation, shared energy, and the final attack make contribution visible and meaningful.

## What's next for Save Japan!

The next step is to expand Save Japan! into a reusable platform for festivals, schools, conferences, and public spaces. Planned additions include a detailed interactive Japan map, player names and hometown labels that follow each interceptor, smarter label positioning for crowded battles, more aircraft designs, accessibility options, organizer controls, and additional cooperative scenarios.

We also want to connect the energy created inside the game to real-world action. Future missions could encourage volunteering, disaster preparedness, community projects, and local support.

The UFO invasion is the beginning. The long-term goal is to turn shared excitement into lasting motivation to support local communities and build a stronger Japan together.

## Two-minute live experience

1. Open `/display`; the command screen and phones show the countdown to 21:00 JST.
2. Players scan the QR code and join from any mobile browser—no installation or account.
3. At 20:59 JST, GPT-5.6 prepares that day's fictional crisis and multilingual mission copy.
4. At 21:00 JST, the one worldwide game starts automatically.
5. Players complete three 20-second cooperative missions, followed by a 30-second boss phase that combines nationwide GENKI into the final attack.

## Run locally

Requires Node.js 20+. An OpenAI API key with access to GPT-5.6 enables generated daily scenarios; without it, the date-seeded fallback is used.

```bash
npm install
OPENAI_API_KEY=your_key npm start
```

Open `http://localhost:3000/display` on the shared screen and `http://localhost:3000` on phones. For a venue demo, expose port 3000 through a secure HTTPS tunnel or deploy the Node server to a service that supports WebSockets.

Local development follows the same 21:00 JST schedule. To test immediately, enter the Konami code on `/display` to reveal the debug controls, then use **START GAME**.

The app remains fully playable with a safe set of fallback missions if the API is temporarily unavailable.

## Deploy to Cloudflare

The production deployment uses one Cloudflare Worker and one named Cloudflare Container session. All HTTP and WebSocket traffic is pinned to that named singleton, preserving one worldwide Socket.IO game state. The application cap is `2` only so a replacement container revision can start while an old inactive revision drains during deployment.

Cloudflare Workers Paid with Containers enabled and a local Docker daemon capable of building `linux/amd64` images are required.

```bash
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy:cloudflare
```

The Worker forwards HTTP and WebSocket traffic to the Node.js container. Cloudflare Cron wakes the singleton at 20:59 JST to prepare the daily scenario and again at 21:00 JST to start the game. A Durable Object record prevents a second launch on the same Japanese calendar date, even if the container restarts.

## Built with Codex and GPT-5.6

- **Codex:** We used one primary Codex thread to turn the concept into the complete realtime product: product scoping, architecture, mobile UI, command-screen design, Socket.IO game state, safety fallback, testing, and documentation. Codex helped us reach an end-to-end multiplayer prototype within the first implementation sprint while we retained the core product and design decisions.
- **GPT-5.6:** GPT-5.6 is part of the live product, not just the development process. Before the daily 21:00 JST launch, it creates a unique fictional crisis, boss identity, and structured multilingual four-stage mission sequence. Strict JSON schema output keeps generation reliable for a live audience.

## Technical architecture

```text
Player phones ── Socket.IO actions ──▶ Authoritative Node.js game server
      ▲                                      │
      │                                      ├── phase timing and scoring
      │ realtime state                       ├── action throttling
      │                                      ├── GPT-5.6 daily scenario generation
      │                                      └── date-seeded fallback scenarios
      │
Projector command screen ◀──────── synchronized public game state
```

In production, a Cloudflare Worker and singleton Durable Object route every request and WebSocket connection to the same Cloudflare Container.

- **Player client:** mobile-first HTML, CSS, and JavaScript for registration, missions, attacks, haptics, and local sound effects.
- **Command screen:** a dedicated `/display` route for QR onboarding, the live Japan map, player arrivals, enemy attacks, mission state, and results.
- **Authoritative server:** Node.js, Express, and Socket.IO own the phase clock, player registry, scores, enemies, boss energy, and launch-vote threshold.
- **AI boundary:** the OpenAI Responses API produces one scenario and exactly four multilingual mission objects through a strict JSON schema. Generated durations are replaced with server-controlled values before use.
- **Graceful fallback:** missing credentials, API errors, or invalid generation never block play; a date-seeded scenario library changes the crisis from day to day.
- **Deployment:** `wrangler.jsonc`, `cloudflare/worker.js`, and `Dockerfile` define a singleton Node 22 Cloudflare Container, APAC placement, WebSocket forwarding, 20:59/21:00 JST Cron triggers, deterministic `npm ci` build, and `/health` check. `render.yaml` remains as an alternative WebSocket-capable deployment target.
- **Data model:** live battle state is intentionally ephemeral. The Durable Object stores only the most recent Japanese game date for one-launch-per-day enforcement; the app stores no accounts, passwords, GPS coordinates, or exact addresses.

## Reliability and safety

- The server—not the browser—decides whether an action is valid for the current phase.
- Player actions are throttled per socket to limit accidental double taps and basic action spam.
- Nicknames and prefecture values are normalized and length-bounded before entering shared state.
- Game timing is based on server timestamps and broadcast to every connected screen.
- The normal start and reset controls are disabled; the protected debug controls require the Konami-code unlock sequence.
- Cloudflare Cron starts the one worldwide game at 21:00 JST, and persistent daily-date storage rejects duplicate launches.
- AI generation occurs at 20:59 JST; it is not placed in the latency-sensitive action loop.
- Strict structured output and deterministic fallback content keep the live event playable when AI is unavailable.
- The deployment exposes a health endpoint and uses lockfile-based dependency installation.

## Prototype trust boundary and known limitations

This hackathon build now runs as a **single scheduled worldwide session**. Realtime battle state is held in one Node.js process and can reset if that process fails during the two-minute game; the daily launch record itself survives container restarts.

Before operating the platform as an unsupervised public service, we would add:

- authenticated operator roles beyond the current hidden debug unlock;
- production removal or compile-time disabling of the 60-player debug simulator;
- shared persistent state for multi-instance deployment and restart recovery;
- session isolation, reconnect recovery, abuse monitoring, and stricter rate limits;
- automated integration and load tests for venue-scale concurrency.

Keeping these limitations explicit separates the working event MVP from its production-hardening roadmap.

## Repository evidence

- `server.js` — authoritative state machine, validation, throttling, AI boundary, fallback behavior, and health route.
- `public/app.js` — player registration and realtime mobile controls.
- `public/display.js` — synchronized projector visualization and event rendering.
- `public/audio.js` and `assets/audio/` — lightweight synthesized/MIDI and sampled battle audio.
- `assets/sprites/` — transparent interceptor, missile, UFO, and explosion assets.
- `cloudflare/worker.js`, `wrangler.jsonc`, and `Dockerfile` — production Worker, singleton Container, and reproducible image configuration.
- `render.yaml` — alternative hosted deployment configuration.
- `assets/save-japan-demo.gif` — recorded end-to-end multiplayer demonstration.

## Team

- GOROman
- kiralpoon

## Hackathon scope

This repository was created during OpenAI Build Week. All implementation in this repository was produced during the submission period. See the timestamped Git history and the Codex `/feedback` Session ID in the Devpost submission for evidence.

## License

MIT
