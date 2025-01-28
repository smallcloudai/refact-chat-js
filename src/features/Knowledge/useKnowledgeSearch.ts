import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  knowledgeApi,
  SubscribeArgs,
  VecDbStatus,
} from "../../services/refact/knowledge";
import { useDebounceCallback } from "usehooks-ts";
import isEqual from "lodash.isequal";
import { useAppDispatch } from "../../hooks";

export function useKnowledgeSearch() {
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState<SubscribeArgs>(undefined);
  const [cachedVecDbStatus, setCachedVecDbStatus] =
    useState<null | VecDbStatus>(null);

  const searchResult = knowledgeApi.useSubscribeQuery(searchValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    useDebounceCallback(setSearchValue, 500, {
      leading: true,
      maxWait: 250,
    }),
    [],
  );

  useEffect(() => {
    if (
      searchResult.data?.status &&
      !isEqual(searchResult.data.status, cachedVecDbStatus)
    ) {
      setCachedVecDbStatus(searchResult.data.status);
    }
  }, [searchResult.data, cachedVecDbStatus]);

  useEffect(() => {
    return () => {
      dispatch(knowledgeApi.util.resetApiState());
    };
  }, [dispatch]);

  const search = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        debouncedSearch({ quick_search: event.target.value });
      } else {
        debouncedSearch(undefined);
      }
    },
    [debouncedSearch],
  );

  return {
    searchResult,
    searchValue,
    search,
    vecDbStatus: cachedVecDbStatus,
  };
}
