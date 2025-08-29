const { getPublics, Evento } = require( "../../src/index.js" );
const escapeHtml = require("./_escapeHtml.js");

module.exports = async function execute() {
    const eventos = []
    for (const evento of (await getPublics(Evento)).values()) eventos.push({ id: evento.id, imagem: await evento.references.get_imagem(), ...evento.fields });
    return `<script>window.EVENTOS = ${escapeHtml(eventos)}</script>`;
}