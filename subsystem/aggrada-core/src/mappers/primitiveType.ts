import { isValid, parseISO, parse } from 'date-fns';

/**
 * `primitiveTypeMap` provides a standardized mapping of ISO 11404 primitive data types
 * to their simpler, commonly used representations. This helps in ensuring
 * consistency across the application when working with or referencing these types.
 */
export const primitiveTypeMap = {
  integer: 'General Whole Number', // Arbitrary precision integers
  decimal: 'General Decimal Number', // Includes floating-point and decimals
  boolean: 'General Boolean', // Binary logical values (true/false)
  string: 'General Character String', // Textual representation
  datetime: 'General Date and Time', // Temporal information
  unspecified: 'Unspecified', // Type could not be determined
};

/**
 * `PrimitiveType` is a union type that represents the possible primitive data types
 */
export type PrimitiveType = keyof typeof primitiveTypeMap;


/**
 * Utility function that determines the primitive data type
 * @param value 
 * @param customValidator 
 * @returns 
 */
export const primitiveTypeValidator = (
  value: unknown,
  customValidator?: (value: unknown) => PrimitiveType | null
): PrimitiveType => {
  // Check for custom validation first
  if (typeof customValidator === 'function') {
    const customType = customValidator(value);
    if (customType) return customType;
  }

  // Handle null or undefined as 'unspecified'
  if (value === null || value === undefined) {
    console.warn(`Unspecified data detected:`, value);
    return 'unspecified';
  }

  // Handle integers
  if (typeof value === 'number' && Number.isInteger(value)) {
    return 'integer';
  }

  // Handle decimals
  if (typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value)) {
    return 'decimal';
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return 'boolean';
  }

  // Handle datetime (ISO format or common date formats)
  if (typeof value === 'string') {
    if (isValid(parseISO(value)) || isValid(parse(value, 'dd/MM/yyyy', new Date()))) {
      return 'datetime';
    }

    // Check if string represents other types
    if (!isNaN(Number(value)) && Number.isInteger(Number(value))) {
      return 'integer';
    }
    if (!isNaN(Number(value)) && !Number.isNaN(parseFloat(value))) {
      return 'decimal';
    }
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return 'boolean';
    }

    return 'string';
  }

  // If none of the above matched, log the value and return 'unspecified'
  console.warn(`Unspecified data detected:`, value);
  return 'unspecified';
};
