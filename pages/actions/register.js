const { MethodError, ClientError } = require("../../src/server/index")
const { isLogged, register } = require("../../src/");
const { timestamp } = require("../../src/util/index");
const singleField = require("../../apis/_singleField.js");
const jsonField = require("../../apis/_jsonField.js");
const getFormidableBlob = require( "../../apis/_getFormidableBlob.js" );

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function execute({ body, request, response, session }) {
    if (!isLogged(session)) throw new ClientError(response, "Inicie uma sessão para registrar um administrador");
    if (request.method !== "POST") throw new MethodError(response, `Método ${request.method} não permitido`);
    
    let nome = singleField(body.fields.nome);
    let email = singleField(body.fields.email);
    let senha = singleField(body.fields.senha);
    let nivel = body.fields.nivel ? singleField(body.fields.nivel) : "simples";
    let blob = body.files.blob ? await getFormidableBlob(body.files.blob) : undefined;

    if (!nome || !email || !senha || !nivel) throw new ClientError(response, `Informações faltando`);
    
    await register(session, email, senha, nome, nivel, blob, response);
    return JSON.stringify({
        status: "okay",
        message: "Conta criada com sucesso",
        timestamp: timestamp()
    });
}