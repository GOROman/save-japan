import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

const DAILY_CONTAINER_NAME = "save-japan-daily-v3";
const SCHEDULER_HEADER = "x-save-japan-scheduler";
const CLIENT_SCHEDULER_HEADERS = [
  SCHEDULER_HEADER,
  "x-save-japan-date",
  "x-save-japan-scheduled-at",
];

function getDailyContainer(environment) {
  return getContainer(environment.SAVE_JAPAN, DAILY_CONTAINER_NAME);
}

function readSchedulerSecret(source) {
  const secret = source?.SCHEDULER_SECRET;
  return typeof secret === "string" && secret.length > 0 ? secret : "";
}

async function schedulerAuthorized(provided, expected) {
  if (!expected) return false;
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided ?? "")),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

function stripClientSchedulerHeaders(headers) {
  for (const name of CLIENT_SCHEDULER_HEADERS) headers.delete(name);
}

export class SaveJapanContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "30m";
  envVars = {
    PORT: "3000",
    NODE_ENV: "production",
    ...(env.OPENAI_API_KEY
      ? { OPENAI_API_KEY: String(env.OPENAI_API_KEY) }
      : {}),
    ...(readSchedulerSecret(env)
      ? { SCHEDULER_SECRET: readSchedulerSecret(env) }
      : {}),
  };

  async fetch(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/__daily-")) return super.fetch(request);
    const secret = readSchedulerSecret(this.env) || readSchedulerSecret(env);
    if (!(await schedulerAuthorized(request.headers.get(SCHEDULER_HEADER), secret)))
      return new Response("Not found", { status: 404 });

    const dateKey = request.headers.get("x-save-japan-date");
    const action = url.pathname === "/__daily-prepare" ? "prepare" : "start";
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey))
      return Response.json({ ok: false, error: "date_required" }, { status: 400 });

    if (action === "start") {
      const lastGameDate = await this.ctx.storage.get("lastDailyGameDate");
      if (lastGameDate === dateKey)
        return Response.json({
          ok: true,
          started: false,
          dateKey,
          reason: "already_started",
        });
    }

    const containerUrl = new URL(request.url);
    containerUrl.pathname = `/internal/daily-${action}`;
    const response = await this.containerFetch(
      new Request(containerUrl, {
        method: "POST",
        headers: {
          [SCHEDULER_HEADER]: secret,
          "x-save-japan-date": dateKey,
          "x-save-japan-scheduled-at":
            request.headers.get("x-save-japan-scheduled-at") || "",
        },
      }),
    );
    if (action === "start" && response.ok) {
      const result = await response.clone().json();
      if (result.started) await this.ctx.storage.put("lastDailyGameDate", dateKey);
    }
    return response;
  }
}

export default {
  async fetch(request, environment) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/__daily-") || url.pathname.startsWith("/internal/"))
      return new Response("Not found", { status: 404 });
    const headers = new Headers(request.headers);
    stripClientSchedulerHeaders(headers);
    headers.set("x-forwarded-proto", url.protocol.slice(0, -1));
    headers.set("x-forwarded-host", url.host);

    const forwardedRequest = new Request(request, { headers });
    return getDailyContainer(environment).fetch(forwardedRequest);
  },

  async scheduled(controller, environment, ctx) {
    const secret = readSchedulerSecret(environment);
    if (!secret) {
      console.error(
        JSON.stringify({
          message: "daily cron refused",
          reason: "SCHEDULER_SECRET unset",
        }),
      );
      return;
    }
    const scheduledAt = controller.scheduledTime;
    const dateKey = new Date(scheduledAt + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const action = controller.cron === "59 11 * * *" ? "prepare" : "start";
    const request = new Request(`https://save-japan.internal/__daily-${action}`, {
      method: "POST",
      headers: {
        [SCHEDULER_HEADER]: secret,
        "x-save-japan-date": dateKey,
        "x-save-japan-scheduled-at": String(scheduledAt),
      },
    });
    ctx.waitUntil(getDailyContainer(environment).fetch(request));
  },
};
