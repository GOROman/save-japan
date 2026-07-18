# Save Japan!

**Reignite Japan's spirit—one hometown at a time.**

Japan once astonished the world with its energy, imagination, and shared belief in a brighter future. Today, many people feel that confidence and connection fading. **Save Japan!** asks a hopeful question: what if we could awaken that spirit again—not by returning to the past, but by bringing its courage, creativity, and solidarity into the future?

Save Japan! turns a room full of strangers into one nationwide defense team in under 30 seconds. Players scan a QR code, choose a nickname and their home prefecture, receive a unique interceptor, and complete four live cooperative missions to defend Japan from a UFO invasion. A shared command screen visualizes the participating regions and the country's combined progress.

## Why it matters

### From nostalgia to action

The Showa era is remembered by many as a time when Japan was filled with momentum: communities were growing, bold ideas felt possible, and people shared confidence in tomorrow. We do not want to recreate the past. We want to carry its best qualities forward.

Japan's real challenges cannot be solved by one city or one person. This playful three-minute experience transforms hometown pride into cooperation rather than division. Every prefecture has a role. Every action matters. Victory is possible only when participants look beyond their own region and support the whole country.

Saving Japan in the game is only the first step. The larger goal is to help people rediscover confidence in their communities, in Japan, and in one another—then carry that energy into the real world.

> **47 prefectures. One shared future. Let's make Japan shine again.**

## Live demo flow

1. Open `/display` on the projector.
2. Players scan the QR code and join from any mobile browser.
3. The host starts the defense. GPT-5.6 creates four missions based on the prefectures present.
4. Every tap contributes live to the shared objective.
5. All regions unite for the synchronized final defense.

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
