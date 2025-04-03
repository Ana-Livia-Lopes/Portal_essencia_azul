function tryModules(...modules) {
    for (const mod of modules) {
        try {
            require(mod);
        } catch {
            console.error(`Erro ao importar "${mod}". Utilize \x1b[48;2;16;0;48m\x1b[38;2;95;158;160mnpm install\x1b[0m para instalar as dependências do projeto.`);
            process.exit();
        }
    }
}

tryModules("ws", "chokidar", "mysql");

const { ServerManager } = require("./src/tools");
const path = require("path");
const fs = require("fs");

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

console.clear();

console.log("\n\x1b[1m\x1b[38;2;0;51;204mBem vindo ao servidor do Portal Essência Azul\x1b[0m");
console.log("\x1b[38;2;169;169;169mDigite \x1b[48;2;16;0;48m\x1b[38;2;95;158;160mhelp\x1b[0m\x1b[38;2;169;169;169m para listar os comandos do servidor.\n\n\x1b[0m");

const config = require("./config.json");
const deployPages = require("./pages.js");

const server = new ServerManager({ componentRequests: true });
deployPages(server);

require("./terminal.js")(server);

server.listen(config.server.port, config.server.port);
server.on("listening", () => {
    console.log(`Server listening at: http://${config.server.hostname}:${config.server.port}/`);
});