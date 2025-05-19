const { getPublics, Produto } = require( "../../src/index.js" );

module.exports = async function execute({ fullObject = false } = {}) {
    const produtos = []
    for (const produto of (await getPublics(Produto)).values()) produtos.push(fullObject ? produto : await produto.references.get_imagem());
    return `<script>window.PRODUTOS = ${JSON.stringify(produtos)}</script>`;
}