/**
 * @typedef {import("./src/tools/node/server.js")} ServerManager
 */

const path = require("path");
const Component = require( "./src/tools/node/component.js" );
const Page = require("./src/tools/node/page.js");

/**
 * @param {ServerManager} server 
 */
module.exports = function deployPages(server) {
    server.pages.clear();

    delete require.cache[require.resolve("./pages_list.js")];
    const { pages, components } = require("./pages_list");

    for (const watcher of Page.MapDir.watchers.values()) watcher.close();
    Page.MapDir.watchers.clear();

    server.openPageDir(path.resolve(__dirname, "./assets/"), "/");
    server.openPageList(pages, path.resolve(__dirname, "./pages/"));
    const onError = require("./pages/events/onError.js");
    server.pages.events.error.push(onError);
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