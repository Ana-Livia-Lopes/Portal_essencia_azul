declare class ServerError extends Error {}

ServerError.prototype.name = "ServerError"

export = ServerError