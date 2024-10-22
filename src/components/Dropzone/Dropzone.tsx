import React, { createContext, useCallback, useState } from "react";
import { Button, Slot, IconButton } from "@radix-ui/themes";
import { CameraIcon } from "@radix-ui/react-icons";
import { DropzoneInputProps, useDropzone } from "react-dropzone";

type FileForChat = {
  name: string;
  content: string | ArrayBuffer | null;
  type: string;
};

export const FileUploadContext = createContext<{
  files: FileForChat[];
  open: () => void;
  setFiles: React.Dispatch<React.SetStateAction<FileForChat[]>>;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
}>({
  files: [],
  open: () => ({}),
  setFiles: () => ({}),
  getInputProps: () => ({}),
});

export const DropzoneProvider: React.FC<
  React.PropsWithChildren<{ asChild?: boolean }>
> = ({ asChild, ...props }) => {
  // TODO: could be in redux, this will allow emptying the attachments on successful submit or switching chat.
  const [attachedFiles, setFiles] = useState<FileForChat[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      // TODO: set error / warning messages
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const fileForChat: FileForChat = {
          name: file.name,
          content: reader.result,
          type: file.type,
        };
        setFiles((prev) => [...prev, fileForChat]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

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
        files: attachedFiles,
        open: dropzone.open,
        setFiles,
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
  return (
    <DropzoneConsumer>
      {({ files, setFiles }) => {
        return (
          <div>
            {files.map((file, index) => {
              const key = `image-${file.name}-${index}`;
              return (
                <Button
                  key={key}
                  size="1"
                  onClick={() =>
                    setFiles((prev) =>
                      prev.filter((_file, idx) => idx !== index),
                    )
                  }
                >
                  {file.name}
                </Button>
              );
            })}
          </div>
        );
      }}
    </DropzoneConsumer>
  );
};
