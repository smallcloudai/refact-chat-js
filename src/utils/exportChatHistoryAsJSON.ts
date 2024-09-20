import type { RootState } from "../app/store";

export const exportChatHistoryAsJSON = (
  chatHistory: RootState["history"],
  fileName = "chat_history.json",
) => {
  // Convert the chat history object to a JSON string
  const jsonString = JSON.stringify(chatHistory, null, 2);

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  // Append the anchor to the document body and trigger a click event
  document.body.appendChild(a);
  a.click();

  // Clean up by removing the anchor and revoking the object URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
