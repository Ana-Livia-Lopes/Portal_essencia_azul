const { SolicitacaoAcolhido, remove, read, isLogged } = require("../../src/index.js");
const { ClientError, AuthenticationError } = require("../../src/server");
const singleField = require("../_singleField.js");
const { addDoc, collection, Timestamp } = require("firebase/firestore");
const { db } = require("../../firebase.js");
const jsonField = require( "../_jsonField.js" );
const filterUndefined = require( "./_filterUndefined.js" );
const { transporter } = require("../../mail.js");
const { auth } = require("../../config.json").mail;

/** @type {import("../../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, response }) {
        const nome = singleField(body.fields.nome);
        const data_nascimento = Timestamp.fromDate(new Date(singleField(body.fields.data_nascimento)));
        const responsaveis = jsonField(body, "responsaveis");
        const nivel_suporte = singleField(body.fields.nivel_suporte);
        const escola = body.fields.escola ? jsonField(body, "escola") : null;
        const identificacoes = jsonField(body, "identificacoes");
        const interesses = jsonField(body, "interesses");
        const hiperfoco = jsonField(body, "hiperfoco");
        const como_acalma = singleField(body.fields.como_acalma);
        const atividades_nao_gosta = jsonField(body, "atividades_nao_gosta");
        const restricoes_alimentares = jsonField(body, "restricoes_alimentares");
        const comida_favorita = singleField(body.fields.comida_favorita);
        const convenio = body.fields.convenio ? singleField(body.fields.convenio) : null;
        const terapias = jsonField(body, "terapias");
        const residentes = jsonField(body, "residentes");
        const endereco = singleField(body.fields.endereco);
        const observacoes = singleField(body.fields.observacoes);
        const remetente = jsonField(body, "remetente");

        if (!nome || !data_nascimento || !responsaveis || !nivel_suporte) {
            throw new ClientError(response, "Parâmetros insuficientes");
        }

        await addDoc(collection(db, "solicitacoes_acolhidos"), filterUndefined({
            nome,
            data_nascimento,
            responsaveis,
            nivel_suporte,
            escola,
            identificacoes,
            interesses,
            hiperfoco,
            como_acalma,
            atividades_nao_gosta,
            restricoes_alimentares,
            comida_favorita,
            convenio,
            terapias,
            residentes,
            endereco,
            observacoes,
            remetente,
            data_solicitacao: Timestamp.fromDate(new Date())
        }));

        return JSON.stringify({
            status: "okay",
            message: "Solicitação registrada com sucesso"
        });
    },
    async get({ params, response, session }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (params.id) {
            const solicitacao = (await read(session.get("login"), SolicitacaoAcolhido, { id: params.id }, response))[0];
            if (!solicitacao) throw new ClientError(response, "Solicitação não encontrada");
            return solicitacao;
        } else {
            return await read(session.get("login"), SolicitacaoAcolhido, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async delete({ params, session, response, request }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (!params.id) throw new ClientError(response, "ID não informado");
        const acolhido = await remove(session.get("login"), SolicitacaoAcolhido, params.id, response);
        if (request.headers["x-response-email"]) {
            let responseStatus = request.headers["x-response-email"];
            if (responseStatus === "accepted" || responseStatus === "refused") {
                await new Promise((res, rej) => {
                    const subject = responseStatus === "accepted" ?
                        `Sua solicitação de cadastro de ${acolhido.fields.nome} foi aceita!` :
                        `Sua solicitação de cadastro de ${acolhido.fields.nome} foi recusada...`;
                    const text = responseStatus === "accepted" ?
                    `Olá${acolhido.fields.remetente?.nome ? ", " + acolhido.fields.remetente?.nome : ""}, a Essência Azul acabou de aceitar seu pedido para tornar ${acolhido.fields.nome} um de nossos acolhidos!
Para saber mais sobre, entre em contato através de https://portalessenciaazul.com/contato/.` :
                    `Olá${acolhido.fields.remetente?.nome ? ", " + acolhido.fields.remetente?.nome : ""}, a Essência Azul avaliou seu pedido para tornar ${acolhido.fields.nome} um de nossos acolhidos, mas infelizmente foi recusado...
Para saber mais sobre, entre em contato através de https://portalessenciaazul.com/contato/.`;
                    transporter.sendMail({
                        from: auth.user,
                        to: acolhido.fields.remetente?.email,
                        subject,
                        text,
                    }, (error, info) => {
                        if (error) rej(error); else res(info);
                    });
                });
            }
        }
        return acolhido;
    }
}