const Property = require("../property.js");

class ServerError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }
    
    static {
        const prototype = this.prototype;
        prototype.name = "ServerError";
        Property.set(prototype, "name", "hide", "freeze", "lock");
    }
}

module.exports = ServerError;