const { SolicitacaoAcolhido, remove, read, isLogged } = require("../../src/index.js");
const { ClientError, AuthenticationError } = require("../../src/server");
const singleField = require("../_singleField.js");
const { addDoc, collection, Timestamp } = require("firebase/firestore");
const { db } = require("../../firebase.js");
const jsonField = require( "../_jsonField.js" );
const filterUndefined = require( "./_filterUndefined.js" );

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
            observacoes
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
    async delete({ params, session, response }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), SolicitacaoAcolhido, params.id, response);
    }
}