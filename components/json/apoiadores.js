const { getPublics, Apoiador } = require( "../../src/index.js" );
const escapeHtml = require("./_escapeHtml.js");

module.exports = async function execute() {
    const apoiadores = []
    for (const apoiador of (await getPublics(Apoiador)).values()) apoiadores.push({ id: apoiador.id, logo: await apoiador.references.get_logo(), ...apoiador.fields });
    return `<script>window.APOIADORES = ${escapeHtml(apoiadores)}</script>`;
}