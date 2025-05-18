/**
 * @param {object} param0
 * @param {import("../../src/server").Page.ErrorPageLoadParameters} param1
 */
module.exports = function execute(_, { error }) {
    return error.code.toString();
}