const Property = require("../property.js");

/**
 * Erro de instanciação de classes de interface.
 */
class InterfaceError extends Error {
    constructor(message = "Cannot instantiate interface", options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "InterfaceError";
        Property.set(prototype, "name", "hide", "freeze", "lock");
    }
}

module.exports = InterfaceError;