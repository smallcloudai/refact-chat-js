import React, { createContext, useCallback } from "react";
import { Button, Slot, IconButton, Flex } from "@radix-ui/themes";
import { Cross1Icon, ImageIcon } from "@radix-ui/react-icons";
import { DropzoneInputProps, FileRejection, useDropzone } from "react-dropzone";
import { useAttachedImages } from "../../hooks/useAttachedImages";
import { TruncateLeft } from "../Text";
import { ImageFile } from "../../features/AttachedImages/imagesSlice";
import utif from "utif2";

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
    (acceptedFiles: File[], fileRejections: FileRejection[]): void => {
      void processImages(acceptedFiles, insertImage, setError, setWarning);

      if (fileRejections.length) {
        const rejectedFileMessage = fileRejections.map((file) => {
          const err = file.errors.reduce<string>((acc, cur) => {
            return acc + `${cur.code} ${cur.message}\n`;
          }, "");
          return `could not attach ${file.file.name}: ${err}`;
        });
        setError(rejectedFileMessage.join("\n"));
      }
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
              title="add image"
              disabled={inputProps.disabled}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                open();
              }}
            >
              <ImageIcon />
            </IconButton>
          </>
        );
      }}
    </DropzoneConsumer>
  );
};

export const FileList = () => {
  const { images, removeImage } = useAttachedImages();
  if (images.length === 0) return null;
  return (
    <Flex wrap="wrap" gap="1" py="2">
      {images.map((file, index) => {
        const key = `image-${file.name}-${index}`;
        return (
          <Button
            // variant="surface"
            // variant="outline"
            variant="soft"
            radius="full"
            key={key}
            size="1"
            onClick={() => removeImage(index)}
            style={{ maxWidth: "100%" }}
          >
            <TruncateLeft wrap="wrap">{file.name}</TruncateLeft>{" "}
            <Cross1Icon width="10" style={{ flexShrink: 0 }} />
          </Button>
        );
      })}
    </Flex>
  );
};

async function processImages(
  files: File[],
  onSuccess: (image: ImageFile) => void,
  onError: (reason: string) => void,
  onAbort: (reason: string) => void,
) {
  for (const file of files) {
    try {
      const scaledImage = await scaleImage(file, 800);
      const fileForChat = {
        name: file.name,
        content: scaledImage,
        type: file.type,
      };

      onSuccess(fileForChat);
    } catch (error) {
      if (error === "abort") {
        onAbort(`file ${file.name} reading was aborted`);
      } else {
        onError(`file ${file.name} processing has failed`);
      }
    }
  }
}

function scaleImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          reject(`canvas.getContext("2d"), returned null`);
        }

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height *= maxSize / width));
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width *= maxSize / height));
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL(file.type));
      };
      img.onerror = reject;
      // image could be a tiff
      //
      if (file.type === "image/tiff") {
        const decoded = decodeTiff(reader.result);
        bufferToBase64(decoded)
          .then((base64) => {
            img.src = base64;
          })
          .catch(() => {
            reject("could not decode tiff");
          });
      } else {
        img.src = reader.result as string;
      }
    };

    reader.onabort = () => reject("aborted");
    reader.onerror = () => reject("error");
    reader.readAsDataURL(file);
  });
}

function readerResultToBuffer(readerResult: FileReader["result"]): Uint8Array {
  if (readerResult === null) {
    return new Uint8Array();
  }

  if (typeof readerResult === "string") {
    return new TextEncoder().encode(readerResult);
  }

  return new Uint8Array(readerResult);
}

function decodeTiff(
  readerResult: Buffer | ArrayBuffer | null | string,
): Uint8Array {
  const buffer = readerResultToBuffer(readerResult);
  const ifds = utif.decode(buffer);

  ifds.forEach((ifd) => {
    utif.decodeImage(buffer, ifd);
  });

  const data = utif.toRGBA8(ifds[0]);

  return data;
}

async function bufferToBase64(
  buffer: Uint8Array | ArrayBuffer,
): Promise<string> {
  const base64url = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([buffer]));
  });

  return base64url;
}

// example use:
await bufferToBase64(new Uint8Array([1, 2, 3, 100, 200]));
