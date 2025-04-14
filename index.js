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

tryModules("ws", "chokidar", "mysql", "firebase/app", "firebase/firestore");

const { ServerManager, Page } = require("./src/tools");
const path = require("path");
const fs = require("fs");

try { require("./config.json") } catch {
    fs.writeFileSync("./config.json", JSON.stringify({
        server: {
            hostname: "localhost",
            port: 8080
        }
    }));
}

console.clear();

console.log("\n\x1b[1m\x1b[38;2;0;51;204mBem vindo ao servidor do Portal Essência Azul\x1b[0m");
console.log("\x1b[38;2;169;169;169mDigite \x1b[48;2;16;0;48m\x1b[38;2;95;158;160mhelp\x1b[0m\x1b[38;2;169;169;169m para listar os comandos do servidor.\n\n\x1b[0m");

const config = require("./config.json");
const deployPages = require("./pages.js");

if (typeof config.firebase !== "object" || !config.firebase) {
    console.log("Por favor, insira as configurações privadas do projeto Firebase em config.json");
    console.log(
`\x1b[38;2;95;158;160m{
    "server": { ... },
    "firebase": {
        "apiKey": ...,
        "authDomain": ...,
        "projectId": ...,
        "storageBucket": ...,
        "messagingSenderId": ...,
        "appId": ...,
        "measurementId": ...
    }
}\x1b[0m`);
    process.exit();
}

if (typeof config.mysql !== "object" || !config.mysql) {
    console.log("Por favor, insira as configurações privadas do banco de dados MySQL em config.json");
    console.log(
`\x1b[38;2;95;158;160m{
    "server": { ... },
    "mysql": {
        "hostname": ...,
        "username": ...,
        "password": ...,
        "database": ...
    }
}\x1b[0m`);
    process.exit();
}

const server = new ServerManager({ componentRequests: true });
deployPages(server);

require("./terminal.js")(server);

server.listen(config.server.port, config.server.port);
server.on("listening", () => {
    console.log(`Server listening at: http://${config.server.hostname}:${config.server.port}/`);
});