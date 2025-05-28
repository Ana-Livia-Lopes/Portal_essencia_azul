const { read, SolicitacaoAcolhido } = require("../../src")

module.exports = async function execute(_, { query, session, response }) {
    if (query.id) {
        const acolhido = (await read(session.get("login"), SolicitacaoAcolhido, { id: query.id }, response))[0];
        return `
        <script>
            window.SOLICITACAO = ${JSON.stringify(acolhido)};
        </script>
        `;
    } else {
        return "";
    }
}