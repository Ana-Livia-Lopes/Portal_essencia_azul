const { login } = require("../../src/index.js")

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ session, body }) {
    try {
        await login(session, "lin@gmail.com", "roblox")
    } catch (err) {
        return `${err?.message}`;
    }
    return "true";
}