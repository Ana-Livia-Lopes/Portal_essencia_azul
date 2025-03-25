const { ServerManager } = require("./src/tools");

try { require("./config.json") } catch {
    const fs = require("fs");
    fs.writeFileSync("./config.json", JSON.stringify({
        server: {
            hostname: "localhost",
            port: 8080
        },
        database: {
            hostname: "localhost",
            username: "root",
            password: "",
            database: "db_essencia_azul"
        }
    }));
}

const config = require("./config.json");
const deployPages = require("./pages.js");

const server = new ServerManager();
deployPages(server);

process.stdin.on("data", data => {
    data = data.toString("utf-8").replace("\r\n", "").trim();

    if (data === "pages") console.table([...server.pages.values()].map(
        p => ({ path: p.path, ["content-type"]: p.contentType, file: p.filelocation })
    ));
    if (data === "pages reload") deployPages(server);

    if (data === "help") {
        console.table([
            { command: "pages", description: "Lista as páginas existentes." },
            { command: "pages reload", description: "Reinstancia as páginas da pages_list.js e dos diretórios automáticos." }
        ]);
    }
});

server.listen(config.server.port, config.server.port);
server.on("listening", () => {
    console.log(`Server listening at: http://${config.server.hostname}:${config.server.port}/`);
});