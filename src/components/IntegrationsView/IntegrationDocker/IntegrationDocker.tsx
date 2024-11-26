/* eslint-disable no-console */ // TODO: remove in the future
import { useEffect } from "react";
import { useGetDockerContainersQuery } from "../../../hooks/useGetDockerContainersQuery";

export const IntegrationDocker = () => {
  const { containers } = useGetDockerContainersQuery();

  useEffect(() => {
    console.log(containers);

    if (containers.data) {
      console.log(`[DEBUG]: loaded containers: `, containers.data);
    }
  }, [containers]);

  // if (containers.error ?? !containers.data) {
  //   return <div>Error or no data</div>;
  // }

  return <div>IntegrationDocker</div>;
};
