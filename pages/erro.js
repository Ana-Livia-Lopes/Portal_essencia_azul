const fs = require("fs");
const path = require("path");

/** @type {import("../src/tools").Page.ExecutePageOnErrorCallback} */
module.exports = async function execute($1, $2) {
    let { content, localhooks, server } = $1;

    try {
        console.log("Erro vei");
        // content.append(JSON.stringify(localhooks));
        let pageHTML = await fs.promises.readFile(path.resolve(__dirname, "./erro.html"))
        pageHTML = pageHTML.toString("utf-8").replace("<ERRO/>", localhooks.error);
        pageHTML = server.components.load(pageHTML, { ...$1, ...$2 });
        // content.append(pageHTML);
        return pageHTML;
    } catch(err) {
        console.log("Error Processing Error:", err);
    }
}