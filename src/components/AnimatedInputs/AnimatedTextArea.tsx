import React from "react";
import { Box, TextArea, TextAreaProps } from "@radix-ui/themes";
import classNames from "classnames";
import styles from "./AnimatedInputs.module.css";

export type AnimatedTextAreaProps = TextAreaProps & {
  fadeValue?: TextAreaProps["value"];
};

function getFadeProps(
  props: AnimatedTextAreaProps,
): Omit<TextAreaProps, "onChange" | "name"> {
  const {
    onChange: _onChange,
    value: _value,
    // defaultValue,
    name: _name,
    fadeValue,
    ...rest
  } = props;

  return { ...rest, defaultValue: fadeValue };
}

function getInputProps(
  props: AnimatedTextAreaProps,
): Omit<TextAreaProps, "fadeValue"> {
  const { fadeValue: _fadeValue, ...rest } = props;
  return rest;
}

export const AnimatedTextArea: React.FC<AnimatedTextAreaProps> = (props) => {
  const fadeProps = getFadeProps(props);
  const inputProps = getInputProps(props);

  const shouldFade = props.fadeValue ?? false;

  if (!shouldFade) {
    return <TextArea {...inputProps} className={props.className} />;
  }

  return (
    <Box position="relative">
      <TextArea
        {...fadeProps}
        className={classNames(
          styles.fade_input,
          styles.fade_input_out,
          props.className,
        )}
        hidden={true}
      />

      <TextArea
        {...inputProps}
        className={classNames(
          styles.fade_input,
          styles.fade_input_in,
          props.className,
        )}
      />
    </Box>
  );
};
