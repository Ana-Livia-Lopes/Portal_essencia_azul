const { getPublics, Evento } = require( "../../src/index.js" );

module.exports = async function execute({ fullObject = false } = {}) {
    const eventos = []
    for (const evento of (await getPublics(Evento)).values()) eventos.push(fullObject ? evento : await evento.references.get_imagem());
    return `<script>window.EVENTOS = ${JSON.stringify(eventos)}</script>`;
}