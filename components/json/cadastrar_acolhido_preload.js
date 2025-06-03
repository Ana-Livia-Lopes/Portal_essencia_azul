const { read, SolicitacaoAcolhido } = require("../../src")
const { NotFoundError } = require("../../src/server")

module.exports = async function execute(_, { query, session, response }) {
    if (query.id) {
        const acolhido = (await read(session.get("login"), SolicitacaoAcolhido, { id: query.id }, response))[0];
        if (!acolhido) throw new NotFoundError(response, "Solicitação não encontrada");
        return `
        <script>
            window.SOLICITACAO = ${JSON.stringify(acolhido)};
        </script>
        `;
    } else {
        return "";
    }
}