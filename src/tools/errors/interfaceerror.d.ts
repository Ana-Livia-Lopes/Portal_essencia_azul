declare class InterfaceError extends Error {}

InterfaceError.prototype.name = "InterfaceError"
InterfaceError.prototype.message = "Cannot instantiate interface"

export = InterfaceError