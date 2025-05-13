const { MethodError, ClientError } = require("../../src/server/index")
const { isLogged, register } = require("../../src/");
const { timestamp } = require("../../src/util/index");

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function execute({ body, request, response, session }) {
    if (!isLogged(session)) throw new ClientError(response, "Inicie uma sessão para registrar um administrador");
    if (request.method !== "POST") throw new MethodError(response, `Método ${request.method} não permitido`);
    
    let { nome, email, senha, nivel } = body.fields;

    if (!nome || !email || !senha) throw new ClientError(response, `Informações faltando.`);
    
    await register(session, email, senha, nome, nivel);
    return JSON.stringify({
        status: "okay",
        message: "Conta criada com sucesso",
        timestamp: timestamp()
    });
}