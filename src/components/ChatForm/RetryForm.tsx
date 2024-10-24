import React, { useCallback, useState } from "react";
import { Avatar, Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { useDropzone } from "react-dropzone";
import { TextArea } from "../TextArea";
import { useOnPressedEnter } from "../../hooks/useOnPressedEnter";
import { Form } from "./Form";

import { useAppSelector } from "../../hooks";
import { selectSubmitOption } from "../../features/Config/configSlice";
import {
  ProcessedUserMessageContentWithImages,
  UserImage,
  UserMessage,
} from "../../services/refact";
import { ImageIcon, CrossCircledIcon } from "@radix-ui/react-icons";

function getTextFromUserMessage(messages: UserMessage["content"]): string {
  if (typeof messages === "string") return messages;
  return messages.reduce<string>((acc, message) => {
    if ("m_type" in message && message.m_type === "text")
      return acc + message.m_content;
    if ("type" in message && message.type === "text") return acc + message.text;
    return acc;
  }, "");
}

function getImageFromUserMessage(
  messages: UserMessage["content"],
): (UserImage | ProcessedUserMessageContentWithImages)[] {
  if (typeof messages === "string") return [];

  const images = messages.reduce<
    (UserImage | ProcessedUserMessageContentWithImages)[]
  >((acc, message) => {
    if ("m_type" in message && message.m_type.startsWith("image/"))
      return [...acc, message];
    if ("type" in message && message.type === "image_url")
      return [...acc, message];
    return acc;
  }, []);

  return images;
}

function getImageContent(
  image: UserImage | ProcessedUserMessageContentWithImages,
) {
  if ("type" in image) return image.image_url.url;
  const base64 = `data:${image.m_type};base64,${image.m_content}`;
  return base64;
}

export const RetryForm: React.FC<{
  // value: string;
  value: UserMessage["content"];
  onSubmit: (value: UserMessage["content"]) => void;
  onClose: () => void;
}> = (props) => {
  const shiftEnterToSubmit = useAppSelector(selectSubmitOption);
  // TODO: get text value
  const inputText = getTextFromUserMessage(props.value);
  console.log({ inputText, value: props.value });
  const inputImages = getImageFromUserMessage(props.value);
  const [textValue, onChangeTextValue] = useState(inputText);
  const [imageValue, onChangeImageValue] = useState(inputImages);

  const addImage = useCallback((image: UserImage) => {
    onChangeImageValue((prev) => {
      return [...prev, image];
    });
  }, []);

  // TODO get Images from value

  const closeAndReset = () => {
    // onChange(props.value);
    onChangeImageValue(inputImages);
    onChangeTextValue(inputText);
    props.onClose();
  };

  const handleRetry = () => {
    const trimmedText = textValue.trim();
    if (imageValue.length === 0 && trimmedText.length > 0) {
      props.onSubmit(trimmedText);
    } else if (trimmedText.length > 0) {
      const text = {
        type: "text" as const,
        text: textValue.trim(),
      };
      props.onSubmit([text, ...imageValue]);
    }
  };

  const onPressedEnter = useOnPressedEnter(handleRetry);

  const handleOnKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (shiftEnterToSubmit && !event.shiftKey && event.key === "Enter") {
        onChangeTextValue(textValue + "\n");
        return;
      }
      onPressedEnter(event);
    },
    [onPressedEnter, shiftEnterToSubmit, textValue],
  );

  const handleRemove = useCallback((index: number) => {
    onChangeImageValue((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        handleRetry();
      }}
    >
      <TextArea
        value={textValue}
        onChange={(event) => onChangeTextValue(event.target.value)}
        onKeyDown={handleOnKeyDown}
      />
      {/**TODO: images */}

      <Flex>
        <MyDropzone addImage={addImage} />
        {imageValue.map((image, index) => {
          const content = getImageContent(image);
          const key = `retry-image-${index}`;
          return (
            <MyImage
              key={key}
              image={content}
              onRemove={() => handleRemove(index)}
            />
          );
        })}
      </Flex>
      <Flex
        align="center"
        justify="center"
        gap="1"
        direction="row"
        p="2"
        style={{
          backgroundColor: "var(--color-surface)",
        }}
      >
        <Button color="grass" variant="surface" size="1" type="submit">
          Submit
        </Button>
        <Button
          variant="surface"
          color="tomato"
          size="1"
          onClick={closeAndReset}
        >
          Cancel
        </Button>
      </Flex>
    </Form>
  );
};

const MyDropzone: React.FC<{ addImage: (image: UserImage) => void }> = ({
  addImage,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      // TODO: errors
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        if (typeof reader.result === "string") {
          const image: UserImage = {
            type: "image_url",
            image_url: { url: reader.result },
          };
          addImage(image);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} style={{ display: "none" }} />
      <Text size="1">
        Drag &apos;n&apos; drop some files here, or click to select files
      </Text>
    </div>
  );
};

const MyImage: React.FC<{ image: string; onRemove: () => void }> = ({
  image,
  onRemove,
}) => {
  return (
    <IconButton onClick={onRemove}>
      <CrossCircledIcon />
      <Avatar src={image} size="1" fallback={<ImageIcon />} />
    </IconButton>
  );
};
