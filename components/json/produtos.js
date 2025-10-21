const { getPublics, Produto } = require( "../../src/index.js" );
const { ServerError } = require( "../../src/server/errors.js" );
const supabase = require( "../../supabase.js" );
const escapeHtml = require("./_escapeHtml.js");

const ignoresProduto = [ "opcoes" ];
const ignoresOpcao = [ "imagem" ];

function processOpcao(opcao) {
    const url_imagem = opcao.url_imagem;
    opcao = escapeHtml(opcao, false, ignoresOpcao);
    if (url_imagem) opcao.imagem = supabase.storage.from("public-images").getPublicUrl(url_imagem).data.publicUrl
    return opcao;
}

async function processProduto(produto) {
    let novoObj = {}
    
    novoObj.id = produto.id;
    Object.assign(novoObj, produto.fields);
    novoObj = escapeHtml(novoObj, false, ignoresProduto);
    if (produto.fields.opcoes) {
        novoObj.opcoes = produto.fields.opcoes.map(processOpcao);
    }
    novoObj.imagem = await produto.references.get_imagem();
    return novoObj;
}

module.exports = async function execute(_, { response }) {
    const produtos = [];
    for (const produto of (await getPublics(Produto)).values()) {
        produtos.push(await processProduto(produto));
    }

    console.log(produtos);

    return `<script>window.PRODUTOS = ${JSON.stringify(produtos)}</script>`;
}