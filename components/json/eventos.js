const { getPublics, Evento } = require( "../../src/index.js" );

module.exports = async function execute() {
    const eventos = []
    for (const evento of (await getPublics(Evento)).values()) eventos.push(await evento.references.get_conteudo());
    return `<script>window.EVENTOS = ${JSON.stringify(eventos)}</script>`;
}