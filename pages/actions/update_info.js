const { isLogged } = require("../../src/operations")
const { AuthenticationError } = require("../../src/server/")

module.exports = function({ session, response }) {
    if (!session || !isLogged(session)) throw new AuthenticationError(response, "Você precisa estar autenticado para atualizar as informações do rodapé");
    
}