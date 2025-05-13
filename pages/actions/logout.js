const { ClientError } = require("../../src/server/index")
const { logout } = require("../../src/");
const { timestamp } = require("../../src/util/index");

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function execute({ request, response, session, server }) {
    if (!request.headers["x-confirm-logout"]) throw new ClientError(response, "Para efetuar logout, é necessário enviar a header x-confirm-logout");
    if (!session) throw new ClientError(response, "Sessão não encontrada");

    logout(session);
    server.destroySession(session, response);
    return JSON.stringify({
        status: "okay",
        message: "Sessão finalizada com sucesso",
        timestamp: timestamp()
    });
}