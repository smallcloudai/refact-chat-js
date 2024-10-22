import React, { createContext, useCallback, useState } from "react";
import { Button, Slot } from "@radix-ui/themes";
import { useDropzone } from "react-dropzone";

type FileForChat = {
  name: string;
  content: string | ArrayBuffer | null;
  type: string;
};

export const FileUploadContext = createContext<{
  files: FileForChat[];
  open: () => void;
  setFiles: React.Dispatch<React.SetStateAction<FileForChat[]>>;
}>({ files: [], open: () => ({}), setFiles: () => ({}) });

export const DropzoneProvider: React.FC<
  React.PropsWithChildren<{ asChild?: boolean }>
> = ({ asChild, ...props }) => {
  // TODO: could be in redux
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
        // TODO: how are multiple uploads handled
        setFiles((prev) => [...prev, fileForChat]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // TODO: remove files

  // TODO: disable when chat is busy
  const dropzone = useDropzone({
    disabled: false,
    // onDrop: (files) => console.log(files),
    onDrop,
  });

  const Comp = asChild ? Slot : "div";

  // TODO: dropzone.input props
  return (
    <FileUploadContext.Provider
      value={{ files: attachedFiles, open: dropzone.open, setFiles }}
    >
      <Comp {...dropzone.getRootProps()} {...props} />
    </FileUploadContext.Provider>
  );
};

export const DropzoneConsumer = FileUploadContext.Consumer;

export const OpenButton = () => {
  // TODO: use an icon
  return (
    <DropzoneConsumer>
      {({ open }) => <Button onClick={open}>Add images</Button>}
    </DropzoneConsumer>
  );
};

export const FileList = () => {
  // TODO: remove items
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
