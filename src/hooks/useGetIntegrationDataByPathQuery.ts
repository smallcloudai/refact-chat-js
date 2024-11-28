import { integrationsApi } from "../services/refact/integrations";
import { useGetPing } from "./useGetPing";
import {
  addToCacheOnMiss,
  maybeSelectIntegrationFromCache,
} from "../features/Integrations/integrationsSlice";
import { useAppDispatch } from "./useAppDispatch";
import { useEffect } from "react";
import { useAppSelector } from "./useAppSelector";

export const useGetIntegrationDataByPathQuery = (integrationPath: string) => {
  const ping = useGetPing();
  const skip = !ping.data;
  const dispatch = useAppDispatch();

  const integration = integrationsApi.useGetIntegrationByPathQuery(
    integrationPath,
    {
      skip,
    },
  );

  // cached values
  useEffect(() => {
    if (integration.data) {
      dispatch(addToCacheOnMiss(integration.data));
    }
  }, [dispatch, integration.data]);

  const cacheValues = useAppSelector((state) =>
    maybeSelectIntegrationFromCache(state, integration.data),
  );

  // TBD: add other methods for checking values here or else where?

  return {
    integration,
    cacheValues,
  };
};
