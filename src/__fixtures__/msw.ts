import { http, HttpResponse, type HttpHandler } from "msw";
import { STUB_CAPS_RESPONSE } from "./caps";
import { SYSTEM_PROMPTS } from "./prompts";
import { STUB_LINKS_FOR_CHAT_RESPONSE } from "./chat_links_response";
import {
  AT_TOOLS_AVAILABLE_URL,
  CHAT_LINKS_URL,
  KNOWLEDGE_SUB_URL,
} from "../services/refact/consts";
import { STUB_TOOL_RESPONSE } from "./tools_response";
import { STUB_SUB_RESPONSE, STUB_SUB_RESPONSE_WITH_STATUS } from "./knowledge";

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

export const nonProUser: HttpHandler = http.get(
  "https://www.smallcloud.ai/v1/login",
  () => {
    return HttpResponse.json({
      retcode: "OK",
      account: "party@refact.ai",
      inference_url: "https://www.smallcloud.ai/v1",
      inference: "FREE",
      metering_balance: -100000,
      questionnaire: {},
    });
  },
);

export const chatLinks: HttpHandler = http.post(
  `http://127.0.0.1:8001${CHAT_LINKS_URL}`,
  () => {
    return HttpResponse.json(STUB_LINKS_FOR_CHAT_RESPONSE);
  },
);

export const goodTools: HttpHandler = http.get(
  `http://127.0.0.1:8001${AT_TOOLS_AVAILABLE_URL}`,
  () => {
    return HttpResponse.json(STUB_TOOL_RESPONSE);
  },
);

export const knowLedgeLoading: HttpHandler = http.post(
  `http://127.0.0.1:8001${KNOWLEDGE_SUB_URL}`,
  async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Encode the string chunks using "TextEncoder".
        STUB_SUB_RESPONSE.forEach((item) => {
          const str = `data: ${JSON.stringify(item)}\n\n`;
          controller.enqueue(encoder.encode(str));
        });

        controller.close();
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
);

export const KnowledgeWithStatus: HttpHandler = http.post(
  `http://127.0.0.1:8001${KNOWLEDGE_SUB_URL}`,
  () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Encode the string chunks using "TextEncoder".
        for (const item of STUB_SUB_RESPONSE_WITH_STATUS) {
          const str = `data: ${JSON.stringify(item)}\n\n`;
          controller.enqueue(encoder.encode(str));
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 1-second delay
        }

        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
);
