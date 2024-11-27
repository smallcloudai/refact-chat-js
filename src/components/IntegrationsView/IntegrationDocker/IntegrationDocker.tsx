/* eslint-disable no-console */ // TODO: remove in the future
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  // useGetDockerContainersByImageQuery,
  useGetDockerContainersQuery,
} from "../../../hooks/useGetDockerContainersQuery";
import { DockerActionPayload, DockerContainer } from "../../../services/refact";
import { Spinner } from "../../Spinner";
import { useExecuteActionForDockerContainerMutation } from "../../../hooks/useExecuteActionForDockerContainer";
import { useAppDispatch } from "../../../hooks";
import { setInformation } from "../../../features/Errors/informationSlice";
import { setError } from "../../../features/Errors/errorsSlice";
import { Button } from "@radix-ui/themes";

type IntegrationDockerProps = {
  dockerImage: string;
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
  dockerImage,
}) => {
  const dispatch = useAppDispatch();
  // const { dockerContainers } = useGetDockerContainersByImageQuery(dockerImage);
  const { dockerContainers } = useGetDockerContainersQuery();
  const [dockerContainerActionTrigger] =
    useExecuteActionForDockerContainerMutation();
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    DockerActionPayload["action"] | null
  >(null);

  const [dockerContainersList, setDockerContainersList] = useState<
    DockerContainer[] | null
  >(null);

  useEffect(() => {
    console.log(dockerContainers);

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
        {dockerImage}&quot; image
      </div>
    );
  }

  if (!dockerContainersList || dockerContainersList.length === 0) {
    return <div>No docker containers found for &quot;{dockerImage}&quot;</div>;
  }

  const handleActionClick = async (payload: DockerActionPayload) => {
    setIsActionInProgress(true);
    setCurrentAction(payload.action);
    const response = await dockerContainerActionTrigger({
      container: payload.container,
      action: payload.action,
    }).unwrap();

    if (response.success) {
      dispatch(
        setInformation(
          `Action ${payload.action} was successfully executed on ${payload.container} container`,
        ),
      );
    } else {
      dispatch(
        setError(
          `Action ${payload.action} failed to execute on ${payload.container} container`,
        ),
      );
    }
    setIsActionInProgress(false);
    setCurrentAction(null);
  };

  return (
    <div>
      {DOCKER_ACTIONS.map((dockerActionButton) => (
        <Button
          key={dockerActionButton.label}
          type="button"
          variant="outline"
          color="green"
          disabled={isActionInProgress}
          onClick={() =>
            void handleActionClick({
              container:
                "900872e6244a74afcecc41a2a168cb9b54c3268ffafd3df221240c8b47c6c4cc",
              action: dockerActionButton.action,
            })
          }
        >
          {currentAction === dockerActionButton.action
            ? dockerActionButton.loadingLabel
            : dockerActionButton.label}
        </Button>
      ))}
    </div>
  );
};
