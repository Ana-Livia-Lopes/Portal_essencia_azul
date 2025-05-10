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
            filelocation: "dev_docs.html",
            pagelocation: "dev/docs",
        },
        {
            filelocation: "cadastrar_acolhido.html",
            pagelocation: "cadastrar_acolhido"
        },
        {
            filelocation: "relatorios.html",
            pagelocation: "relatorios"
        },
        {
            filelocation: "solic_receb.html",
            pagelocation: "solic_receb"
        },
        {
            filelocation: "api/acolhido.js",
            pagelocation: [ "api/acolhido", "api/acolhido/[id]" ],
            pagetype: "execute",
            urltype: "special"
        },
        {
            filelocation: "api/admin.js",
            pagelocation: [ "api/admin", "api/admin/[id]" ],
            pagetype: "execute",
            urltype: "special"
        },
        {
            filelocation: "api/login.js",
            pagelocation: "api/login",
            pagetype: "execute"
        },
        {
            filelocation: "api/logout.js",
            pagelocation: "api/logout",
            pagetype: "execute"
        },
        {
            filelocation: "api/session.js",
            pagelocation: "api/session",
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
            name: "acessibilidade",
            filelocation: "acessibilidade.html"
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
        },
        {
            name: "gerenciamento-voluntarios",
            filelocation: "gerenciamento/voluntarios.html"
        },
        {
            name: "gerenciamento-administradores",
            filelocation: "gerenciamento/administradores.html"
        },
        {
            name: "gerenciamento-familias",
            filelocation: "gerenciamento/familias.html"
        },
        {
            name: "gerenciamento-relatorios",
            filelocation: "gerenciamento/relatorios.html"
        },
        {
            name: "gerenciamento-acolhidos",
            filelocation: "gerenciamento/acolhidos.html"
        },
        {
            name: "carrossel",
            filelocation: "carrossel.html"
        }
    ],
    errorPage: new Page(path.join(__dirname, "pages/erro.js"), "/error/", "execute", "text/html", { events: { error(_, __, error) {
        console.log("Error in Error", error);
    } } })
}