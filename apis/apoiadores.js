const { read, Apoiador, create, remove, update } = require("../src/index.js");
const { ClientError } = require("../src/server");
const Redirect = require("../src/server/redirect.js");
const getFormidableBlob = require("./_getFormidableBlob.js");
const singleField = require("./_singleField.js");

const maxSize = 50 * 1024 * 1024;

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ params, session, query, request, response }) {
        if (params.id) {
            const apoiador = (await read(session.get("login"), Apoiador, { id: params.id }, response))[0];
            if (request.url.includes("/url")) throw Redirect(await apoiador.references.get_logo());
            return apoiador;
        } else {
            return await read(session.get("login"), Apoiador, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async post({ body, session, response }) {
        if (!body.files.blob || !body.fields.nome || !body.fields.link) {
            throw new ClientError(response, "Parâmetros insuficientes");
        }
        const blob = await getFormidableBlob(body.files.blob);
        if (blob.type !== "image/jpeg" && blob.type !== "image/png" && blob.type !== "image/svg+xml") {
            throw new ClientError(response, "Tipo de arquivo inválido");
        }
        if (blob.size > maxSize) {
            throw new ClientError(response, "Arquivo excede o tamanho máximo de 10MB");
        }
        return await create(session.get("login"), Apoiador, {
            nome: singleField(body.fields.nome),
            link: singleField(body.fields.link),
            blob
        }, response);
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Apoiador, params.id, response);
    },
    async patch({ body, session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {};
        if (body.fields.nome) patchFields.nome = singleField(body.fields.nome);
        if (body.fields.link) patchFields.link = singleField(body.fields.link);
        if (body.files.blob) {
            const blob = await getFormidableBlob(body.files.blob);
            if (blob.type !== "image/jpeg" && blob.type !== "image/png" && blob.type !== "image/svg+xml") {
                throw new ClientError(response, "Tipo de arquivo inválido");
            }
            if (blob.size > maxSize) {
                throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
            }
            patchFields.blob = blob;
        }
        console.log(patchFields)
        return await update(session.get("login"), Apoiador, params.id, patchFields, {
            editType: "update"
        }, response);
    },
};