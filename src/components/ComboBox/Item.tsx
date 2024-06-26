import React from "react";
import { ComboboxItem, type ComboboxStore } from "@ariakit/react";
import { Button } from "@radix-ui/themes";
import styles from "./ComboBox.module.css";

export const Item: React.FC<{
  onClick: React.MouseEventHandler<HTMLDivElement>;
  value: string;
  children: React.ReactNode;
  store: ComboboxStore;
}> = ({ children, value, onClick }) => {
  return (
    <Button className={styles.item} variant="ghost" asChild highContrast>
      <ComboboxItem
        value={value}
        onClick={onClick}
        focusOnHover
        clickOnEnter={false}
      >
        {children}
      </ComboboxItem>
    </Button>
  );
};
