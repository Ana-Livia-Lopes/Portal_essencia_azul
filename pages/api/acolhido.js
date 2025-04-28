const { Acolhido, create, read, update, remove } = require("../../src");

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ request, response }) {
    switch (request.method) {
        case "GET":
            return JSON.stringify(await read("CHAVE", Acolhido, ));
        case "POST":
            // create()
            break;
        case "PUT":
            return JSON.stringify(await update("CHAVE", Acolhido, "FPj8BsSGhEBcRUbI0wOh", { so_isso_vei: false }, { editType: "set" }));
        case "PATCH":
            // return JSON.stringify(await update("CHAVE", Acolhido, "FPj8BsSGhEBcRUbI0wOh", { 
            //     comida_favorita: "Batata frita"
            // }));
        case "DELETE":
            // remove()
            break;
        default:
            response.statusCode = 405;
            throw new TypeError("Método inválido");
    }
    return "{}";
}