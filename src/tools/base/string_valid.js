var validstr = (function (){
    const nonToStringObject = /\[object (.+)\]/;

    const alphaNumericRegExp = /^[a-zA-Z0-9_]*$/;

    /**
     * Verifica se um valor é válido à ser string.
     * @param {any} string 
     * @param {..."blockEmpty"|"blockArrays"|"blockBooleans"|"blockNumbers"|"onlyAlphaNumeric"} filters 
     * @param {boolean}
     */
    function validstr(value, ...filters) {
        if (typeof value == "undefined" || value == null) return false;
        if ((typeof value == "number" || typeof value == "bigint") && filters.includes("blockNumbers")) return false;
        if (typeof value == "boolean" && filters.includes("blockBooleans")) return false;
        if (filters.includes("onlyAlphaNumeric") && !alphaNumericRegExp.test(value)) return false;
        if (value instanceof Array && filters.includes("blockArrays")) return false;
        if (typeof value.toString != "function") return false;

        try {
            value = String(value);
        } catch(err) {
            console.error(`Error at converting object into string: ${err.message}`);
            return false;
        }

        if (nonToStringObject.test(value)) return false;
        if (filters.includes("blockEmpty") && require("./string_empty")(value)) return false;

        return true;
    }
    return validstr;
})()

module.exports = validstr;