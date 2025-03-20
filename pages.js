/**
 * @typedef {import("./src/tools/node/server.js")} ServerManager
 */

const path = require("path");

/**
 * @param {ServerManager} server 
 */
module.exports = function deployPages(server) {
    server.pages.clear();

    delete require.cache[require.resolve("./pages_list.js")];
    const { pages } = require("./pages_list");

    server.openPageDir(path.resolve(__dirname, "./assets/"), "/");
    server.openPageDir(path.resolve(__dirname, "./pages/components"), "/components/");
    server.openPageList(pages, path.resolve(__dirname, "./pages/"));
}