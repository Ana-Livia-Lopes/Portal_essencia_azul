const { read, SolicitacaoAcolhido, SolicitacaoVoluntario } = require("../../src")
const escapeHtml = require("./_escapeHtml.js");

module.exports = async function execute(_, { session, response }) {
    const acolhidos = await read(session.get("login"), SolicitacaoAcolhido, undefined, response);
    const voluntarios = await read(session.get("login"), SolicitacaoVoluntario, undefined, response);

    return `
    <script>
        window.SOLICITACOES_ACOLHIDOS = ${escapeHtml(acolhidos)};
        window.SOLICITACOES_VOLUNTARIOS = ${escapeHtml(voluntarios)};
    </script>
    `;
}