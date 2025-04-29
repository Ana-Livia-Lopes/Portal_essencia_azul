/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = function execute({ session }) {
    return JSON.stringify([...session.keys()])
}