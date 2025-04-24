const { Acolhido, create } = require("../../src");

/**
 * @type {import("../../src/tools").Page.ExecutePageFunction}
 */
module.exports = async function execute({ }) {
    create("CHAVEEEEEEEEEEEEEEEEE", Acolhido, {
        nome: "Gabriel",
        idade: 2,
        escola: null,
        como_acalma: "Jogando roblox",
        atividades_nao_gosta: ["React Native", "Não Jogando Roblox"],
        hiperfoco: ["Roblox", "Homem Aranha"],
        interesses: ["Roblox", "Homem Aranha"],
        comida_favorita: "Barata frita",
        convenio: null,
        identificacoes: [],
        nivel_suporte: 12,
        observacoes: [ ],
        responsaveis: [
            {
                nome: "Isadora",
                relacao: "Mãe",
                contatos: [
                    {
                        tipo: "email",
                        valor: "isadora@smartweb.com.br"
                    }
                ]
            },
            {
                nome: "Lucas",
                relacao: "Pai",
                contatos: [
                    {
                        tipo: "telefone",
                        valor: "+12999923423"
                    }
                ]
            }
        ],
        ref_familia: "abcdefghjijklomn",
        restricoes_alimentares: [ "Papel" ],
        terapias: {
            faz: [ ],
            precisa: [ ]
        }
    })
}