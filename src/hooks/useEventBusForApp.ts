import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { isOpenExternalUrl, isSetupHost } from "../events";
import { useAppDispatch, useConfig } from "../app/hooks";
import { update as updateConfig } from "../features/Config/reducer";

export function useEventBusForApp() {
  const config = useConfig();
  const [addressURL, setAddressURL] = useLocalStorage("lspUrl", "");
  const [apiKey, setApiKey] = useLocalStorage("apiKey", "");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (config.host !== "web") {
      // eslint-disable-next-line no-console
      console.log("not web");
      return;
    }
    const listener = (event: MessageEvent) => {
      if (event.source !== window) {
        return;
      }

      if (isOpenExternalUrl(event.data)) {
        const { url } = event.data.payload;
        window.open(url, "_blank")?.focus();
      }

      if (isSetupHost(event.data)) {
        const { host } = event.data.payload;
        if (host.type === "cloud") {
          setAddressURL("Refact");
          setApiKey(host.apiKey);
        } else if (host.type === "self") {
          setAddressURL(host.endpointAddress);
          setApiKey("any-will-work-for-local-server");
        } else {
          setAddressURL(host.endpointAddress);
          setApiKey(host.apiKey);
        }
        dispatch(updateConfig({ addressURL, apiKey }));
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, [setApiKey, setAddressURL, config.host, dispatch, addressURL, apiKey]);

  useEffect(() => {
    dispatch(updateConfig({ addressURL, apiKey }));
  }, [apiKey, addressURL, dispatch]);
}