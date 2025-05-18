const permission = /^(401|403)$/
const notFound = /^(404)$/
const service = /^(503)$/
const client = /^4\d\d$/
const server = /^5\d\d$/

/**
 * @param {string} codeStr 
 * @returns {"permission"|"notFound"|"service"|"client"|"server"}
 */
function getGroup(codeStr) {
    if (permission.test(codeStr)) return "permission";
    if (notFound.test(codeStr)) return "notFound";
    if (service.test(codeStr)) return "service";
    if (client.test(codeStr)) return "client";
    if (server.test(codeStr)) return "server";
}

module.exports = {
    permission,
    notFound,
    service,
    client,
    server,
    getGroup: (getGroup).bind(module.exports)
}