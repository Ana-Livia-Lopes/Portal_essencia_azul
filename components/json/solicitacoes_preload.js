const { read, SolicitacaoAcolhido, SolicitacaoVoluntario } = require("../../src")

module.exports = async function execute(_, { session, response }) {
    const acolhidos = await read(session.get("login"), SolicitacaoAcolhido, undefined, response);
    const voluntarios = await read(session.get("login"), SolicitacaoVoluntario, undefined, response);

    return `
    <script>
        window.SOLICITACOES_ACOLHIDOS = ${JSON.stringify(acolhidos)};
        window.SOLICITACOES_VOLUNTARIOS = ${JSON.stringify(voluntarios)};
    </script>
    `;
}