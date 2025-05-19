const { getPublics, Imagem } = require( "../../src/index.js" );

module.exports = async function execute({ fullObject = false } = {}) {
    const imagens = []
    for (const imagem of (await getPublics(Imagem)).values()) imagens.push(fullObject ? imagem : await imagem.references.get_conteudo());
    return `<script>window.IMAGENS = ${JSON.stringify(imagens)}</script>`;
}