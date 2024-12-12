import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AgentUsageItem = {
  time: number;
  user: string;
};

const initialState: { items: AgentUsageItem[] } = { items: [] };

const oneDay = 24 * 60 * 60 * 1000;

export const agentUsageSlice = createSlice({
  name: "agentUsage",
  initialState,
  reducers: {
    addAgentUsageItem: (state, action: PayloadAction<{ user: string }>) => {
      const now = Date.now();
      const todaysItems = state.items.filter(
        (item) => item.time + oneDay > now,
      );
      const item = { time: now, user: action.payload.user };
      state.items = [...todaysItems, item];
    },
  },

  selectors: {
    selectTodaysItemsForUser: (state) => {
      const now = Date.now();
      return state.items.filter((item) => item.time + oneDay > now);
    },
  },
});

export const { addAgentUsageItem } = agentUsageSlice.actions;
export const { selectTodaysItemsForUser } = agentUsageSlice.selectors;
