import type { RootState } from "../app/store";

export const exportChatHistoryAsJSON = (
  chatThread: RootState["chat"]["thread"],
) => {
  const jsonString = JSON.stringify(chatThread, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  return url;
};
