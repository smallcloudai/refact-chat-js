import { ChatContextFile } from "../../services/refact";
import { FileInfo } from "../../features/Chat/activeFile";
import type { Checkboxes } from "./useCheckBoxes";

export function addCheckboxValuesToInput(
  input: string,
  checkboxes: Checkboxes,
  _vecdb: boolean,
) {
  // prompts go to start
  let result = input;

  if (
    checkboxes.selected_lines.checked &&
    checkboxes.selected_lines.hide !== true
  ) {
    result = `${checkboxes.selected_lines.value ?? ""}\n` + result;
  }

  // TODO: remove these if it's no longer a feature
  // if (checkboxes.use_memory.checked && checkboxes.use_memory.hide !== true) {
  //   result = `@local-notes-to-self\n` + result;
  // }

  // if (
  //   checkboxes.lookup_symbols.checked &&
  //   checkboxes.lookup_symbols.hide !== true
  // ) {
  //   result = `@symbols-at ${checkboxes.lookup_symbols.value ?? ""}\n` + result;
  // }

  if (checkboxes.file_upload.checked && checkboxes.file_upload.hide !== true) {
    result = `@file ${checkboxes.file_upload.value ?? ""}\n` + result;
    // const cmd = vecdb ? "@file-search" : "@file";
    // result = `${cmd} ${checkboxes.file_upload.value ?? ""}\n` + result;
  }

  if (
    checkboxes.search_workspace.checked &&
    checkboxes.search_workspace.hide !== true
  ) {
    result = `@workspace\n` + result;
  }

  if (!result.endsWith("\n")) {
    result += "\n";
  }

  return result;
}

export function activeFileToContextFile(fileInfo: FileInfo): ChatContextFile {
  const content = fileInfo.content ?? "";
  return {
    file_name: fileInfo.path,
    file_content: content,
    line1: fileInfo.line1 ?? 1,
    line2: fileInfo.line2 ?? (content.split("\n").length || 1),
    usefulness: fileInfo.usefulness,
  };
}
