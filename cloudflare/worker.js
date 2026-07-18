import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

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
}

export default {
  async fetch(request, environment) {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.set("x-forwarded-proto", url.protocol.slice(0, -1));
    headers.set("x-forwarded-host", url.host);

    const forwardedRequest = new Request(request, { headers });
    return getContainer(environment.SAVE_JAPAN).fetch(forwardedRequest);
  },
};
