import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat/Thread/selectors";

type useAutoScrollProps = {
  ref: React.RefObject<HTMLDivElement>;
  scrollRef: React.RefObject<HTMLDivElement>;
};

function isAtBottom(element: HTMLDivElement | null) {
  if (element === null) return true;
  const { scrollHeight, scrollTop, clientHeight } = element;
  return Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;
}

function isOverflowing(element: HTMLDivElement | null) {
  if (element === null) return false;
  const { scrollHeight, clientHeight } = element;
  return scrollHeight > clientHeight;
}

export function useAutoScroll({ ref, scrollRef }: useAutoScrollProps) {
  const [followRef, setFollowRef] = useState(false);

  const [isScrolledTillBottom, setIsScrolledTillBottom] = useState(false);

  const messages = useAppSelector(selectMessages);
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);

  const scrollIntoView = useCallback(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [ref]);

  const handleScrollButtonClick = useCallback(() => {
    setFollowRef(isStreaming);
    scrollIntoView();
  }, [isStreaming, scrollIntoView]);

  // Check if at the bottom of the page.
  const handleScroll = useCallback(
    (_event: React.UIEvent<HTMLDivElement>) => {
      setIsScrolledTillBottom(isAtBottom(ref.current));
    },
    [ref],
  );

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

  // Scroll when more messages come in
  useEffect(() => {
    if ((isWaiting || isStreaming) && followRef) {
      scrollIntoView();
    } else if ((isWaiting || isStreaming) && isOverflowing(scrollRef.current)) {
      const bottom = isAtBottom(ref.current);

      setIsScrolledTillBottom(bottom);
    }
  }, [
    isStreaming,
    followRef,
    messages,
    scrollIntoView,
    isWaiting,
    scrollRef,
    ref,
  ]);

  // reset on unmount
  useEffect(() => {
    return () => {
      console.log("reseting");
      setFollowRef(false);
      setIsScrolledTillBottom(false);
    };
  }, []);

  const showFollowButton = useMemo(() => {
    if (!isStreaming || !isWaiting) return false;
    if (!isOverflowing(scrollRef.current)) return false;
    if (followRef) return false;
    return !isScrolledTillBottom;
    // if(!isScrolledTillBottom) return false; // issue here?
    // return !followRef && !isScrolledTillBottom;
    // return true;
  }, [followRef, isScrolledTillBottom, isStreaming, isWaiting, scrollRef]);

  return {
    handleScroll,
    handleWheel,
    handleScrollButtonClick,
    showFollowButton,
  };
}
