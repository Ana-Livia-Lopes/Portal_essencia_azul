const { getPublics, Produto } = require( "../../src/index.js" );

module.exports = async function execute() {
    const produtos = []
    for (const produto of (await getPublics(Produto)).values()) produtos.push({ id: produto.id, imagem: await produto.references.get_imagem(), ...produto.fields });
    return `<script>window.PRODUTOS = ${JSON.stringify(produtos)}</script>`;
}