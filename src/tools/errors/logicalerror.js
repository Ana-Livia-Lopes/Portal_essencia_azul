const Property = require("../property.js");

/**
 * Erro de execução lógica.
 */
class LogicalError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "LogicalError";
        Property.set(prototype, 'name', "hide", "freeze", "lock");
    }
}

module.exports = LogicalError;