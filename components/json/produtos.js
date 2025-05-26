const { getPublics, Produto } = require( "../../src/index.js" );
const { ServerError } = require( "../../src/server/errors.js" );
const supabase = require( "../../supabase.js" );

module.exports = async function execute(_, { response }) {
    const produtos = []
    for (const produto of (await getPublics(Produto)).values()) produtos.push(
        { id: produto.id, imagem: await produto.references.get_imagem(), ...produto.fields, opcoes: [ ...produto.fields.opcoes ] }
    );
    for (const produto of produtos) {
        if (produto.opcoes) {
            for (const opcao of produto.opcoes) {
                if (opcao.url_imagem) opcao.imagem = supabase.storage.from("public-images").getPublicUrl(opcao.url_imagem).data.publicUrl;
            }
        }
    }
    return `<script>window.PRODUTOS = ${JSON.stringify(produtos)}</script>`;
}