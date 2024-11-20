import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectMessages,
} from "../../features/Chat/Thread/selectors";

type useAutoScrollProps = {
  ref: React.RefObject<HTMLDivElement>;
};

function isAtBottom(element: HTMLDivElement | null) {
  if (element === null) return true;
  const { scrollHeight, scrollTop, clientHeight } = element;
  //   console.log({
  //     element,
  //     scrollHeight,
  //     scrollTop,
  //     clientHeight,
  //     result: Math.abs(scrollHeight - (scrollTop + clientHeight)),
  //   });
  // if (scrollHeight === 0 && scrollTop === 0 && clientHeight === 0) return true;
  return Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;
}

export function useAutoScroll({ ref }: useAutoScrollProps) {
  const [followRef, setFollowRef] = useState(false);

  // console.log({ atBottom: isAtBottom(ref.current), elem: ref.current });
  const [_isScrolledTillBottom, setIsScrolledTillBottom] = useState(true);

  useEffect(() => {
    const bottom = isAtBottom(ref.current);
    setIsScrolledTillBottom(bottom);
  }, [ref]);

  const messages = useAppSelector(selectMessages);
  const isStreaming = useAppSelector(selectIsStreaming);

  const scrollIntoView = useCallback(() => {
    if (ref.current) {
      // Also calls onScroll handler :/ could be debounced
      ref.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [ref]);

  const handleScrollButtonClick = useCallback(() => {
    setFollowRef(isStreaming);
    scrollIntoView();
  }, [isStreaming, scrollIntoView]);

  // Check if at the bottom of the page.
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setIsScrolledTillBottom(isAtBottom(event.currentTarget));
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (followRef && event.deltaY < 0) {
        setFollowRef(false);
      }
    },
    [followRef],
  );

  // Scroll to the end of the chat when the user clicks on the scroll button
  useEffect(() => {
    if (followRef) {
      scrollIntoView();
    }
  }, [followRef, scrollIntoView]);

  // Scroll when more messages come in and following
  useEffect(() => {
    if (isStreaming && followRef) {
      scrollIntoView();
    }
  }, [isStreaming, followRef, messages, scrollIntoView]);

  // reset on unmount
  useEffect(() => {
    return () => {
      setFollowRef(false);
      setIsScrolledTillBottom(false);
    };
  }, []);

  return {
    handleScroll,
    handleWheel,
    handleScrollButtonClick,
    // rename this for showing the button
    // isScrolledTillBottom: isScrolledTillBottom && !isStreaming && !followRef,
    isScrolledTillBottom: !isStreaming && !followRef,
  };
}
