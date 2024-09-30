import React, { useImperativeHandle, useEffect, useRef, useState } from "react";
import { type ChatMessages } from "../../services/refact";

type useAutoScrollProps = {
  ref: React.ForwardedRef<HTMLDivElement>;
  messages: ChatMessages;
  isStreaming: boolean;
};

export function useAutoScroll({
  ref,
  messages,
  isStreaming,
}: useAutoScrollProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useImperativeHandle(ref, () => innerRef.current!, []);

  const [autoScroll, setAutoScroll] = useState(true);
  const [lastScrollHeight, setLastScrollHeight] = useState(0);

  useEffect(() => {
    setAutoScroll(isStreaming);
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming && autoScroll && innerRef.current?.scrollIntoView) {
      innerRef.current.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [messages, autoScroll, isStreaming]);

  useEffect(() => {
    return () => {
      setAutoScroll(true);
    };
  }, []);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    if (!innerRef.current) return;
    if (!isStreaming) {
      setLastScrollHeight(event.currentTarget.scrollTop);
    }
    const currentScrollHeight =
      event.currentTarget.scrollTop - lastScrollHeight;
    const parent = event.currentTarget.getBoundingClientRect();
    const { bottom, height, top } = innerRef.current.getBoundingClientRect();

    const nextIsVisable =
      top <= parent.top
        ? parent.top - top <= height + 20
        : bottom - parent.bottom <= height + 20;
    setAutoScroll(nextIsVisable);

    if (currentScrollHeight > window.innerHeight * 0.6) {
      setAutoScroll(false);
    }
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (!isStreaming) return;

    if (event.deltaY < 0) {
      setAutoScroll(false);
    } else {
      setLastScrollHeight(event.currentTarget.scrollTop);
      setAutoScroll(true);
    }
  };

  return { handleScroll, handleWheel, innerRef };
}
