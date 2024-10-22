import React, { createContext, useCallback } from "react";
import { Button, Slot, IconButton } from "@radix-ui/themes";
import { CameraIcon } from "@radix-ui/react-icons";
import { DropzoneInputProps, useDropzone } from "react-dropzone";
import { useAttachedImages } from "../../hooks/useAttachedImages";

export const FileUploadContext = createContext<{
  open: () => void;

  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
}>({
  open: () => ({}),
  getInputProps: () => ({}),
});

export const DropzoneProvider: React.FC<
  React.PropsWithChildren<{ asChild?: boolean }>
> = ({ asChild, ...props }) => {
  const { insertImage, setError, setWarning } = useAttachedImages();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onabort = () => setWarning(file.name);
        reader.onerror = () => setError(file.name);
        reader.onload = () => {
          const fileForChat = {
            name: file.name,
            content: reader.result,
            type: file.type,
          };
          insertImage(fileForChat);
        };
        reader.readAsDataURL(file);
      });
    },
    [insertImage, setError, setWarning],
  );

  // TODO: disable when chat is busy
  const dropzone = useDropzone({
    disabled: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [],
    },
    onDrop,
  });

  const Comp = asChild ? Slot : "div";

  return (
    <FileUploadContext.Provider
      value={{
        open: dropzone.open,
        getInputProps: dropzone.getInputProps,
      }}
    >
      <Comp {...dropzone.getRootProps()} {...props} />
    </FileUploadContext.Provider>
  );
};

export const DropzoneConsumer = FileUploadContext.Consumer;

export const AttachFileButton = () => {
  return (
    <DropzoneConsumer>
      {({ open, getInputProps }) => {
        const inputProps = getInputProps();
        return (
          <>
            <input {...inputProps} style={{ display: "none" }} />
            <IconButton
              variant="ghost"
              size="1"
              disabled={inputProps.disabled}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                open();
              }}
            >
              <CameraIcon />
            </IconButton>
          </>
        );
      }}
    </DropzoneConsumer>
  );
};

export const FileList = () => {
  const { images, removeImage } = useAttachedImages();
  return (
    <div>
      {images.map((file, index) => {
        const key = `image-${file.name}-${index}`;
        return (
          <Button key={key} size="1" onClick={() => removeImage(index)}>
            {file.name}
          </Button>
        );
      })}
    </div>
  );
};
