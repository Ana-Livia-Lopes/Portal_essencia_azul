/**
 * @typedef {import("./src/tools/node/page.js").PageListObject} PageListObject
 */

/**
 * @type {{
 *      pages: PageListObject[],
 *      dirs: {
 *          dirlocation: string,
 *          basepath: string
 *      }[]
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
            pagelocation: "gerenciamento"
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
        }
    ]
}