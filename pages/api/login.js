const { login } = require("../../src/index.js")

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ session, body }) {
    if (!body || !body.email | !body.password) throw new TypeError("Email ou senha não informados.");

    try {
        await login(session, body.email, body.password);
    } catch (err) {
        return `${err?.message}`;
    }
    return "true";
}