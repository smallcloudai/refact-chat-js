/* eslint-disable no-console */ // TODO: remove in the future
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  useGetDockerContainersByImageQuery,
  // useGetDockerContainersQuery,
} from "../../../hooks/useGetDockerContainersQuery";
import { dockerApi } from "../../../services/refact";
import type {
  DockerActionResponse,
  DockerActionPayload,
  DockerContainer,
  SchemaDocker,
} from "../../../services/refact";
import { Spinner } from "../../Spinner";
import { useExecuteActionForDockerContainerMutation } from "../../../hooks/useExecuteActionForDockerContainer";
import { useAppDispatch } from "../../../hooks";
import { setInformation } from "../../../features/Errors/informationSlice";
import { setError } from "../../../features/Errors/errorsSlice";
import { Flex } from "@radix-ui/themes";
import { DockerContainerCard } from "./DockerContainerCard";

type IntegrationDockerProps = {
  dockerData: SchemaDocker;
};

export const IntegrationDocker: FC<IntegrationDockerProps> = ({
  dockerData,
}) => {
  const dispatch = useAppDispatch();
  const { dockerContainers } = useGetDockerContainersByImageQuery(
    dockerData.filter_image,
  );
  // const { dockerContainers } = useGetDockerContainersQuery();
  const [dockerContainerActionTrigger] =
    useExecuteActionForDockerContainerMutation();
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [currentContainerAction, setCurrentContainerAction] =
    useState<DockerActionPayload | null>(null);

  const [dockerContainersList, setDockerContainersList] = useState<
    DockerContainer[] | null
  >(null);

  useEffect(() => {
    console.log(`[DEBUG]: dockerContainers: `, dockerContainers);

    if (dockerContainers.data) {
      console.log(`[DEBUG]: loaded containers: `, dockerContainers.data);
      setDockerContainersList(dockerContainers.data.containers);
    }
  }, [dockerContainers]);

  if (dockerContainers.isLoading) {
    return <Spinner spinning />;
  }

  if (dockerContainers.error ?? !dockerContainers.data) {
    return (
      <div>
        Unexpected error on fetching list of docker containers with &quot;
        {dockerData.filter_image}&quot; image
      </div>
    );
  }

  if (!dockerContainersList || dockerContainersList.length === 0) {
    return (
      <div>
        No docker containers found for &quot;{dockerData.filter_image}&quot;
      </div>
    );
  }

  const handleDockerContainerActionClick = async (
    payload: DockerActionPayload,
  ) => {
    setIsActionInProgress(true);
    setCurrentContainerAction(payload);

    const response = await dockerContainerActionTrigger({
      container: payload.container,
      action: payload.action,
    });

    if (response.error) {
      resetActionState();
      return;
    }

    handleResponse(response.data, payload);
    resetActionState();
  };

  const resetActionState = () => {
    setIsActionInProgress(false);
    setCurrentContainerAction(null);
  };

  const handleResponse = (
    data: DockerActionResponse,
    payload: DockerActionPayload,
  ) => {
    if (data.success) {
      dispatch(
        setInformation(
          `Action ${payload.action} was successfully executed on ${payload.container} container`,
        ),
      );
      dispatch(dockerApi.util.resetApiState());
    } else {
      dispatch(
        setError(
          `Action ${payload.action} failed to execute on ${payload.container} container`,
        ),
      );
    }
  };

  return (
    <Flex direction="column" gap="4" width="100%">
      {dockerContainersList.map((el) => (
        <DockerContainerCard
          key={el.id}
          container={el}
          currentContainerAction={currentContainerAction}
          isActionInProgress={isActionInProgress}
          handleDockerContainerActionClick={handleDockerContainerActionClick}
        />
      ))}
    </Flex>
  );
};
