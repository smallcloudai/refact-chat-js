import { afterAll, afterEach, beforeAll } from "vitest";
import { http, HttpResponse, type HttpHandler } from "msw";
import { setupServer } from "msw/node";
import { SYSTEM_PROMPTS } from "../__fixtures__/prompts";
import { STUB_CAPS_RESPONSE } from "../__fixtures__/caps";
import type { Store } from "../app/store";
import {
  capsApi,
  statisticsApi,
  promptsApi,
  toolsApi,
  commandsApi,
  pingApi,
} from "../services/refact";

export const resetApi = (store: Store) => {
  store.dispatch(capsApi.util.resetApiState());
  store.dispatch(statisticsApi.util.resetApiState());
  store.dispatch(promptsApi.util.resetApiState());
  store.dispatch(toolsApi.util.resetApiState());
  store.dispatch(commandsApi.util.resetApiState());
  store.dispatch(pingApi.util.resetApiState());
};
export const server = setupServer();

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  // Reset any runtime handlers tests may use.
  server.resetHandlers();
});

afterAll(() => {
  // Clean up once the tests are done.
  server.close();
});

export const goodPing: HttpHandler = http.get(
  "http://127.0.0.1:8001/v1/ping",
  () => {
    return HttpResponse.text("pong");
  },
);

export const goodCaps: HttpHandler = http.get(
  "http://127.0.0.1:8001/v1/caps",
  () => {
    return HttpResponse.json(STUB_CAPS_RESPONSE);
  },
);

export const noTools: HttpHandler = http.get(
  "http://127.0.0.1:8001/v1/tools",
  () => {
    return HttpResponse.json([]);
  },
);

export const goodPrompts: HttpHandler = http.get(
  "http://127.0.0.1:8001/v1/customization",
  () => {
    return HttpResponse.json({ system_prompts: SYSTEM_PROMPTS });
  },
);

export const noCompletions: HttpHandler = http.post(
  "http://127.0.0.1:8001/v1/at-command-completion",
  () => {
    return HttpResponse.json({
      completions: [],
      replace: [0, 0],
      is_cmd_executable: false,
    });
  },
);

export const noCommandPreview: HttpHandler = http.post(
  "http://127.0.0.1:8001/v1/at-command-preview",
  () => {
    return HttpResponse.json({
      messages: [],
    });
  },
);

export const goodUser: HttpHandler = http.get(
  "https://www.smallcloud.ai/v1/login",
  () => {
    return HttpResponse.json({
      retcode: "OK",
      account: "party@refact.ai",
      inference_url: "https://www.smallcloud.ai/v1",
      inference: "PRO",
      metering_balance: -100000,
      questionnaire: {},
    });
  },
);
