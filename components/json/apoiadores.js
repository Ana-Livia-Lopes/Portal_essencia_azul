const { getPublics, Apoiador } = require( "../../src/index.js" );
const escapeHtml = require("./_escapeHtml.js");

async function processApoiador(apoiador) {
    let newObj = {};
    newObj.id = apoiador.id;
    Object.assign(newObj, apoiador.fields);
    newObj = escapeHtml(newObj, false);
    newObj.link = apoiador.fields.link || null;
    newObj.logo = await apoiador.references.get_logo();
    return newObj;
}

module.exports = async function execute() {
    const apoiadores = []
    for (const apoiador of (await getPublics(Apoiador)).values()) apoiadores.push(await processApoiador(apoiador));
    return `<script>window.APOIADORES = ${JSON.stringify(apoiadores)}</script>`;
}