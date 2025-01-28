import React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import styles from "./Accordion.module.css";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { IconProps } from "@radix-ui/themes";

type AccordionRoot = typeof RadixAccordion.Root;
type AccordionRootProps =
  | RadixAccordion.AccordionSingleProps
  | RadixAccordion.AccordionMultipleProps;

export const Root: AccordionRoot = React.forwardRef<
  HTMLDivElement,
  AccordionRootProps
>(({ className, ...props }, ref) => {
  return (
    <RadixAccordion.Root
      {...props}
      className={classNames(styles.AccordionRoot, className)}
      ref={ref}
    />
  );
});
Root.displayName = RadixAccordion.Root.displayName;

type AccordionItem = typeof RadixAccordion.Item;

export const Item: AccordionItem = React.forwardRef<
  HTMLDivElement,
  RadixAccordion.AccordionItemProps
>(({ className, ...props }, ref) => {
  return (
    <RadixAccordion.Item
      {...props}
      className={classNames(styles.AccordionItem, className)}
      ref={ref}
    />
  );
});
Item.displayName = RadixAccordion.Item.displayName;

type AccordionHeader = typeof RadixAccordion.Header;
export const Header: AccordionHeader = React.forwardRef<
  HTMLHeadingElement,
  RadixAccordion.AccordionHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <RadixAccordion.Header
      {...props}
      className={classNames(styles.AccordionHeader, className)}
      ref={ref}
    />
  );
});
Header.displayName = RadixAccordion.Header.displayName;

type AccordionTrigger = typeof RadixAccordion.Trigger;
export const Trigger: AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  RadixAccordion.AccordionTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <RadixAccordion.Trigger
      {...props}
      className={classNames(styles.AccordionTrigger, className)}
      ref={ref}
    />
  );
});
Trigger.displayName = RadixAccordion.Trigger.displayName;

type AccordionContent = typeof RadixAccordion.Content;
export const Content: AccordionContent = React.forwardRef<
  HTMLDivElement,
  RadixAccordion.AccordionContentProps
>(({ className, ...props }, ref) => {
  return (
    <RadixAccordion.Content
      {...props}
      className={classNames(styles.AccordionContent, className)}
      ref={ref}
    />
  );
});
Content.displayName = RadixAccordion.Content.displayName;

export const Chevron: React.FC<IconProps> = ({ className, ...props }) => {
  return (
    <ChevronDownIcon
      {...props}
      className={classNames(styles.AccordionChevron, className)}
      aria-hidden
    />
  );
};
