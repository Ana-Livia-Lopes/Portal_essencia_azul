const { isLogged } = require("../../src");

const content = `<button onclick="adicionarApoiador()" class="botao-editar conteudo-site">Adicionar apoiador</button>`;

module.exports = function execute(_, { session }) {
    if (!session) return "";
    if (!isLogged(session)) return "";
    return content;
}