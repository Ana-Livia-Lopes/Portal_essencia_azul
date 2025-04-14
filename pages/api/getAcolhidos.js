const { Acolhido, read, create } = require("../../src/");

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ session, response }) {
    let resp;
    try {
        resp = await read(session.id, Acolhido);
        // create("Linnnnn", Acolhido, {
        //     nome: "Lucas",
        //     idade: 17,
        //     email: "lucas@gmail.com",
        //     telefone: "9999999999999",
        //     nome_responsaveis: {

        //     }
        // })
    } catch(err) {
        resp = JSON.stringify({
            type: err.name,
            message: err.message
        });
        response.statusCode = 400;
    }
    return resp ? JSON.stringify(resp) : "";
}