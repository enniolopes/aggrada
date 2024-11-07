/* eslint-disable @typescript-eslint/no-explicit-any */
export const flattenObject = ({
  obj,
  parentKey = '',
  result = {},
}: {
  obj: any;
  parentKey?: string;
  result?: any;
}): Record<string, any> => {
  Object.keys(obj).map((key) => {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      flattenObject({ obj: obj[key], parentKey: newKey, result });
    } else {
      result[newKey] = obj[key];
    }
  });
  return result;
};
