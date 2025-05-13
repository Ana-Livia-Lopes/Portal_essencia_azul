const fs = require("fs");
const path = require("path");
const { ServerError } = require("../src/tools");

let pageHTMLbase;
async function getPageHTMLbase() {
    if (pageHTMLbase) return pageHTMLbase;
    pageHTMLbase = (await fs.promises.readFile(path.resolve(__dirname, "./_erro.html"))).toString("utf-8");
    return pageHTMLbase;
}

const codeDescription = {
    [401]: "Você não está autorizado a acessar esta página.",
    [403]: "Você não tem permissão para acessar esta página.",
    [404]: "Página não encontrada.",
    [500]: "Erro interno no servidor.",
    [503]: "Serviço temporariamente indisponível."
}

const classificationIcon = {
    general: "/img/code-solid.svg",
    database: "/img/database-solid.svg",
    security: "/img/shield-solid.svg",
    data: "/img/cube-solid.svg",
    client: "/img/window-solid.svg",
    server: "/img/server-solid.svg",
}

function iconForCode(code) {
    switch (code) {
        case 401:
        case 403:
            return classificationIcon.security;
        case 404:
            return classificationIcon.client;
        case 500:
            return classificationIcon.server;
        case 503:
            return classificationIcon.database;
        default:
            return classificationIcon.general;
    }
}

module.exports = async function execute($1, $2) {
    try {
        let { localhooks, server, response } = $1;
        let pageHTML = (await getPageHTMLbase());
        response.statusCode = Number.isInteger(localhooks.error?.code) ? localhooks.error?.code : 500;

        pageHTML = pageHTML
            .replace("<__SERVER_RESP/>", localhooks.error)
            .replace("<__CODE/>", response.statusCode ?? "500")
            .replace("<__CODE/>", response.statusCode ?? "500")
            .replace("<__TITLESUF/>", response.statusCode.toString().startsWith("5") ? " no servidor" : "")
            .replace("<__DESCR/>", codeDescription[response.statusCode] ?? "Nenhuma informação sobre...")
            .replace("<__ICONSRC/>", classificationIcon[localhooks.error.classificationIcon] ?? iconForCode(response.statusCode) ?? classificationIcon["general"]);
        pageHTML = server.components.load(pageHTML, { ...$1, ...$2 });
        return pageHTML;
    } catch(err) {
        $1.content.clear();
        $1.content.append(`Erro fatal no processamento de erro, comunique a gerência do servidor: ${err}`);
    }
}