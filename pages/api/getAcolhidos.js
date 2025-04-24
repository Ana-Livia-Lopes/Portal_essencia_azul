const { Acolhido, read } = require("../../src/");

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ session, response }) {
    let resp;
    try {
        resp = await read(session.id, Acolhido);
    } catch(err) {
        resp = JSON.stringify({
            type: err.name,
            message: err.message
        });
        response.statusCode = 400;
    }
    return resp ? JSON.stringify(resp) : "";
}