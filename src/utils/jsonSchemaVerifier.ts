import Ajv from "ajv";
import { IntegrationSchema, isDetailMessage } from "../services/refact";

const ajv = new Ajv();

export const fetchSchema = async (url: string): Promise<IntegrationSchema> => {
  if (ajv.getSchema(url)) {
    return ajv.getSchema(url)?.schema as IntegrationSchema;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch schema from ${url}`);
  }
  const schema = (await response.json()) as IntegrationSchema;
  ajv.addSchema(schema, url);
  return schema;
};

export const validateSchema = (schema: object, data: unknown): boolean => {
  if (isDetailMessage(data)) {
    console.warn(data.detail);
    return false;
  }
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(validate.errors);
  }
  return valid;
};
