import React from "react";
import { Select as RadixSelect } from "@radix-ui/themes";

type SelectProps = React.ComponentProps<typeof RadixSelect.Root> & {
  onChange: (value: string) => void;
  options: string[];
  title?: string;
};

export const Select: React.FC<SelectProps> = ({
  title,
  options,
  onChange,
  ...props
}) => {
  return (
    <RadixSelect.Root {...props} onValueChange={onChange}>
      <RadixSelect.Trigger title={title} />
      <RadixSelect.Content>
        {options.map((option) => {
          return (
            <RadixSelect.Item key={option} value={option}>
              {option}
            </RadixSelect.Item>
          );
        })}
      </RadixSelect.Content>
    </RadixSelect.Root>
  );
};
