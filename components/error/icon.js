const { getGroup } = require( "./_regexps.js" );

const iconForGroup = {
    general: "/img/code-solid.svg",
    service: "/img/database-solid.svg",
    permission: "/img/shield-solid.svg",
    notFound: "/img/cube-solid.svg",
    client: "/img/window-solid.svg",
    server: "/img/server-solid.svg",
}

/**
 * @param {object} param0
 * @param {import("../../src/server").Page.ErrorPageLoadParameters} param1
 */
module.exports = function execute(_, { error }) {
    return iconForGroup[getGroup(error.code.toString())] ?? iconForGroup["general"];
}