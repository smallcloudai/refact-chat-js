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
import { Button, Card, Flex, Heading } from "@radix-ui/themes";

type IntegrationDockerProps = {
  dockerData: SchemaDocker;
};

const DOCKER_ACTIONS: (Omit<DockerActionPayload, "container"> & {
  label: string;
  loadingLabel: string;
})[] = [
  {
    label: "Start",
    loadingLabel: "Starting...",
    action: "start",
  },
  {
    label: "Stop",
    loadingLabel: "Stopping...",
    action: "stop",
  },
  {
    label: "Kill",
    loadingLabel: "Killing...",
    action: "kill",
  },
  {
    label: "Remove",
    loadingLabel: "Removing...",
    action: "remove",
  },
];

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

  // needed to handle disabled state of buttons accordingly to the status of docker container
  const isDockerActionButtonDisabled = (
    el: DockerContainer,
    action: string,
  ) => {
    return (
      (isActionInProgress && currentContainerAction?.container === el.name) ||
      (el.status === "running" && action === "start") ||
      (el.status === "exited" && (action === "stop" || action === "kill"))
    );
  };

  return (
    <Flex direction="column" gap="4" width="100%">
      {dockerContainersList.map((el) => (
        <Card key={el.id}>
          <Flex direction="column" gap="4">
            <Heading as="h5">Container {el.name}</Heading>
            {/* actions for containers */}
            <Flex gap="1">
              {DOCKER_ACTIONS.map((dockerActionButton) => {
                const action = dockerActionButton.action;
                const label =
                  currentContainerAction &&
                  currentContainerAction.action === dockerActionButton.action &&
                  currentContainerAction.container === el.name
                    ? dockerActionButton.loadingLabel
                    : dockerActionButton.label;

                return (
                  <Button
                    key={dockerActionButton.label}
                    type="button"
                    variant="outline"
                    color="green"
                    disabled={isDockerActionButtonDisabled(el, action)}
                    onClick={() =>
                      void handleDockerContainerActionClick({
                        container: el.name,
                        action: dockerActionButton.action,
                      })
                    }
                  >
                    {label}
                  </Button>
                );
              })}
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};
