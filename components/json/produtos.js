const { getPublics, Produto } = require( "../../src/index.js" );
const supabase = require( "../../supabase.js" );

module.exports = async function execute() {
    const produtos = []
    for (const produto of (await getPublics(Produto)).values()) produtos.push({ id: produto.id, imagem: await produto.references.get_imagem(), ...produto.fields });
    for (const produto of produtos) {
        if (produto.opcoes) {
            for (const opcao of produto.opcoes) {
                if (opcao.url_imagem) opcao.url_imagem = supabase.storage.from("public-images").getPublicUrl(opcao.url_imagem).data.publicUrl;
            }
        }
    }
    return `<script>window.PRODUTOS = ${JSON.stringify(produtos)}</script>`;
}