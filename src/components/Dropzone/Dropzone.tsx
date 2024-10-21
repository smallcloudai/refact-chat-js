import React, { createContext } from "react";
import { Slot } from "@radix-ui/themes";
import { useDropzone, type DropzoneState } from "react-dropzone";

export const FileUploadContext = createContext<DropzoneState | null>(null);

export const DropzoneProvider: React.FC<
  React.PropsWithChildren<{ asChild?: boolean }>
> = ({ asChild, ...props }) => {
  // TODO: disable when chat is busy

  const dropzone = useDropzone({
    disabled: false,
    onDrop: (files) => console.log(files),
  });

  const Comp = asChild ? Slot : "div";

  return (
    <FileUploadContext.Provider value={dropzone}>
      <Comp {...dropzone.getRootProps()} {...props} />
    </FileUploadContext.Provider>
  );
};

export const DropzoneConsumer = FileUploadContext.Consumer;
