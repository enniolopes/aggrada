/* eslint-disable @typescript-eslint/no-explicit-any */
export const flattenObject = ({
  obj,
  parentKey = '',
  result= {},
  depth = 0,
  maxDepth = 20,
}: {
  obj: any;
  parentKey?: string;
  result?: Record<string, any>;
  depth?: number;
  maxDepth?: number;
}): Record<string, any> => {
  // Proteção contra referências circulares e profundidade excessiva
  if (obj === null || obj === undefined || typeof obj !== 'object' || depth > maxDepth) {
    return result;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursão para objetos aninhados
      flattenObject({
        obj: value,
        parentKey: newKey,
        result,
        depth: depth + 1,
        maxDepth
      });
    } else {
      // Valor primitivo, array, null ou undefined
      result[newKey] = value;
    }
  });
  
  return result;
};