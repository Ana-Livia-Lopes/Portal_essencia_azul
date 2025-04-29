const { logout } = require("../../src/index.js")

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = function execute({ session }) {
    logout(session);
}