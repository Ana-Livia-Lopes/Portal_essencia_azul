const { getGroup } = require( "./_regexps.js" );

/**
 * @param {object} param0
 * @param {import("../../src/server").Page.ErrorPageLoadParameters} param1
 */
module.exports = function execute(_, { error }) {
    switch (getGroup(error.code.toString())) {
        case "permission":
            return "de permissão";
        case "notFound":
        case "client":
            return "na requisição";
        case "service":
            return "em um serviço";
        case "server":
        default:
            return "no servidor";
    }
}