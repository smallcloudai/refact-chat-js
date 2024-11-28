import {
  Badge,
  Card,
  Code,
  DataList,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
} from "@radix-ui/themes";
import { DockerActionPayload, DockerContainer } from "../../../services/refact";
import type { FC } from "react";
import { CopyIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { toPascalCase } from "../../../utils/toPascalCase";
import { Markdown } from "../../Markdown";
import { Link } from "../../Link";
import { fallbackCopying } from "../../../utils/fallbackCopying";
import { TruncateRight } from "../../Text/TruncateRight";

type DockerContainerCardProps = {
  container: DockerContainer;
  currentContainerAction: DockerActionPayload | null;
  isActionInProgress: boolean;
  handleDockerContainerActionClick: (
    payload: DockerActionPayload,
  ) => Promise<void>;
};

const DOCKER_ACTIONS: (Omit<DockerActionPayload, "container"> & {
  label: string;
  loadingLabel: string;
})[] = [
  {
    label: "Start container",
    loadingLabel: "Starting...",
    action: "start",
  },
  {
    label: "Stop container",
    loadingLabel: "Stopping...",
    action: "stop",
  },
  {
    label: "Kill container",
    loadingLabel: "Killing...",
    action: "kill",
  },
  {
    label: "Remove container",
    loadingLabel: "Removing...",
    action: "remove",
  },
];

export const DockerContainerCard: FC<DockerContainerCardProps> = ({
  container,
  currentContainerAction,
  isActionInProgress,
  handleDockerContainerActionClick,
}) => {
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

  const handleClickOnAction = ({
    container,
    action,
  }: {
    container: string;
    action: DockerActionPayload["action"];
  }) => {
    void handleDockerContainerActionClick({
      container,
      action,
    });
  };

  const formattedMarkdown = (text: string) => {
    return "```" + text + "```";
  };

  return (
    <Card key={container.id}>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="4">
          <Flex justify="between">
            <Heading as="h6" size="4">
              <Flex align="center" gap="3">
                Container{" "}
                <Markdown>{formattedMarkdown(container.name)}</Markdown>
              </Flex>
            </Heading>
            {/* actions for containers */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton variant="outline" color="gray" size="1">
                  <DotsVerticalIcon />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content size="1" side="bottom" align="end">
                {DOCKER_ACTIONS.map((dockerActionButton) => {
                  const action = dockerActionButton.action;
                  const label =
                    currentContainerAction?.action ===
                      dockerActionButton.action &&
                    currentContainerAction.container === container.name
                      ? dockerActionButton.loadingLabel
                      : dockerActionButton.label;

                  return (
                    <DropdownMenu.Item
                      key={dockerActionButton.label}
                      disabled={isDockerActionButtonDisabled(container, action)}
                      onClick={() =>
                        handleClickOnAction({
                          container: container.name,
                          action: dockerActionButton.action,
                        })
                      }
                      color={
                        dockerActionButton.action !== "start"
                          ? "red"
                          : undefined
                      }
                    >
                      {label}
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
          <DataList.Root size="1">
            <DataList.Item align="center">
              <DataList.Label minWidth="60px">Status</DataList.Label>
              <DataList.Value>
                <Badge
                  color={container.status !== "running" ? "gray" : "jade"}
                  variant="soft"
                  radius="large"
                >
                  {toPascalCase(container.status)}
                </Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
              <DataList.Label minWidth="60px">Image</DataList.Label>
              <DataList.Value>{container.image}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Flex>
        <Flex direction="column" gap="4">
          <Heading as="h5" size="4">
            Environment variables
          </Heading>
          <DataList.Root size="1">
            {Object.values(container.env).map((value) => {
              const [variableName, variableValue] = value.split("=");
              if (variableValue.startsWith("http")) {
                return (
                  <DataList.Item key={variableName}>
                    <DataList.Label>{variableName}: </DataList.Label>
                    <DataList.Value>
                      <TruncateRight
                        size="1"
                        style={{
                          width: "100%",
                        }}
                        title={variableValue}
                      >
                        <Link href={variableValue}>{variableValue}</Link>
                      </TruncateRight>
                    </DataList.Value>
                  </DataList.Item>
                );
              }
              return (
                <DataList.Item key={variableName}>
                  <DataList.Label>{variableName}: </DataList.Label>
                  <DataList.Value>
                    <Flex align="center" gap="2" maxWidth="100%">
                      <TruncateRight
                        size="1"
                        style={{
                          width: "100%",
                        }}
                        title={variableValue}
                      >
                        <Code
                          variant="ghost"
                          style={{
                            width: "100%",
                          }}
                        >
                          {variableValue}
                        </Code>
                      </TruncateRight>
                      <IconButton
                        size="1"
                        title="Copy value"
                        color="gray"
                        variant="ghost"
                        onClick={() => fallbackCopying(variableValue)}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Flex>
                  </DataList.Value>
                </DataList.Item>
              );
            })}
          </DataList.Root>
        </Flex>
      </Flex>
    </Card>
  );
};
