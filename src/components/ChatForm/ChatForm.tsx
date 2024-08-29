import React, { useCallback } from "react";

import { Flex, Card, Text } from "@radix-ui/themes";
import styles from "./ChatForm.module.css";

import { PaperPlaneButton, BackToSideBarButton } from "../Buttons/Buttons";
import { TextArea, TextAreaProps } from "../TextArea";
import { Form } from "./Form";
import { useOnPressedEnter, useIsOnline, useConfig } from "../../hooks";
import { ErrorCallout, Callout } from "../Callout";
import { Button } from "@radix-ui/themes";
import { ComboBox } from "../ComboBox";
import { CodeChatModel, SystemPrompts } from "../../services/refact";
import { FilesPreview } from "./FilesPreview";
import { ChatControls } from "./ChatControls";
import { addCheckboxValuesToInput } from "./utils";
import { useCommandCompletionAndPreviewFiles } from "./useCommandCompletionAndPreviewFiles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getErrorMessage, clearError } from "../../features/Errors/errorsSlice";
import { useTourRefs } from "../../features/Tour";
import { useCheckboxes } from "./useCheckBoxes";

export type ChatFormProps = {
  onSubmit: (str: string) => void;
  onClose?: () => void;
  className?: string;
  caps: {
    error: string | null;
    fetching: boolean;
    default_cap: string;
    available_caps: Record<string, CodeChatModel>;
  };
  model: string;
  onSetChatModel: (model: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onTextAreaHeightChange: TextAreaProps["onTextAreaHeightChange"];
  showControls: boolean;
  prompts: SystemPrompts;
  onSetSystemPrompt: (prompt: SystemPrompts) => void;
  selectedSystemPrompt: SystemPrompts;
  chatId: string;
};

export const ChatForm: React.FC<ChatFormProps> = ({
  onSubmit,
  onClose,
  className,
  caps,
  model,
  onSetChatModel,
  isStreaming,
  onStopStreaming,
  onTextAreaHeightChange,
  showControls,
  prompts,
  onSetSystemPrompt,
  selectedSystemPrompt,
}) => {
  const dispatch = useAppDispatch();
  const config = useConfig();
  const error = useAppSelector(getErrorMessage);
  const onClearError = useCallback(() => dispatch(clearError()), [dispatch]);
  const [value, setValue] = React.useState("");

  const { checkboxes, onToggleCheckbox, setInteracted, unCheckAll } =
    useCheckboxes();

  const { previewFiles, commands, requestCompletion } =
    useCommandCompletionAndPreviewFiles(checkboxes);

  const refs = useTourRefs();

  const isOnline = useIsOnline();

  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 0 && !isStreaming && isOnline) {
      const valueIncludingChecks = addCheckboxValuesToInput(
        trimmedValue,
        checkboxes,
        config.features?.vecdb ?? false,
      );
      onSubmit(valueIncludingChecks);
      setValue(() => "");
      unCheckAll();
    }
  }, [
    value,
    isStreaming,
    isOnline,
    checkboxes,
    config.features?.vecdb,
    onSubmit,
    unCheckAll,
  ]);

  const handleEnter = useOnPressedEnter(handleSubmit);

  const handleChange = useCallback(
    (command: string) => {
      setValue(command);
      setInteracted(true);
    },
    [setInteracted],
  );

  if (error) {
    return (
      <ErrorCallout mt="2" onClick={onClearError} timeout={null}>
        {error}
        <Text size="1" as="div">
          Click to retry
        </Text>
      </ErrorCallout>
    );
  }

  // return <div></div>;

  return (
    <Card mt="1" style={{ flexShrink: 0, position: "static" }}>
      {!isOnline && <Callout type="info">Offline</Callout>}

      {isStreaming && (
        <Button
          ml="auto"
          color="red"
          title="stop streaming"
          onClick={onStopStreaming}
        >
          Stop
        </Button>
      )}

      <Flex
        ref={(x) => refs.setChat(x)}
        style={{
          flexDirection: "column",
          alignSelf: "stretch",
          flex: 1,
          width: "100%",
        }}
      >
        <Form
          disabled={isStreaming || !isOnline}
          className={className}
          onSubmit={() => handleSubmit()}
        >
          <FilesPreview files={previewFiles} />

          <ComboBox
            commands={commands}
            requestCommandsCompletion={requestCompletion}
            value={value}
            onChange={handleChange}
            onSubmit={(event) => {
              handleEnter(event);
            }}
            placeholder={
              commands.completions.length > 0 ? "Type @ for commands" : ""
            }
            render={(props) => (
              <TextArea
                data-testid="chat-form-textarea"
                required={true}
                disabled={isStreaming}
                {...props}
                onTextAreaHeightChange={onTextAreaHeightChange}
                autoFocus={true}
                style={{ boxShadow: "none", outline: "none" }}
              />
            )}
          />
          <Flex gap="2" className={styles.buttonGroup}>
            {onClose && (
              <BackToSideBarButton
                disabled={isStreaming}
                title="return to sidebar"
                size="1"
                onClick={onClose}
              />
            )}
            <PaperPlaneButton
              disabled={isStreaming || !isOnline}
              title="send"
              size="1"
              type="submit"
            />
          </Flex>
        </Form>
      </Flex>

      <ChatControls
        host={config.host}
        checkboxes={checkboxes}
        showControls={showControls}
        onCheckedChange={onToggleCheckbox}
        selectProps={{
          value: model || caps.default_cap,
          onChange: onSetChatModel,
          options: Object.keys(caps.available_caps),
        }}
        promptsProps={{
          value: selectedSystemPrompt,
          prompts: prompts,
          onChange: onSetSystemPrompt,
        }}
      />
    </Card>
  );
};
