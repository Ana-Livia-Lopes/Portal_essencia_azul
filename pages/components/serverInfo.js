/** @type {import("../../src/tools").Component.ExecuteComponentFunction} */
module.exports = function execute(_, { server, page }) {
    return "<div>" +
        `<p>Existem ${server.pages.length} páginas no servidor</p>` +
        `<p>Existem ${server.components.length} componentes no servidor</p>` +
        `<p>Existem ${server.sessions.size} sessões ativas no servidor</p>` +
        `<p>Estamos atualmente na página: ${page.path}</p>` +
    "</div>"
}