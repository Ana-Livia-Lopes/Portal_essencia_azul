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
        }
    ]
}