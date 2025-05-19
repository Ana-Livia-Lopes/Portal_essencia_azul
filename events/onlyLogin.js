const { isLogged } = require("../src/")
const { AuthenticationError } = require( "../src/server/index" )

module.exports = function onlyLogin({ session, response }) {
    if (!session || !isLogged(session)) throw AuthenticationError(response, "Você precisa estar autenticado para acessar esta página");
}