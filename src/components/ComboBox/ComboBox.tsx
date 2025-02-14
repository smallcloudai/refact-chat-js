/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo } from "react";
import { useComboboxStore, Combobox } from "@ariakit/react";
import { getAnchorRect, replaceRange } from "./utils";
import type { TextAreaProps } from "../TextArea/TextArea";
import { Item } from "./Item";
import { Portal } from "../Portal";
import { Popover } from "./Popover";
import { TruncateLeft } from "../Text";
import { type DebouncedState } from "usehooks-ts";
import { CommandCompletionResponse } from "../../services/refact";
import { useAppSelector, useEventsBusForIDE } from "../../hooks";
import { selectSubmitOption } from "../../features/Config/configSlice";

export type ComboBoxProps = {
  commands: CommandCompletionResponse;
  onChange: (value: string) => void;
  value: string;
  onSubmit: React.KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  render: (props: TextAreaProps) => React.ReactElement;
  requestCommandsCompletion: DebouncedState<
    (query: string, cursor: number) => void
  >;
  onHelpClick: () => void;
};

export const ComboBox: React.FC<ComboBoxProps> = ({
  commands,
  onSubmit,
  placeholder,
  onChange,
  value,
  render,
  requestCommandsCompletion,
  onHelpClick,
}) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [moveCursorTo, setMoveCursorTo] = React.useState<number | null>(null);
  const [lastPasteTimestamp, setLastPasteTimestamp] = React.useState(0);
  const [lastValue, setLastValue] = React.useState("");
  const shiftEnterToSubmit = useAppSelector(selectSubmitOption);
  const { escapeKeyPressed } = useEventsBusForIDE();

  const combobox = useComboboxStore({
    defaultOpen: false,
    placement: "top-start",
    defaultActiveId: undefined,
  });

  const state = combobox.useState();

  const matches = commands.completions;

  const hasMatches = useMemo(() => {
    return matches.length > 0;
  }, [matches]);

  React.useEffect(() => {
    if (moveCursorTo === null) return;
    if (ref.current) {
      ref.current.setSelectionRange(moveCursorTo, moveCursorTo);
    }
    setMoveCursorTo(null);
    return () => setMoveCursorTo(null);
  }, [moveCursorTo]);

  React.useLayoutEffect(() => {
    combobox.setOpen(hasMatches);
  }, [combobox, hasMatches, matches]);

  React.useEffect(() => {
    combobox.render();
  }, [combobox, value, matches]);

  React.useEffect(() => {
    if (!ref.current) return;
    const cursor = Math.min(
      ref.current.selectionStart,
      ref.current.selectionEnd,
    );
    requestCommandsCompletion(value, cursor);
  }, [requestCommandsCompletion, value]);

  const closeCombobox = useCallback(() => {
    combobox.hide();
    combobox.setState("items", []);
    combobox.setState("activeId", null);
    combobox.setState("activeValue", undefined);
  }, [combobox]);

  const handleReplace = useCallback(
    (input: string) => {
      if (!ref.current) return;
      console.log("[DEBUG] handleReplace called with:", {
        input,
        currentValue: ref.current.value,
        replaceRange: commands.replace,
        timeSinceLastPaste: Date.now() - lastPasteTimestamp,
      });

      // If this is happening right after a paste, skip it
      if (Date.now() - lastPasteTimestamp < 100) {
        console.log("[DEBUG] Skipping handleReplace due to recent paste");
        return;
      }

      const nextValue = replaceRange(
        ref.current.value,
        commands.replace,
        input,
      );
      closeCombobox();
      requestCommandsCompletion.cancel();
      onChange(nextValue);
      setMoveCursorTo(commands.replace[0] + input.length);
    },
    [
      closeCombobox,
      commands.replace,
      onChange,
      requestCommandsCompletion,
      lastPasteTimestamp,
    ],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const state = combobox.getState();

      if (state.open && event.key === "Tab") {
        event.preventDefault();
      }
      if (state.open) return;
      if (
        !shiftEnterToSubmit &&
        event.key === "Enter" &&
        !event.shiftKey &&
        !hasMatches
      ) {
        event.stopPropagation();
        onSubmit(event);
        setMoveCursorTo(null);
        return;
      } else if (
        shiftEnterToSubmit &&
        event.key === "Enter" &&
        event.shiftKey &&
        !hasMatches
      ) {
        event.stopPropagation();
        onSubmit(event);
        setMoveCursorTo(null);
        return;
      }

      if (!shiftEnterToSubmit && event.key === "Enter" && event.shiftKey) {
        return;
      } else if (
        shiftEnterToSubmit &&
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        onChange(value + "\n");

        return;
      }
    },
    [combobox, hasMatches, onChange, onSubmit, shiftEnterToSubmit, value],
  );

  // TODO: filter matches
  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!ref.current) return;

      const wasArrowLeftOrRight =
        event.key === "ArrowLeft" || event.key === "ArrowRight";
      if (wasArrowLeftOrRight) {
        closeCombobox();
      }

      if (wasArrowLeftOrRight && state.open) {
        closeCombobox();
      }

      const tabOrEnterOrSpace =
        event.key === "Tab" || event.key === "Enter" || event.key === "Space";

      const command = state.activeValue ?? combobox.item(state.activeId)?.value;

      if (state.open && tabOrEnterOrSpace && command) {
        event.preventDefault();
        event.stopPropagation();
        if (command === "@help") {
          handleReplace(command);
          closeCombobox();
          onHelpClick();
        } else {
          handleReplace(command);
        }
      }

      if (event.key === "Escape") {
        closeCombobox();
        escapeKeyPressed("combobox");
      }
    },
    [
      onHelpClick,
      closeCombobox,
      escapeKeyPressed,
      combobox,
      handleReplace,
      state.activeId,
      state.activeValue,
      state.open,
    ],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const now = Date.now();
      console.log(
        "[DEBUG] handleChange called with value:",
        event.target.value,
      );
      console.log("[DEBUG] previous value was:", lastValue);
      console.log(
        "[DEBUG] time since last paste:",
        now - lastPasteTimestamp,
        "ms",
      );
      console.log("[DEBUG] combobox state:", {
        open: state.open,
        activeValue: state.activeValue,
        activeId: state.activeId,
        replace: commands.replace,
      });
      const isPaste = event.target.value.length > value.length + 1;

      if (isPaste) {
        if (now - lastPasteTimestamp < 100) {
          console.log("[DEBUG] Skipping duplicate paste event");
          return;
        }
        console.log(
          "[DEBUG] paste detected, closing combobox and canceling completion",
        );
        setLastPasteTimestamp(now);
        closeCombobox();
        requestCommandsCompletion.cancel();
      }

      setLastValue(event.target.value);
      onChange(event.target.value);
    },
    [
      onChange,
      closeCombobox,
      state,
      commands.replace,
      value.length,
      requestCommandsCompletion,
      lastPasteTimestamp,
      lastValue,
    ],
  );

  const onItemClick = useCallback(
    (item: string, event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (item === "@help") {
        onHelpClick();
        closeCombobox();
      } else {
        handleReplace(item);
      }
    },
    [handleReplace, onHelpClick, closeCombobox],
  );

  const popoverWidth = ref.current
    ? ref.current.getBoundingClientRect().width - 8
    : null;

  useEffect(() => {
    const maybeItem = combobox.item(state.activeId);
    if (state.open && maybeItem === null) {
      const first = combobox.first();
      if (combobox.item(first)) {
        combobox.setActiveId(first);
      }
    }
  }, [combobox, state]);

  return (
    <>
      <Combobox
        store={combobox}
        autoSelect
        value={value}
        showOnChange={false}
        showOnKeyDown={false}
        showOnMouseDown={false}
        setValueOnChange={false}
        render={render({
          ref,
          placeholder,
          onScroll: combobox.render,
          onPointerDown: combobox.hide,
          onChange: handleChange,
          onKeyUp: onKeyUp,
          onKeyDown: onKeyDown,
          onSubmit: onSubmit,
        })}
      />
      <Portal>
        <Popover
          store={combobox}
          hidden={!hasMatches}
          getAnchorRect={() => {
            const textarea = ref.current;
            if (!textarea) return null;
            return getAnchorRect(textarea, ["@", " "]);
          }}
          maxWidth={popoverWidth}
        >
          {matches.map((item, index) => (
            <Item
              key={item + "-" + index}
              value={item}
              onClick={(e) => onItemClick(item, e)}
            >
              <TruncateLeft>{item}</TruncateLeft>
            </Item>
          ))}
          {/* {matches.map((item, index) => (
            <Item
              key={item + "-" + index}
              value={item}
              onClick={(e) => onItemClick(item, e)}
            >
              <TruncateLeft>{item}</TruncateLeft>
            </Item>
          ))} */}
        </Popover>
      </Portal>
    </>
  );
};
