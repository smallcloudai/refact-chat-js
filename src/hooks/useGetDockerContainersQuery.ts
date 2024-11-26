import { dockerApi } from "../services/refact/docker";
import { useGetPing } from "./useGetPing";

export const useGetDockerContainersQuery = () => {
  const ping = useGetPing();
  const skip = !ping.data;
  const containers = dockerApi.useGetAllDockerContainersQuery(undefined, {
    skip,
  });

  return {
    containers,
  };
};
