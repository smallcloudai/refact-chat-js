import React from "react";
import { Box } from "@radix-ui/themes";
import classNames from "classnames";
import styles from "./AnimatedInput.module.css";

export const AnimatedInput: React.FC = () => {
  return (
    <Box position="relative">
      <Box
        position="absolute"
        top="0"
        left="0"
        className={classNames(styles.fade_out)}
      >
        {" "}
        Fade out input
      </Box>

      <Box
        position="absolute"
        top="0"
        left="0"
        className={classNames(styles.fade_in)}
      >
        {" "}
        Fade in input
      </Box>
    </Box>
  );
};
