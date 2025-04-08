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
    server.openPageDir(path.resolve(__dirname, "./pages/components"), "/components/");
    server.openPageList(pages.map(p => {
        const onError = require("./pages/events/onError.js");
        if (typeof p.events === "undefined") p.events = {}
        switch (typeof p.events?.error) {
            case "undefined":
                p.events.error = [ onError ];
                break;
            case "function":
                p.events.error = [ p.events.error, onError ]
                break;
            case "object":
                p.events.error.push(onError);
                break;
            default:
                break;
            }
        return p;
    }), path.resolve(__dirname, "./pages/"));
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