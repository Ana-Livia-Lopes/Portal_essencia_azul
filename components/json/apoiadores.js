const { getPublics, Apoiador } = require( "../../src/index.js" );

module.exports = async function execute({ fullObject = false } = {}) {
    const apoiadores = []
    for (const apoiador of (await getPublics(Apoiador)).values()) apoiadores.push(fullObject ? apoiador : await apoiador.references.get_logo());
    return `<script>window.APOIADORES = ${JSON.stringify(apoiadores)}</script>`;
}