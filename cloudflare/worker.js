import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

const DAILY_CONTAINER_NAME = "save-japan-daily-v2";

function getDailyContainer(environment) {
  return getContainer(environment.SAVE_JAPAN, DAILY_CONTAINER_NAME);
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
  };

  async fetch(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/__daily-")) return super.fetch(request);
    if (request.headers.get("x-save-japan-scheduler") !== "cloudflare-cron")
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
        headers: request.headers,
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
    headers.delete("x-save-japan-scheduler");
    headers.delete("x-save-japan-date");
    headers.delete("x-save-japan-scheduled-at");
    headers.set("x-forwarded-proto", url.protocol.slice(0, -1));
    headers.set("x-forwarded-host", url.host);

    const forwardedRequest = new Request(request, { headers });
    return getDailyContainer(environment).fetch(forwardedRequest);
  },

  async scheduled(controller, environment, ctx) {
    const scheduledAt = controller.scheduledTime;
    const dateKey = new Date(scheduledAt + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const action = controller.cron === "59 11 * * *" ? "prepare" : "start";
    const request = new Request(`https://save-japan.internal/__daily-${action}`, {
      method: "POST",
      headers: {
        "x-save-japan-scheduler": "cloudflare-cron",
        "x-save-japan-date": dateKey,
        "x-save-japan-scheduled-at": String(scheduledAt),
      },
    });
    ctx.waitUntil(getDailyContainer(environment).fetch(request));
  },
};
