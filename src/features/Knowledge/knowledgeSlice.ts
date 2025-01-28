import { createSlice } from "@reduxjs/toolkit";
import { MemoRecord, VecDbStatus } from "../../services/refact/knowledge";

export type KnowledgeState = {
  loading: boolean;
  memories: Record<string, MemoRecord>;
  status: null | VecDbStatus;
};

const initialState: KnowledgeState = {
  loading: false,
  memories: {},
  status: null,
};

export const knowledgeSlice = createSlice({
  name: "knowledge",
  initialState,
  reducers: {
    // TODO: add reducers
  },
});
