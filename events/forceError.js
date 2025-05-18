const { ServerError, ClientError, NotFoundError, ServiceError, PermissionError, AuthenticationError, MethodError } = require( "../src/server/index" )

module.exports = function forceError({ response }) {
    throw new MethodError(response, "Erro forçado");
}