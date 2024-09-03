import {
  Button,
  Flex,
  IconButton,
  Spinner,
  TabNav,
  Text,
} from "@radix-ui/themes";
import { Dropdown, DropdownNavigationOptions } from "./Dropdown";
import { DotFilledIcon, PlusIcon } from "@radix-ui/react-icons";
import { newChatAction } from "../../events";
import { restart, useTourRefs } from "../../features/Tour";
import { popBackTo, push } from "../../features/Pages/pagesSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getHistory } from "../../features/History/historySlice";
import { restoreChat } from "../../features/Chat";
import { TruncateLeft } from "../Text";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";

export type DashboardTab = {
  type: "dashboard";
};

function isDashboardTab(tab: Tab): tab is DashboardTab {
  return tab.type === "dashboard";
}

export type ChatTab = {
  type: "chat";
  id: string;
};

function isChatTab(tab: Tab): tab is ChatTab {
  return tab.type === "chat";
}

export type Tab = DashboardTab | ChatTab;

export type ToolbarProps = {
  activeTab: Tab;
};

export const Toolbar = ({ activeTab }: ToolbarProps) => {
  const dispatch = useAppDispatch();
  const tabNav = useRef<HTMLElement | null>(null);
  const [tabNavWidth, setTabNavWidth] = useState(0);
  const { width: windowWidth } = useWindowDimensions();

  const refs = useTourRefs();

  const history = useAppSelector(getHistory, {
    devModeChecks: { stabilityCheck: "never" },
  });
  const isStreaming = useAppSelector((app) => app.chat.streaming);
  const cache = useAppSelector((app) => app.chat.cache);

  const handleNavigation = (to: DropdownNavigationOptions | "chat") => {
    if (to === "settings") {
      openSettings();
    } else if (to === "hot keys") {
      openHotKeys();
    } else if (to === "fim") {
      dispatch(push({ name: "fill in the middle debug page" }));
    } else if (to === "stats") {
      dispatch(push({ name: "statistics page" }));
    } else if (to === "restart tour") {
      dispatch(restart());
      dispatch(popBackTo("initial setup"));
      dispatch(push({ name: "welcome" }));
    } else if (to === "chat") {
      dispatch(popBackTo("history"));
      dispatch(push({ name: "chat" }));
    }
  };

  const onCreateNewChat = () => {
    dispatch(newChatAction());
    handleNavigation("chat");
  };

  const goToTab = useCallback(
    (tab: Tab) => {
      if (tab.type === "dashboard") {
        dispatch(popBackTo("history"));
        dispatch(newChatAction());
      } else {
        const chat = history.find((chat) => chat.id === tab.id);
        if (chat != undefined) {
          dispatch(restoreChat(chat));
        }
        dispatch(popBackTo("history"));
        dispatch(push({ name: "chat" }));
      }
    },
    [dispatch, history],
  );

  useEffect(() => {
    if (!tabNav.current) {
      return;
    }

    setTabNavWidth(tabNav.current.offsetWidth);

    const observer = new ResizeObserver(() => {
      if (!tabNav.current) {
        return;
      }

      setTabNavWidth(tabNav.current.offsetWidth);
    });
    observer.observe(tabNav.current);

    return () => {
      observer.disconnect();
    };
  }, [tabNav]);

  const tabs = useMemo(() => {
    return history.filter(
      (chat) =>
        chat.read === false ||
        (activeTab.type === "chat" && activeTab.id == chat.id),
    );
  }, [history, activeTab]);

  const shouldCollapse = useMemo(() => {
    const dashboardWidth = 103; // todo: compute this
    const totalWidth = dashboardWidth + 140 * tabs.length;
    return tabNavWidth < totalWidth;
  }, [tabNavWidth, tabs.length]);

  return (
    <Flex style={{ alignItems: "center", margin: 4, gap: 4 }}>
      <Flex
        style={{
          flex: 1,
          alignItems: "flex-start",
          maxHeight: "36px",
          overflowY: "hidden",
        }}
      >
        <TabNav.Root style={{ flex: 1, overflowX: "scroll" }} ref={tabNav}>
          <TabNav.Link
            active={isDashboardTab(activeTab)}
            ref={(x) => refs.setBack(x)}
            onClick={() => goToTab({ type: "dashboard" })}
          >
            Dashboard
          </TabNav.Link>
          {tabs.map((chat) => {
            const isStreamingThisTab =
              chat.id in cache ||
              (isChatTab(activeTab) && chat.id === activeTab.id && isStreaming);
            const isActive = isChatTab(activeTab) && activeTab.id == chat.id;
            return (
              <TabNav.Link
                active={isActive}
                key={chat.id}
                onClick={() => goToTab({ type: "chat", id: chat.id })}
                style={{ minWidth: 0, maxWidth: "140px" }}
              >
                {isStreamingThisTab && <Spinner />}
                {!isStreamingThisTab && chat.read === false && (
                  <DotFilledIcon />
                )}
                <TruncateLeft
                  style={{
                    maxWidth: "110px",
                    display: shouldCollapse && !isActive ? "none" : undefined,
                  }}
                >
                  {chat.title}
                </TruncateLeft>
              </TabNav.Link>
            );
          })}
        </TabNav.Root>
      </Flex>
      {windowWidth < 350 ? (
        <IconButton
          variant="outline"
          ref={(x) => refs.setNewChat(x)}
          onClick={onCreateNewChat}
        >
          <PlusIcon />
        </IconButton>
      ) : (
        <Button
          variant="outline"
          ref={(x) => refs.setNewChat(x)}
          onClick={onCreateNewChat}
        >
          <PlusIcon />
          <Text>New chat</Text>
        </Button>
      )}
      <Dropdown handleNavigation={handleNavigation} />
    </Flex>
  );
};

function openSettings() {
  throw new Error("Function not implemented.");
}

function openHotKeys() {
  throw new Error("Function not implemented.");
}
