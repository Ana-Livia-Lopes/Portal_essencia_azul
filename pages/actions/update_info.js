// const { isLogged } = require("../../src/operations")
const { AuthenticationError, MethodError, ClientError } = require("../../src/server/")
const { isLogged } = require('../../src/')
const footer = require('../../footer.json');
const fs = require('fs');
const { timestamp } = require("../../src/util");

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function({ session, response, request, body }) {
    delete require.cache[require.resolve('../../footer.json')];
    if (!session || !isLogged(session)) throw new AuthenticationError(response, "Você precisa estar autenticado para atualizar as informações do rodapé");
    if (request.method !== "POST") throw new MethodError(response, `Método ${request.method} não permitido`);
    
    const {
        endereco,
        email,
        instagram,
        facebook,
        whatsapp
    } = body.fields;

    console.log(body);

    const novoFooter = {
        endereco: {
            texto: endereco?.texto ?? footer.endereco.texto,
            link: endereco?.link ?? footer.endereco.link
        },
        email: email ?? footer.email,
        instagram: instagram ?? footer.instagram,
        facebook: {
            usuario: facebook?.usuario ?? footer.facebook.usuario,
            nome: facebook?.nome ?? footer.facebook.nome,
        },
        whatsapp: {
            footer_1: whatsapp?.footer_1 ?? footer.whatsapp.footer_1,
            footer_2: whatsapp?.footer_2 ?? footer.whatsapp.footer_2,
            catalogo: whatsapp?.catalogo ?? footer.whatsapp.catalogo,
        }
    };

    await fs.promises.writeFile('./footer.json', JSON.stringify(novoFooter, null, 4), 'utf-8');

    return JSON.stringify({
        status: "okay",
        message: "Informações do rodapé atualizadas com sucesso",
        timestamp: timestamp()
    });
}