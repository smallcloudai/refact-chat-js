import { FC, useCallback } from "react";
import { Config } from "../Config/configSlice";
import { PageWrapper } from "../../components/PageWrapper";
import { Button, Flex, ScrollArea } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { ChatRawJSON } from "../../components/ChatRawJSON";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getChatById } from "../History/historySlice";
import { copyChatHistoryToClipboard } from "../../utils/copyChatHistoryToClipboard";
import { clearError, getErrorMessage, setError } from "../Errors/errorsSlice";
import {
  clearInformation,
  getInformationMessage,
  setInformation,
} from "../Errors/informationSlice";
import {
  ErrorCallout,
  InformationCallout,
} from "../../components/Callout/Callout";

type ThreadHistoryProps = {
  onCloseThreadHistory: () => void;
  backFromThreadHistory: () => void;
  host: Config["host"];
  tabbed: Config["tabbed"];
  chatId: string;
};

export const ThreadHistory: FC<ThreadHistoryProps> = ({
  onCloseThreadHistory,
  backFromThreadHistory,
  host,
  tabbed,
  chatId,
}) => {
  const LeftRightPadding =
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

  const dispatch = useAppDispatch();

  const historyThread = useAppSelector((state) => getChatById(state, chatId), {
    devModeChecks: { stabilityCheck: "never" },
  });

  const error = useAppSelector(getErrorMessage);
  const information = useAppSelector(getInformationMessage);

  const onClearError = useCallback(() => dispatch(clearError()), [dispatch]);
  const onClearInformation = useCallback(
    () => dispatch(clearInformation()),
    [dispatch],
  );

  const handleCopyToClipboardJSON = useCallback(() => {
    if (!historyThread) {
      dispatch(setError("No history thread found"));
      return;
    }

    copyChatHistoryToClipboard(historyThread)
      .then((response) => {
        if (response.error) {
          dispatch(setError(response.error));
        }
        dispatch(setInformation("Chat history copied to clipboard"));
      })
      .catch(() => {
        dispatch(setError("Unknown error occured while copying to clipboard"));
      });
  }, [dispatch, historyThread]);

  const handleBackFromThreadHistory = useCallback(
    (customBackFunction: () => void) => {
      if (information) {
        onClearInformation();
      }
      if (error) {
        onClearError();
      }
      customBackFunction();
    },
    [information, error, onClearError, onClearInformation],
  );

  return (
    <PageWrapper host={host}>
      {host === "vscode" && !tabbed ? (
        <Flex gap="2" pb="3">
          <Button
            variant="surface"
            onClick={() => handleBackFromThreadHistory(backFromThreadHistory)}
          >
            <ArrowLeftIcon width="16" height="16" />
            Back
          </Button>
        </Flex>
      ) : (
        <Button
          mr="auto"
          variant="outline"
          onClick={() => handleBackFromThreadHistory(onCloseThreadHistory)}
          mb="4"
        >
          Back
        </Button>
      )}
      <ScrollArea scrollbars="vertical">
        {historyThread && (
          <Flex
            direction="column"
            justify="between"
            flexGrow="1"
            mr={LeftRightPadding}
            style={{
              width: "inherit",
            }}
          >
            <ChatRawJSON
              thread={historyThread}
              copyHandler={handleCopyToClipboardJSON}
            />
          </Flex>
        )}
      </ScrollArea>
      {information && (
        <InformationCallout onClick={onClearInformation} timeout={3000}>
          {information}
        </InformationCallout>
      )}
      {error && (
        <ErrorCallout onClick={onClearError} timeout={3000}>
          {error}
        </ErrorCallout>
      )}
    </PageWrapper>
  );
};
