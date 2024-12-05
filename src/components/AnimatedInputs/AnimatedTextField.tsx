import React from "react";
import { Box, TextField } from "@radix-ui/themes";
import classNames from "classnames";
import styles from "./AnimatedInputs.module.css";

export type AnimatedTextFieldProps = TextField.RootProps & {
  fadeValue?: TextField.RootProps["value"];
};

function getFadeProps(
  props: AnimatedTextFieldProps,
): Omit<TextField.RootProps, "onChange" | "name"> {
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
  props: AnimatedTextFieldProps,
): Omit<TextField.RootProps, "fadeValue"> {
  const { fadeValue: _fadeValue, ...rest } = props;
  return rest;
}

export const AnimatedTextField: React.FC<AnimatedTextFieldProps> = (props) => {
  const fadeProps = getFadeProps(props);
  const inputProps = getInputProps(props);

  const shouldFade = props.fadeValue ?? false;

  if (!shouldFade) {
    return <TextField.Root {...inputProps} className={props.className} />;
  }

  return (
    <Box position="relative">
      <TextField.Root
        {...fadeProps}
        className={classNames(
          styles.fade_input,
          styles.fade_input_out,
          props.className,
        )}
        hidden={true}
      />
      <TextField.Root
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
