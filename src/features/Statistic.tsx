import React from "react";
import { Flex, Button, Responsive } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useConfig } from "../contexts/config-context";
import { ScrollArea } from "../components/ScrollArea";
import { useEventBusForStatistic } from "../hooks";
import { StatisticView } from "../components/StatisticView/StatisticView";

export const Statistic: React.FC<{
  onCloseStatistic?: () => void;
}> = ({ onCloseStatistic }) => {
  const { host, tabbed } = useConfig();
  const { backFromStatistic, state } = useEventBusForStatistic();
  const LeftRightPadding: Responsive<
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  > =
    host === "web"
      ? { initial: "2", xl: "9" }
      : {
          initial: "2",
          xs: "2",
          sm: "4",
          md: "8",
          lg: "8",
          xl: "9",
        };

  const TopBottomPadding: Responsive<
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  > = {
    initial: "5",
  };

  return (
    <Flex
      direction="column"
      justify="between"
      grow="1"
      pl={LeftRightPadding}
      pt={TopBottomPadding}
      pb={TopBottomPadding}
      style={{
        height: "100dvh",
      }}
    >
      {host === "vscode" && !tabbed ? (
        <Flex gap="2" pb="3">
          <Button variant="surface" onClick={backFromStatistic}>
            <ArrowLeftIcon width="16" height="16" />
            Back
          </Button>
        </Flex>
      ) : (
        <Button mr="auto" variant="outline" onClick={onCloseStatistic} mb="4">
          Back
        </Button>
      )}
      <ScrollArea scrollbars="vertical">
        <Flex
          direction="column"
          justify="between"
          grow="1"
          mr={LeftRightPadding}
          style={{
            width: "inherit",
          }}
        >
          <StatisticView
            statisticData={state.statisticData}
            isLoading={state.isLoading}
            error={state.error}
            fimFiles={state.fill_in_the_middle}
          />
        </Flex>
      </ScrollArea>
    </Flex>
  );
};
