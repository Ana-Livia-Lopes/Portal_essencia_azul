const { getPublics, Imagem } = require( "../../src/index.js" );

module.exports = async function execute() {
    const imagens = []
    for (const imagem of (await getPublics(Imagem)).values()) imagens.push({ id: imagem.id, url: await imagem.references.get_conteudo() });
    return `<script>window.IMAGENS = ${JSON.stringify(imagens)}</script>`;
}