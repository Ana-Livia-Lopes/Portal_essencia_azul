const { MethodError, ClientError } = require("../../src/server/index")
const { login } = require("../../src/");
const { timestamp } = require("../../src/util/index");

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function execute(parameters) {
    let { body, request, response, server } = parameters;
    if (request.method !== "POST") throw new MethodError(response, `Método ${request.method} não permitido`);
    const { email, senha } = body.fields;

    if (!email && !senha) throw new ClientError(response, `Informações faltando.`);
    server.startSession(parameters);
    let { session } = parameters;
    await login(session, email, senha);
    return JSON.stringify({
        status: "okay",
        message: "Sessão iniciada com sucesso",
        timestamp: timestamp()
    });
}