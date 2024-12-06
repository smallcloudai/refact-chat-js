import React from "react";
import { Dialog, Avatar, AvatarProps, Inset } from "@radix-ui/themes";
import { ImageIcon } from "@radix-ui/react-icons";

export const DialogImage: React.FC<{
  src: string;
  size?: AvatarProps["size"];
  fallback?: AvatarProps["fallback"];
}> = ({ size = "8", fallback = <ImageIcon />, src }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Avatar radius="small" src={src} size={size} fallback={fallback} />
      </Dialog.Trigger>
      <Dialog.Content maxWidth="800px">
        <Inset>
          <img style={{ objectFit: "cover", width: "100%" }} src={src} />
        </Inset>
      </Dialog.Content>
    </Dialog.Root>
  );
};
