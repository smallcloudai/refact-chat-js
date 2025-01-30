import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  IntegrationPrimitive,
  Integration,
  IntegrationWithIconRecord,
  NotConfiguredIntegrationWithIconRecord,
  ToolConfirmation,
  ToolParameterEntity,
} from "../../services/refact";

type FormKeyValueMap = Integration["integr_values"];

export type IntegrationCachedFormData = Record<string, FormKeyValueMap>;

interface IntegrationsState {
  cachedForms: IntegrationCachedFormData;
  currentIntegration: IntegrationWithIconRecord | null;
  currentIntegrationSchema: Integration["integr_schema"] | null;
  currentIntegrationValues: Integration["integr_values"] | null;
  currentNotConfiguredIntegration: NotConfiguredIntegrationWithIconRecord | null;
  confirmationRules: ToolConfirmation;
  toolParameters: ToolParameterEntity[] | null;
  availabilityValues: Record<string, boolean>;
  isApplyingIntegrationForm: boolean;
  isDeletingIntegration: boolean;
  isDisabledIntegrationForm: boolean;
}

const initialState: IntegrationsState = {
  cachedForms: {},
  currentIntegration: null,
  currentIntegrationSchema: null,
  currentIntegrationValues: null,
  currentNotConfiguredIntegration: null,
  confirmationRules: {
    ask_user: [],
    deny: [],
  },
  toolParameters: null,
  availabilityValues: {},
  isApplyingIntegrationForm: false,
  isDeletingIntegration: false,
  isDisabledIntegrationForm: true,
};

export const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    // Existing cache-related reducers
    addToCacheOnMiss: (state, action: PayloadAction<Integration>) => {
      const key = action.payload.integr_config_path;
      if (key in state.cachedForms) return state;

      state.cachedForms[key] = action.payload.integr_values;
    },
    removeFromCache: (state, action: PayloadAction<string>) => {
      if (!(action.payload in state.cachedForms)) return state;

      const nextCache = Object.entries(
        state.cachedForms,
      ).reduce<IntegrationCachedFormData>((acc, [curKey, curValues]) => {
        if (curKey === action.payload) return acc;
        return { ...acc, [curKey]: curValues };
      }, {});

      state.cachedForms = nextCache;
    },
    clearCache: (state) => {
      state.cachedForms = {};
    },

    // New reducers for integration state
    setCurrentIntegration(
      state,
      action: PayloadAction<IntegrationWithIconRecord | null>,
    ) {
      state.currentIntegration = action.payload;
    },
    setCurrentIntegrationSchema(
      state,
      action: PayloadAction<Integration["integr_schema"] | null>,
    ) {
      state.currentIntegrationSchema = action.payload;
    },
    setCurrentIntegrationValues(
      state,
      action: PayloadAction<Integration["integr_values"] | null>,
    ) {
      state.currentIntegrationValues = action.payload;
    },
    setCurrentNotConfiguredIntegration(
      state,
      action: PayloadAction<NotConfiguredIntegrationWithIconRecord | null>,
    ) {
      state.currentNotConfiguredIntegration = action.payload;
    },
    setConfirmationRules(state, action: PayloadAction<ToolConfirmation>) {
      state.confirmationRules = action.payload;
    },
    setToolParameters(
      state,
      action: PayloadAction<ToolParameterEntity[] | null>,
    ) {
      state.toolParameters = action.payload;
    },
    setAvailabilityValues(
      state,
      action: PayloadAction<Record<string, boolean>>,
    ) {
      state.availabilityValues = action.payload;
    },
    setIsApplyingIntegrationForm(state, action: PayloadAction<boolean>) {
      state.isApplyingIntegrationForm = action.payload;
    },
    setIsDeletingIntegration(state, action: PayloadAction<boolean>) {
      state.isDeletingIntegration = action.payload;
    },
    setIsDisabledIntegrationForm(state, action: PayloadAction<boolean>) {
      state.isDisabledIntegrationForm = action.payload;
    },
    resetIntegrationsState(state) {
      return {
        ...initialState,
        cachedForms: state.cachedForms, // Preserve cached forms when resetting
      };
    },
  },
  selectors: {
    // Existing selectors
    maybeSelectIntegrationFromCache: (state, integration: Integration) => {
      if (!(integration.integr_config_path in state.cachedForms)) return null;
      return state.cachedForms[integration.integr_config_path];
    },
    checkValuesForChanges:
      (_state, _integration: Integration) =>
      (_accessors: string | string[], _value: IntegrationPrimitive) => {
        // TODO: maybe add this ??
        return false;
      },

    // New selectors
    selectCurrentIntegration: (state) => state.currentIntegration,
    selectCurrentIntegrationSchema: (state) => state.currentIntegrationSchema,
    selectCurrentIntegrationValues: (state) => state.currentIntegrationValues,
    selectCurrentNotConfiguredIntegration: (state) =>
      state.currentNotConfiguredIntegration,
    selectConfirmationRules: (state) => state.confirmationRules,
    selectToolParameters: (state) => state.toolParameters,
    selectAvailabilityValues: (state) => state.availabilityValues,
    selectIsApplyingIntegrationForm: (state) => state.isApplyingIntegrationForm,
    selectIsDeletingIntegration: (state) => state.isDeletingIntegration,
    selectIsDisabledIntegrationForm: (state) => state.isDisabledIntegrationForm,
  },
});

// Export all actions
export const {
  // Existing actions
  addToCacheOnMiss,
  removeFromCache,
  clearCache,
  // New actions
  setCurrentIntegration,
  setCurrentIntegrationSchema,
  setCurrentIntegrationValues,
  setCurrentNotConfiguredIntegration,
  setConfirmationRules,
  setToolParameters,
  setAvailabilityValues,
  setIsApplyingIntegrationForm,
  setIsDeletingIntegration,
  setIsDisabledIntegrationForm,
  resetIntegrationsState,
} = integrationsSlice.actions;

// Export all selectors
export const {
  // Existing selectors
  maybeSelectIntegrationFromCache,
  checkValuesForChanges,
  // New selectors
  selectCurrentIntegration,
  selectCurrentIntegrationSchema,
  selectCurrentIntegrationValues,
  selectCurrentNotConfiguredIntegration,
  selectConfirmationRules,
  selectToolParameters,
  selectAvailabilityValues,
  selectIsApplyingIntegrationForm,
  selectIsDeletingIntegration,
  selectIsDisabledIntegrationForm,
} = integrationsSlice.selectors;

export default integrationsSlice.reducer;
