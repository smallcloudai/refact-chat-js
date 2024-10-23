import { useCallback } from "react";
import { useAppSelector } from "./useAppSelector";
import { useAppDispatch } from "./useAppDispatch";
import {
  selectAllImages,
  removeImageByIndex,
  addImage,
  type ImageFile,
} from "../features/AttachedImages";

export function useAttachedImages() {
  const images = useAppSelector(selectAllImages);
  const dispatch = useAppDispatch();

  const removeImage = useCallback(
    (index: number) => {
      const action = removeImageByIndex(index);
      dispatch(action);
    },
    [dispatch],
  );

  const insertImage = useCallback(
    (file: ImageFile) => {
      const action = addImage(file);
      dispatch(action);
    },
    [dispatch],
  );

  // TODO: move to error and info slices
  const setError = useCallback(
    (fileName: string) => console.log(`file: ${fileName} reading was aborted`),
    [],
  );

  const setWarning = useCallback(
    (fileName: string) => console.log(`file ${fileName} reading has failed`),
    [],
  );

  return {
    images,
    setError,
    setWarning,
    insertImage,
    removeImage,
  };
}
