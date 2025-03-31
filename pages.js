/**
 * @typedef {import("./src/tools/node/server.js")} ServerManager
 */

const path = require("path");
const Component = require( "./src/tools/node/component.js" );

/**
 * @param {ServerManager} server 
 */
module.exports = function deployPages(server) {
    server.pages.clear();

    delete require.cache[require.resolve("./pages_list.js")];
    const { pages, components } = require("./pages_list");

    server.openPageDir(path.resolve(__dirname, "./assets/"), "/");
    server.openPageDir(path.resolve(__dirname, "./pages/components"), "/components/");
    server.openPageList(pages, path.resolve(__dirname, "./pages/"));
    console.log(`Loaded ${server.pages.length} pages.`);

    components.forEach(component => {
        try {
            server.components.add(new Component(component.name, path.resolve(__dirname, "./pages/components/", component.filelocation), component.type));
        } catch (err) {
            console.error(`Error loading component: ${err?.message}`);
        }
    });
    console.log(`Loaded ${server.components.length} components.`);
}