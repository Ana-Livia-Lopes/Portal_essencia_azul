const chalk = require("chalk");
const { Server, Page, Cache, Component, Watcher, Event } = require("./src/server/");
const path = require( "path" );
const { hostname, port, devMode } = require("./config.json").server;
const Command = require("./cli.js");
require("./src/");

const server = new Server();
console.clear();

const grey = chalk.rgb(169, 169, 169);
const command = chalk.rgb(95, 158, 160).bgRgb(16, 0, 48);

console.log(`\n${chalk.blueBright("Bem-vindo(a) ao Portal Essência Azul")}`);
console.log(`${grey("Digite")} ${command("help")} ${grey("para listar os comandos do servidor.")}\n`);

server.on("listening", () => {
    console.log(`HTTP Server listening at ${chalk.blueBright("http://" + hostname + ":" + port + "/")}`);
});

server.pages.events.error = [ require("./onError.js") ];

function loadContent() {
    if (!Cache.enabled) delete require.cache[require.resolve("./config.json")];
    const { pages, components, events } = require("./config.json").server;

    for (const watcher of server.watchers) watcher.close();

    server.pages.clear();
    server.components.clear();
    Event.clear();

    for (const [ dir, handlerConfigs ] of Object.entries(pages)) {
        server.watchPages(path.join(__dirname, dir), handlerConfigs);
    }
    for (const [ dir, handlerConfigs ] of Object.entries(components)) {
        server.watchComponents(path.join(__dirname, dir), handlerConfigs);
    }
    for (const [ dir, handlerConfigs ] of Object.entries(events)) {
        server.watchEvents(path.join(__dirname, dir), handlerConfigs);
    }
}

Cache.enabled = !devMode;

server.listen(port, hostname);

loadContent();

function getPagesForTable() {
    return [...server.pages.entries()].map(([rawPath, page]) => ({
        path: rawPath, type: page._type, file: path.relative(__dirname, page.file), contentType: page.contentType, events: page.events
    }));
}

function getComponentsForTable() {
    return [...server.components.values()].map(component => ({
        name: component.name, type: component._type, file: path.relative(__dirname, component.file)
    }));
}

const commands = [
    new Command("count", () => {
        console.log(`Pages: ${server.pages.size}`);
        console.log(`Components: ${server.components.size}`);
    }),
    new Command("pages", () => {
        console.table(getPagesForTable());
    }, [
        new Command("screens", () => {
            console.table(getPagesForTable().filter(page => page.type === "screen"));
        }),
        new Command("rest", () => {
            console.table(getPagesForTable().filter(page => page.type === "rest"));
        }),
        new Command("assets", () => {
            console.table(getPagesForTable().filter(page => page.type === "asset"));
        }),
        new Command("executable", () => {
            console.table(getPagesForTable().filter(page => page.type === "executable"));
        }),
        new Command("search", (...args) => {
            const pages = getPagesForTable()
            if (!args[0]) return console.table(pages);
            const flags = Command.getFlags(...args);
            if (!args[0].startsWith("--")) flags.path = args[0];
            let filteredPages = pages.filter(page => {
                return (!flags.path || page.path.includes(flags.path)) &&
                       (!flags.file || page.file.includes(flags.file)) &&
                       (!flags.fileExt || page.file.endsWith(flags.fileExt)) &&
                       (!flags.type || page.type === flags.type);
            });
            if ("count" in flags) return console.log(filteredPages.length);
            console.table(filteredPages);
        })
    ]),
    new Command("components", () => {
        console.table(getComponentsForTable());
    }, [
        new Command("search", (...args) => {
            const components = getComponentsForTable()
            if (!args[0]) return console.table(components);
            const flags = Command.getFlags(...args);
            if (!args[0].startsWith("--")) flags.name = args[0];
            let filteredComponents = components.filter(component => {
                return (!flags.name || component.name.includes(flags.name)) &&
                       (!flags.file || component.file.includes(flags.file)) &&
                       (!flags.fileExt || component.file.endsWith(flags.fileExt)) &&
                       (!flags.type || component.type === flags.type);
            });
            if ("count" in flags) return console.log(filteredComponents.length);
            console.table(filteredComponents);
        })
    ]),
    new Command("event", (...args) => {
        try {
            return console.log(Event.get(args[0]));
        } catch(err) {
            return console.log("No event found")
        }
    }),
    new Command("reload", () => {
        loadContent();
    }),
    new Command("cache", () => {
        Cache.enabled = !Cache.enabled;
        console.log(`Cache ${Cache.enabled ? "enabled" : "disabled"}`);
    }),
    new Command("memory", () => {
        const memoryUsage = process.memoryUsage();

        console.log("Memory Usage:");
        console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`); // Resident Set Size
        console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Array Buffers: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
    }),
    new Command("close", () => {
        console.log("Closing server..."); 
        process.exit(0);
    }),
]

const cli = new Command.Collection();
for (const command of commands) cli.add(command);

cli.listen();