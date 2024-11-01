import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PauseReason = {
  type: "confirmation" | "denial";
  command: string;
  rule: string;
  tool_call_id: string;
};

interface ConfirmationState {
  pauseReasons: PauseReason[];
  pause: boolean;
  toolsConfirmed: boolean;
}

const initialState: ConfirmationState = {
  pauseReasons: [],
  pause: false,
  toolsConfirmed: false,
};

export const confirmationSlice = createSlice({
  name: "confirmation",
  initialState,
  reducers: {
    setPauseReasons(state, action: PayloadAction<PauseReason[]>) {
      state.pause = true;
      state.pauseReasons = action.payload;
    },
    clearPauseReasonsAndConfirmTools(state, action: PayloadAction<boolean>) {
      state.pause = false;
      state.pauseReasons = [];
      state.toolsConfirmed = action.payload;
    },
  },
  selectors: {
    getPauseReasonsWithPauseStatus: (state) => state,
    getToolsConfirmationStatus: (state) => state.toolsConfirmed,
  },
});

export const { setPauseReasons, clearPauseReasonsAndConfirmTools } =
  confirmationSlice.actions;
export const { getPauseReasonsWithPauseStatus, getToolsConfirmationStatus } =
  confirmationSlice.selectors;
