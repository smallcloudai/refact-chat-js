import type { RootState } from "../app/store";

export const exportChatHistoryAsJSON = (
  chatThread: RootState["chat"]["thread"],
  fileName = "chat_history.json",
) => {
  const jsonString = JSON.stringify(chatThread, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
