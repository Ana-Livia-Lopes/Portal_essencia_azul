declare class PermissionError extends Error {}

PermissionError.prototype.name = "PermissionError"

export = PermissionError