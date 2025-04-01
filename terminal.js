/**
 * @param {import("./src/tools/node/server.js")} server 
*/
module.exports = function terminal(server) {
    const pathLib = require("path");
    const loadPages = require("./pages.js");
    const pagesSearchFlags = [ "--default", "--contentType", "--fileExt", "--fileName", "--pathName", "--pageType" ];
    const pageSearchResultObjectAndPush = (arr, page) => {
        arr.push({ path: page.path, ["content-type"]: page.contentType, file: pathLib.relative(__dirname, page.filelocation), type: page.pageType });
    };
    const componentsSearchFlags = [ "--default", "--type", "--fileName", "--fileExt" ];
    const componentSearchResultObjectAndPush = (arr, component) => {
        arr.push({ name: component.name, file: pathLib.relative(__dirname, component.filelocation), type: component.type });
    }

    const generalSearchFlags = [ "--fromEnd", "--count" ];

    function helpArrayMap (arr) {
        return { comando: arr[0], descricao: arr[1], flags: arr[2] ?? [] };
    }

    process.stdin.on("data", data => {
        data = data.toString("utf-8").replace("\r\n", "").trim();
    
        let params = data.split(" ").slice(1);
        let flags = params.filter(f => f?.startsWith("--"));
        
        if (data.startsWith("pages")) {
            if (params[0] === "reload" || params[0] === "restart") return loadPages(server);
    
            if (params[0] === "length" || params[0] === "count") return console.log(`Atualmente existem ${server.pages.length} páginas no servidor.`);
    
            if (params[0] === "search" || params[0] === undefined) {
                let search = params[0] === "search" ? params[1] ?? "" : "";
                
                let sFlags = params.filter(f => f?.startsWith("--") && pagesSearchFlags.includes(f));
                let flag = sFlags.length > 0 ? sFlags[sFlags.length - 1] : "--default";
    
                if (flag === "--default" && !search.startsWith("/")) search = "/" + search;
                if (flag === "--fileExt" && !search.startsWith(".")) search = "." + search;
    
                let searchSide = flags.includes("--fromEnd") ? "endsWith" : "startsWith";
                search = searchSide === "endsWith" ? (search.startsWith("/") ? search.slice(1) : search) : search
    
                let searchResult = [];
                for (const [path, page] of server.pages.entries()) {
                    switch (flag) {
                        default:
                        case "--default":
                            if (path[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                        case "--contentType":
                            if (page.contentType[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                        case "--fileExt":
                            let fileExt = pathLib.parse(page.filelocation).ext;
                            if (fileExt[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                        case "--fileName":
                            let fileName = pathLib.parse(page.filelocation).name;
                            if (fileName[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                        case "--pathName":
                            let pathName = pathLib.parse(path).name;
                            if (pathName[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                        case "--pageType":
                            if (page.pageType[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                            break;
                    }
    
                }
                if (flags.includes("--count")) console.log(`${searchResult.length} páginas correspondem a pesquisa.`); else console.table(searchResult);
                return;
            }
        }
    
        if (data.startsWith("components")) {
            if (params[0] === "reload" || params[0] === "restart") return loadPages(server);
    
            if (params[0] === "length" || params[0] === "count") return console.log(`Atualmente existem ${server.components.length} componentes no servidor.`);
    
            if (params[0] === "search" || params[0] === undefined) {
                let search = params[0] === "search" ? params[1] ?? "" : "";
                let searchSide = flags.includes("--fromEnd") ? "endsWith" : "startsWith";
    
                let results = [];
    
                let sFlags = params.filter(f => f?.startsWith("--") && componentsSearchFlags.includes(f));
                let flag = sFlags.length > 0 ? sFlags[sFlags.length - 1] : "--default";
    
                for (const [name, component] of server.components.entries()) {
                    switch (flag) {
                        default:
                        case "--default":
                            if (name[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                            break;
                        case "--type":
                            if (component.type[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                            break;
                        case "--fileName":
                            let fileName = pathLib.parse(component.filelocation).name;
                            if (fileName[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                            break;
                        case "--fileExt":
                            let fileExt = pathLib.parse(component.filelocation).ext;
                            if (fileExt[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                            break;
                    }
                }
    
                if (flags.includes("--count")) console.log(`${results.length} componentes correspondem a pesquisa.`); else console.table(results);
                return;
            }
        }
    
        if (data.startsWith("reload")) return loadPages(server);

        if (data.startsWith("help")) {
            let area = params[0];
            console.log("\n\x1b[1m\x1b[4m------------LISTA DE COMANDOS------------\x1b[0m");
            switch (area) {
                case undefined:
                    console.group();
                    console.log("\n\n\x1b[38;2;255;215;0mTópicos de pesquisa de comando:\x1b[0m");
                    console.log("Utilize o comando \x1b[48;2;16;0;48m\x1b[38;2;95;158;160mhelp <topico>\x1b[0m com um dos tópicos abaixo para obter mais informações.");
                    console.table([
                        [ "pages | p", "Comandos de páginas." ],
                        [ "components | c", "Comandos de componentes." ],
                        [ "general | g", "Comandos gerais." ]
                    ].map(helpArrayMap));
                    console.groupEnd();
                    break;
                default:
                case "p":
                case "pages":
                    console.group();
                    console.log("\n\n\x1b[38;2;255;215;0mComandos de páginas:\x1b[0m");
                    console.table([
                        [ "pages", "Lista todas as páginas no servidor." ],
                        [ "pages search <pesquisa> [...flags]", "Pesquisa dentro das páginas do servidor.", [ "PageSearchFlags", "GeneralSearchFlags" ] ],
                        [ "pages reload", "Recarrega todas as páginas do servidor." ],
                        [ "pages length", "Mostra o número de páginas no servidor." ],
                        [ "pages count", "Mostra o número de páginas no servidor." ]
                    ].map(helpArrayMap));
                    console.log("PageSearchFlags (Máximo 1 por pesquisa):\x1b[38;2;169;169;169m", pagesSearchFlags.join(", "), "\x1b[0m");
                    console.log("GeneralSearchFlags:\x1b[38;2;169;169;169m", generalSearchFlags.join(", "), "\x1b[0m");
                    console.groupEnd();
                    break;
                case "c":
                case "components":
                    console.group();
                    console.log("\n\n\x1b[38;2;95;158;160mComandos de componentes:\x1b[0m");
                    console.table([
                        [ "components", "Lista todos os componentes no servidor." ],
                        [ "components search <pesquisa> [...flags]", "Pesquisa dentro dos componentes do servidor.", [ "ComponentSearchFlags", "GeneralSearchFlags" ] ],
                        [ "components reload", "Recarrega todos os componentes do servidor." ],
                        [ "components length", "Mostra o número de componentes no servidor." ],
                        [ "components count", "Mostra o número de componentes no servidor." ]
                    ].map(helpArrayMap));
                    console.log("ComponentSearchFlags (Máximo 1 por pesquisa):\x1b[38;2;169;169;169m", componentsSearchFlags.join(", "), "\x1b[0m");
                    console.log("GeneralSearchFlags:\x1b[38;2;169;169;169m", generalSearchFlags.join(", "), "\x1b[0m");
                    console.groupEnd();
                    break;
                case "g":
                case "general":
                    console.group();
                    console.log("\n\n\x1b[38;2;220;20;60mComandos gerais:\x1b[0m");
                    console.table([
                        [ "help <topico>", "Lista os comandos do servidor." ],
                        [ "exit", "Encerra o servidor." ],
                        [ "close", "Encerra o servidor." ]
                    ].map(helpArrayMap));
                    console.groupEnd();
                    break;
            }
            return;
        }
    
        if (data.startsWith("close") || data.startsWith("exit")) {
            console.clear();
            console.log("Fechando o servidor...");
            process.exit(0);
        }
    });
}