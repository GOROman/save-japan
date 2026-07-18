# Save Japan!

<p align="center">
  <img src="assets/save-japan-key-art.png" alt="Save Japan! — nationwide cooperative UFO defense game" width="760">
</p>

## Demo

<p align="center">
  <img src="assets/save-japan-demo.gif" alt="Save Japan! live multiplayer demo" width="560">
</p>

**Reignite Japan's spirit—one hometown at a time.**

Japan once astonished the world with its energy, imagination, and shared belief in a brighter future. Today, many people feel that confidence and connection fading. **Save Japan!** asks a hopeful question: what if we could awaken that spirit again—not by returning to the past, but by bringing its courage, creativity, and solidarity into the future?

Save Japan! turns a room full of strangers into one nationwide defense team for an intense 60-second mission. Players scan a QR code, choose a nickname and their home prefecture, receive a unique interceptor, and complete four live cooperative missions to defend Japan from a UFO invasion. A shared command screen visualizes the participating regions and the country's combined progress.

## Inspiration

Save Japan! was inspired by a simple question: **how can we turn people's love for their hometown and for Japan into a shared feeling of action?**

Many digital experiences focus on individual competition. We wanted to create something different: a nationwide cooperative experience where people from every prefecture work toward one goal. The UFO invasion is fictional, but the emotion behind the project is real. We want players to feel that their participation matters, that their hometown matters, and that Japan becomes stronger when people act together.

The Showa era is remembered by many as a time when Japan was filled with momentum: communities were growing, bold ideas felt possible, and people shared confidence in tomorrow. We do not want to recreate the past. We want to carry its best qualities—courage, creativity, and solidarity—into the future.

Defending Japan inside the game is the first step. The larger vision is to awaken motivation, strengthen community spirit, and inspire people to contribute to Japan in the real world.

> **47 prefectures. One shared future. Let's make Japan shine again.**

## What it does

Save Japan! is a cooperative mobile game that brings a live audience together to defend Japan from a UFO invasion.

Players scan a QR code, enter a nickname, and select their hometown prefecture. No GPS, exact address, account, or app installation is required. Each player receives an interceptor on their phone, while the shared command screen immediately shows new arrivals, participating regions, regional activity, and nationwide progress.

Players complete a four-stage mission sequence created with GPT-5.6. The sequence moves from regional pride to cross-region support, a coordinated attack, and a nationwide final defense. Every action from every phone contributes to the same shared objective.

During the climax, all players receive the same final command and press **DEFEND!** together. Energy from the participating prefectures combines to save Japan. The goal is not for one prefecture to defeat the others: the final outcome depends on nationwide cooperation.

## How we built it

We designed Save Japan! as one synchronized experience across a projector and the audience's smartphones.

The mobile browser handles instant registration, hometown selection, mission instructions, personal contribution, haptic feedback, and the final command. The shared screen handles QR onboarding, new-player arrivals, regional participation, the UFO battle, mission progress, and the final result. Socket.IO synchronizes every action in real time without requiring accounts or a database.

GPT-5.6 uses structured output to create a reliable four-mission sequence informed by the prefectures in the room. A validated fallback sequence keeps the live game playable if generation is unavailable. Codex supported product scoping, architecture, implementation, debugging, visual design, testing, and documentation in one primary development thread.

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

## 60-second live demo flow

1. Open `/display` on the projector.
2. Players scan the QR code and join from any mobile browser.
3. The host starts the defense. GPT-5.6 creates four missions based on the prefectures present.
4. Every tap contributes live across four timed stages.
5. In the final ten seconds, all regions unite to save Japan.

## Run locally

Requires Node.js 20+ and an OpenAI API key with access to GPT-5.6.

```bash
npm install
OPENAI_API_KEY=your_key npm start
```

Open `http://localhost:3000/display` on the shared screen and `http://localhost:3000` on phones. For a venue demo, expose port 3000 through a secure HTTPS tunnel or deploy the Node server to a service that supports WebSockets.

The app remains fully playable with a safe set of fallback missions if the API is temporarily unavailable.

## Built with Codex and GPT-5.6

- **Codex:** We used one primary Codex thread to turn the concept into the complete realtime product: product scoping, architecture, mobile UI, command-screen design, Socket.IO game state, safety fallback, testing, and documentation. Codex helped us reach an end-to-end multiplayer prototype within the first implementation sprint while we retained the core product and design decisions.
- **GPT-5.6:** GPT-5.6 is part of the live product, not just the development process. At the start of each game it receives the actual set of participating prefectures and creates a structured four-stage cooperative mission sequence: regional pride, cross-region support, coordinated attack, and final synchronized defense. Strict JSON schema output keeps generation reliable for a live audience.

## Architecture

- Mobile-first browser client (HTML/CSS/JavaScript)
- Projector command screen at `/display`
- Node.js + Express
- Socket.IO realtime multiplayer state
- OpenAI Responses API with GPT-5.6 structured output
- No accounts, database, or personal data retention

## Team

- GOROman
- kiralpoon

## Hackathon scope

This repository was created during OpenAI Build Week. All implementation in this repository was produced during the submission period. See the timestamped Git history and the Codex `/feedback` Session ID in the Devpost submission for evidence.

## License

MIT
