const { Admin, create, read, update, remove } = require("../../src");
const { CodedError } = require("../../src/tools");

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ request, response, session }) {
    let login = session.get("login");
    switch (request.method) {
        case "GET":
            return JSON.stringify(await read(login, Admin, ));
        case "POST":
            return JSON.stringify(await create(login, Admin, { chave: 213, nome: "Lin", email: "lin@gmail.com", nivel: 3, senha: "roblox" }))
        case "PUT":
            throw new CodedError(405, "Method not allowed");
        case "PATCH":
            return JSON.stringify(await update(login, Admin, "q9kvIo9RqR5T1qustpu6", { 
                nome: "Linnnnn", chave: "testeeeeee"
            }));
        case "DELETE":
            // remove()
            break;
        default:
            response.statusCode = 405;
            throw new TypeError("Método inválido");
    }
    return "{}";
}