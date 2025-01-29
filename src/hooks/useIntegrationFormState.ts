import { useCallback, useState } from "react";
import { debugIntegrations } from "../debugConfig";
import { convertRawIntegrationFormValues } from "../features/Integrations/convertRawIntegrationFormValues";
import { validateSnakeCase } from "../utils/validateSnakeCase";
import isEqual from "lodash.isequal";
import type { FormEvent } from "react";
import type {
  Integration,
  IntegrationWithIconRecord,
  ToolConfirmation,
  ToolParameterEntity,
} from "../services/refact";
import {
  areAllFieldsBoolean,
  areToolConfirmation,
  areToolParameters,
  isPrimitive,
} from "../services/refact";

export function useIntegrationFormState() {
  const [isApplyingIntegrationForm, setIsApplyingIntegrationForm] =
    useState(false);
  const [isDeletingIntegration, setIsDeletingIntegration] = useState(false);
  const [isDisabledIntegrationForm, setIsDisabledIntegrationForm] =
    useState(true);
  const [availabilityValues, setAvailabilityValues] = useState<
    Record<string, boolean>
  >({});
  const [confirmationRules, setConfirmationRules] = useState<ToolConfirmation>({
    ask_user: [],
    deny: [],
  });
  const [toolParameters, setToolParameters] = useState<
    ToolParameterEntity[] | null
  >(null);

  const validateFormChanges = useCallback(
    (
      event: FormEvent<HTMLFormElement>,
      currentIntegration: IntegrationWithIconRecord | null,
      schema: Integration["integr_schema"] | null,
      values: Integration["integr_values"],
    ) => {
      debugIntegrations(
        `[VALIDATION]: validating form changes...`,
        currentIntegration,
      );
      debugIntegrations(
        `[VALIDATION]: currentIntegration:`,
        currentIntegration,
      );
      debugIntegrations(`[VALIDATION]: schema:`, schema);
      if (!currentIntegration || !schema) return;
      // if (!currentIntegrationValues) return;
      // if (!currentIntegrationValues.available) return;
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());

      // Adjust types of data based on f_type of each field in schema
      const formValues = convertRawIntegrationFormValues(
        rawFormValues,
        schema,
        values,
      );

      // formValues.parameters = toolParameters;

      const eachFormValueIsNotChanged = values
        ? Object.entries(formValues).every(([fieldKey, fieldValue]) => {
            if (isPrimitive(fieldValue)) {
              return fieldKey in values && fieldValue === values[fieldKey];
            }
            if (typeof fieldValue === "object" || Array.isArray(fieldValue)) {
              return (
                fieldKey in values && isEqual(fieldValue, values[fieldKey])
              );
            }
          })
        : false;

      debugIntegrations(
        `[DEBUG]: eachFormValueIsNotChanged: `,
        eachFormValueIsNotChanged,
      );

      const eachAvailabilityOptionIsNotChanged = values
        ? Object.entries(availabilityValues).every(([fieldKey, fieldValue]) => {
            const availableObj = values.available;
            if (availableObj && areAllFieldsBoolean(availableObj)) {
              return (
                fieldKey in availableObj &&
                fieldValue === availableObj[fieldKey]
              );
            }
            return false;
          })
        : true;

      const eachToolParameterIsNotChanged =
        toolParameters && values && areToolParameters(values.parameters)
          ? isEqual(values.parameters, toolParameters)
          : true;

      const eachToolConfirmationIsNotChanged =
        values && areToolConfirmation(values.confirmation)
          ? isEqual(values.confirmation, confirmationRules)
          : true;
      debugIntegrations(`[DEBUG]: formValues: `, formValues);
      debugIntegrations(`[DEBUG]: currentIntegrationValues: `, values);
      debugIntegrations(
        `[DEBUG]: eachAvailabilityOptionIsNotChanged: `,
        eachAvailabilityOptionIsNotChanged,
      );

      debugIntegrations(
        `[DEBUG]: eachToolParameterIsNotChanged: `,
        eachToolParameterIsNotChanged,
      );

      debugIntegrations(
        `[DEBUG]: eachToolConfirmationIsNotChanged: `,
        eachToolConfirmationIsNotChanged,
      );
      debugIntegrations(`[DEBUG]: availabilityValues: `, availabilityValues);
      const maybeDisabled =
        eachFormValueIsNotChanged &&
        eachAvailabilityOptionIsNotChanged &&
        eachToolParameterIsNotChanged &&
        eachToolConfirmationIsNotChanged;

      debugIntegrations(`[DEBUG CHANGE]: maybeDisabled: `, maybeDisabled);

      setIsDisabledIntegrationForm(
        toolParameters
          ? toolParameters.every((param) => validateSnakeCase(param.name))
            ? maybeDisabled
            : true
          : maybeDisabled,
      );
    },
    [availabilityValues, confirmationRules, toolParameters],
  );

  return {
    isApplyingIntegrationForm,
    setIsApplyingIntegrationForm,
    isDeletingIntegration,
    setIsDeletingIntegration,
    isDisabledIntegrationForm,
    setIsDisabledIntegrationForm,
    availabilityValues,
    setAvailabilityValues,
    confirmationRules,
    setConfirmationRules,
    toolParameters,
    setToolParameters,
    validateFormChanges,
  };
}
