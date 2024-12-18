import React, { useEffect, useState } from "react";
import { Flex, Callout as RadixCallout } from "@radix-ui/themes";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useTimeout } from "usehooks-ts";
import styles from "./Callout.module.css";
import classNames from "classnames";

type RadixCalloutProps = React.ComponentProps<typeof RadixCallout.Root>;

export type CalloutProps = Omit<RadixCalloutProps, "onClick"> & {
  type: "info" | "error" | "warning";
  onClick?: () => void;
  timeout?: number | null;
  hex?: string;
  message?: string | string[];
};

export const Callout: React.FC<CalloutProps> = ({
  children,
  type = "info",
  timeout = null,
  onClick = () => void 0,
  ...props
}) => {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpened(true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleRetryClick = () => {
    setIsOpened(false);
    const timeoutId = setTimeout(() => {
      onClick();
      clearTimeout(timeoutId);
    }, 300);
  };

  useTimeout(handleRetryClick, timeout);

  return (
    <RadixCallout.Root
      mx={props.mx ?? "2"}
      onClick={handleRetryClick}
      {...props}
      className={classNames(
        styles.callout_box,
        {
          [styles.callout_box_opened]: isOpened,
        },
        props.className,
      )}
    >
      {type === "warning" && <div className={styles.callout_box_background} />}
      <Flex direction="row" align="center" gap="4">
        <RadixCallout.Icon>
          {type === "error" ? <ExclamationTriangleIcon /> : <InfoCircledIcon />}
        </RadixCallout.Icon>
        <Flex direction="column" align="start" gap="1">
          <RadixCallout.Text className={styles.callout_text} wrap="wrap">
            {children}
          </RadixCallout.Text>
        </Flex>
      </Flex>
    </RadixCallout.Root>
  );
};

export const ErrorCallout: React.FC<Omit<CalloutProps, "type">> = ({
  timeout = null,
  onClick,
  children,
  ...props
}) => {
  return (
    <Callout
      type="error"
      color="red"
      onClick={onClick}
      timeout={timeout}
      itemType={props.itemType}
      {...props}
    >
      Error: {children}
    </Callout>
  );
};

export const InformationCallout: React.FC<Omit<CalloutProps, "type">> = ({
  timeout = null,
  onClick,
  children,
  ...props
}) => {
  return (
    <Callout
      type="info"
      color="blue"
      onClick={onClick}
      timeout={timeout}
      itemType={props.itemType}
      {...props}
    >
      Info: {children}
    </Callout>
  );
};

export const DiffWarningCallout: React.FC<Omit<CalloutProps, "type">> = ({
  timeout = null,
  onClick,
  message = null,
  children,
  ...props
}) => {
  const warningMessages = !message
    ? ["Some error occurred"]
    : Array.isArray(message)
      ? message
      : [message];

  return (
    <Callout
      type="warning"
      color={Array.isArray(message) ? "orange" : "amber"}
      onClick={onClick}
      timeout={timeout}
      {...props}
    >
      <Flex direction="column" gap="1">
        {warningMessages.map((msg, i) => (
          <span key={msg}>{i === 0 ? `Warning: ${msg}` : msg}</span>
        ))}
        {children}
      </Flex>
    </Callout>
  );
};

export const WarningCallout: React.FC<Omit<CalloutProps, "type">> = (props) => {
  return <Callout type="info" color="amber" {...props} />;
};
