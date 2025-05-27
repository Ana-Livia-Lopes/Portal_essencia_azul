const { create, Produto, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require( "./_singleField.js" );
const jsonField = require("./_jsonField.js")

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, session, response }) {
        if (!body.files.blob || !body.fields.nome || !body.fields.preco) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        const opcoesArr = body.fields["opcoes[]"] ? jsonField(body, "opcoes[]") : [];
        const opcoes = [];
        for (let i = 0; i < opcoesArr.length; i++) {
            let opcao = opcoesArr[i];
            opcao = JSON.parse(opcao);
            if (body.files[`blob_opcao[${i}]`]) opcao.blob = await getFormidableBlob(body.files[`blob_opcao[${i}]`]);
            opcoes.push(opcao);
        }

        if (blob.type !== "image/jpeg" && blob.type !== "image/png") throw new ClientError(response, "Tipo de arquivo inválido");
        if (blob.size > maxSize) throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");

        return await create(session.get("login"), Produto, {
            blob,
            nome: singleField(body.fields.nome),
            descricao: singleField(body.fields.descricao),
            preco: parseFloat(singleField(body.fields.preco)),
            opcoes
        }, response);
    },
    async get({ query, params, response, session }) {
        if (params.id) {
            const produto = (await read(session.get("login"), Produto, { id: params.id }, response))[0];
            return produto;
        } else {
            return await read(session.get("login"), Produto, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Produto, params.id, response);
    },
    async patch({ body, session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {}
        if (body.fields.nome) patchFields.nome = body.fields.nome[0];
        if (body.fields.descricao) patchFields.descricao = body.fields.descricao[0];
        if (body.fields.preco) patchFields.preco = parseFloat(body.fields.preco[0]);
        if (body.files.blob) {
            const blob = await getFormidableBlob(body.files.blob);
            if (blob.type !== "image/jpeg" && blob.type !== "image/png") throw new ClientError(response, "Tipo de arquivo inválido");
            if (blob.size > maxSize) throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
            patchFields.blob = blob;
        }
        if (body.fields["opcoes[]"]) {
            patchFields.opcoes = [];
            for (let i = 0; i < body.fields["opcoes[]"].length; i++) {
                let opcao = body.fields["opcoes[]"][i];
                opcao = JSON.parse(opcao);
                if (body.files[`blob_opcao[${i}]`]) opcao.blob = await getFormidableBlob(body.files[`blob_opcao[${i}]`]);
                patchFields.opcoes.push(opcao);
            }
        }
        return await update(session.get("login"), Produto, params.id, patchFields, {
            editType: "update"
        }, response);
    },
}