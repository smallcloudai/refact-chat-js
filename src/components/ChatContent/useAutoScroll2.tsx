import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat/Thread/selectors";

type useAutoScrollProps = {
  ref: React.RefObject<HTMLDivElement>;
};

function isAtBottom(element: HTMLDivElement | null) {
  if (element === null) return true;
  const { scrollHeight, scrollTop, clientHeight } = element;
  return Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;
}

export function useAutoScroll({ ref }: useAutoScrollProps) {
  const [followRef, setFollowRef] = useState(false);

  // console.log({ atBottom: isAtBottom(ref.current), elem: ref.current });
  const [isScrolledTillBottom, setIsScrolledTillBottom] = useState(true);

  useEffect(() => {
    const bottom = isAtBottom(ref.current);
    setIsScrolledTillBottom(bottom);
  }, [ref]);

  const messages = useAppSelector(selectMessages);
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);

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
  const handleScroll = useCallback((_event: React.UIEvent<HTMLDivElement>) => {
    // setIsScrolledTillBottom(isAtBottom(event.currentTarget));
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
      // setIsScrolledTillBottom(false);
    };
  }, []);

  const showFollowButton = useMemo(() => {
    // if (isAtBottom(ref.current)) return false;
    return !followRef && (isStreaming || isWaiting) && !isScrolledTillBottom;
  }, [followRef, isScrolledTillBottom, isStreaming, isWaiting]);

  return {
    handleScroll,
    handleWheel,
    handleScrollButtonClick,
    showFollowButton,
  };
}
