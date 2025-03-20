type Filters = "blockEmpty" | "blockArrays" | "blockBooleans" | "blockNumbers" | "onlyAlphaNumeric"

/**
 * Verifica se um valor está apto a ser convertido em string.
 * @param value 
 * @param filters 
 */
export function validstr(value: any, ...filters: Filters[]): boolean