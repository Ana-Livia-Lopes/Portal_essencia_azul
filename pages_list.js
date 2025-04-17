/**
 * @typedef {import("./src/tools/node/page.js").PageListObject} PageListObject
 */

const path = require("path");
const { Page } = require("./src/tools/index.js");

/**
 * @type {{
 *      pages: PageListObject[],
 *      components: {
 *          filelocation: string,
 *          name: string,
 *          type: "hypertext" | "execute"
 *      }[],
 *      errorPage: Page
 * }}
 */
module.exports = {
    pages: [
        {
            filelocation: "index.html",
            pagelocation: [ "/", "index", "home", "inicio" ]
        },
        {
            filelocation: "voluntarios.html",
            pagelocation: "voluntarios"
        },
        {
            filelocation: "recuperar_senha.html",
            pagelocation: "recuperar_senha"
        },
        {
            filelocation: "gerenciamento.html",
            pagelocation: "gerenciamento",
            events: {
                before: [ require("./pages/events/onlyLogin.js") ]
            }
        },
        {
            filelocation: "formulario.html",
            pagelocation: "formulario"
        },
        {
            filelocation: "eventos.html",
            pagelocation: "eventos"
        },
        {
            filelocation: "entrar.html",
            pagelocation: [ "login", "entrar" ]
        },
        {
            filelocation: "documentos.html",
            pagelocation: "documentos"
        },
        {
            filelocation: "diagnostico.html",
            pagelocation: "diagnostico"
        },
        {
            filelocation: "contato.html",
            pagelocation: "contato"
        },
        {
            filelocation: "conscientizacao.html",
            pagelocation: "conscientizacao"
        },
        {
            filelocation: "catalogo.html",
            pagelocation: "catalogo"
        },
        {
            filelocation: "cadastrar_adm.html",
            pagelocation: "cadastrar_adm"
        },
        {
            filelocation: "dev.html",
            pagelocation: "dev"
        },
        {
            filelocation: "cadastrar_acolhido.html",
            pagelocation: "cadastrar_acolhido"
        },
        {
            filelocation: "api/getAcolhidos.js",
            pagelocation: "api/getAcolhidos",
            pagetype: "execute"
        },
        {
            filelocation: "../assets/img/logo.png",
            pagelocation: "favicon.ico",
            contenttype: "image/png"
        }
    ],
    components: [
        {
            name: "header",
            filelocation: "header.html"
        },
        {
            name: "footer",
            filelocation: "footer.html"
        },
        {
            name: "serverInfo",
            filelocation: "serverInfo.js",
            type: "execute"
        },
        {
            name: "date",
            filelocation: "date.js",
            type: "execute"
        },
        {
            name: "sessionId",
            filelocation: "sessionId.js",
            type: "execute"
        },
        {
            name: "list_input",
            filelocation: "list_input.html"
        }
    ],
    errorPage: new Page(path.join(__dirname, "pages/erro.js"), "/error/", "execute", "text/html", { events: { error(_, __, error) {
        console.log("Error in Error", error);
    } } })
}