const { doc, Timestamp } = require( "firebase/firestore" );
const { read, Acolhido, Documento, create, remove, update, Familia } = require( "../src/index.js" );
const { ClientError, NotFoundError } = require( "../src/server" );
const Redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require("./_singleField.js");
const jsonField = require("./_jsonField.js");
const { db } = require( "../firebase.js" );

/** @type {import("../src/server/").Page.RestHandlersObject} */
module.exports = {
    async get({ params, request, query, response, session }) {
        if (request.headers["x-acolhido-docs"]) {
            if (!params.id) throw new ClientError(response, "ID não informado");
            const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            if (query.getImagem === "true") {
                const imagem = await acolhido.references.get_imagem();
                if (!imagem) throw Redirect("/img/user-solid.svg");
                throw Redirect(imagem);
            }
            const docs = await acolhido.references.get_documentos();
            if (params.doc) {
                const doc = docs.find(doc => doc.id === params.doc);
                if (!doc) throw new NotFoundError(response, "Documento não encontrado");
                throw Redirect(await doc.references.get_arquivo());
            }
            return docs;
        } else {
            if (params.id) {
                const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
                if (params.doc) {
                    const docs = await acolhido.references.get_documentos();
                    const doc = docs.find(doc => doc.id === params.doc);
                    if (!doc) throw new NotFoundError(response, "Documento não encontrado");
                    throw Redirect(await doc.references.get_arquivo());
                }
                return acolhido;
            } else {
                return await read(session.get("login"), Acolhido, {
                    limit: query.pageSize ?? 100,
                    limitOffset: query.pageSize * (query.page ?? 0),
                    orderBy: query.orderBy,
                    orderDirection: query.orderDirection,
                }, response);
            }
        }
    },
    async post({ body, request, session, response }) {
        if (request.headers["x-acolhido-docs"]) {
            const acolhido = (await read(session.get("login"), Acolhido, { id: body.fields.acolhidoId }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            if (!body.files.blob || !body.fields.nome) throw new ClientError(response, "Parâmetros insuficientes");
            const blob = await getFormidableBlob(body.files.blob);
            const documento = await create(session.get("login"), Documento, {
                nome: singleField(body.fields.nome),
                descricao: singleField(body.fields.descricao),
                blob
            }, response);
            return await update(session.get("login"), Acolhido, acolhido.id, {
                ref_documentos: [ ...acolhido.fields.ref_documentos, doc(db, "documentos", documento.id) ]
            });
        } else {
            const nome = singleField(body.fields.nome);
            const data_nascimento = Timestamp.fromDate(new Date(singleField(body.fields.data_nascimento)));
            const responsaveis = jsonField(body, "responsaveis");
            const id_familia = singleField(body.fields.id_familia);
            const id_parente = singleField(body.fields.id_parente);
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
            const observacoes = jsonField(body, "observacoes");

            const blob = await getFormidableBlob(body.files.blob);

            async function criarNovaFamilia() {
                return doc(db, "familias", (await create(session.get("login"), Familia, {
                    sobrenome: nome.split(" ").pop(),
                    endereco: "",
                    residentes: {},
                    observacoes: ""
                })).id);
            }

            const ref_familia = id_familia ?
                doc(db, "familias", id_familia) :
                id_parente ? 
                    ( (await read(session.get("login"), Acolhido, { id: id_parente }, response))[0]?.fields?.ref_familia ?? await criarNovaFamilia() ) :
                    await criarNovaFamilia();
            
            if (!nome || !data_nascimento || !responsaveis || !nivel_suporte || !identificacoes) {
                throw new ClientError(response, "Parâmetros obrigatórios ausentes");
            }

            return await create(session.get("login"), Acolhido, {
                nome,
                data_nascimento,
                responsaveis,
                ref_familia,
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
                observacoes,
                blob
            }, response);
        }
    },
    async patch({ params, body, request, response, session }) {
        if (request.headers["x-acolhido-docs"]) {
            if (!params.id) throw new ClientError(response, "ID não informado");
            const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            if (!params.doc) throw new ClientError(response, "Documento não informado");
            const docs = await acolhido.references.get_documentos();
            const doc = docs.find(doc => doc.id === params.doc);
            if (!doc) throw new NotFoundError(response, "Documento não encontrado");
            const patchFields = {};
            if (body.fields.nome) patchFields.nome = singleField(body.fields.nome);
            if (body.fields.descricao) patchFields.descricao = singleField(body.fields.descricao);
            if (body.files.blob) {
                const blob = await getFormidableBlob(body.files.blob);
                patchFields.blob = blob;
            }
            return await update(session.get("login"), Documento, doc.id, patchFields, {
                editType: "update"
            }, response);
        } else {
            if (!params.id) throw new ClientError(response, "ID não informado");
            const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            const patchFields = {};
            if (body.fields.nome) patchFields.nome = singleField(body.fields.nome);
            if (body.fields.data_nascimento) patchFields.data_nascimento = Timestamp.fromDate(new Date(singleField(body.fields.data_nascimento)));
            if (body.fields.responsaveis) patchFields.responsaveis = jsonField(body, "responsaveis");
            if (body.fields.id_familia) patchFields.ref_familia = doc(db, "familias", singleField(body.fields.id_familia));
            if (body.fields.id_parente) {
                const parente = (await read(session.get("login"), Acolhido, { id: body.fields.id_parente }, response))[0];
                if (!parente) throw new NotFoundError(response, "Parente não encontrado");
                patchFields.ref_familia = parente.fields.ref_familia;
            }
            if (body.fields.nivel_suporte) patchFields.nivel_suporte = singleField(body.fields.nivel_suporte);
            if (body.fields.escola) patchFields.escola = jsonField(body, "escola");
            if (body.fields.identificacoes) patchFields.identificacoes = jsonField(body, "identificacoes");
            if (body.fields.interesses) patchFields.interesses = jsonField(body, "interesses");
            if (body.fields.hiperfoco) patchFields.hiperfoco = jsonField(body, "hiperfoco");
            if (body.fields.como_acalma) patchFields.como_acalma = singleField(body.fields.como_acalma);
            if (body.fields.atividades_nao_gosta) patchFields.atividades_nao_gosta = jsonField(body, "atividades_nao_gosta");
            if (body.fields.restricoes_alimentares) patchFields.restricoes_alimentares = jsonField(body, "restricoes_alimentares");
            if (body.fields.comida_favorita) patchFields.comida_favorita = singleField(body.fields.comida_favorita);
            if (body.fields.convenio) patchFields.convenio = singleField(body.fields.convenio);
            if (body.fields.terapias) patchFields.terapias = jsonField(body, "terapias");
            if (body.fields.observacoes) patchFields.observacoes = jsonField(body, "observacoes");
            if (body.files.blob) {
                const blob = await getFormidableBlob(body.files.blob);
                patchFields.blob = blob;
            }
            return await update(session.get("login"), Acolhido, acolhido.id, patchFields, {
                editType: "update"
            }, response);
        }
    },
    async delete({ params, request }) {
        if (request.headers["x-acolhido-docs"]) {
            if (!params.id) throw new ClientError(response, "ID não informado");
            if (!params.doc) throw new ClientError(response, "Documento não informado");
            const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            const docs = await acolhido.references.get_documentos();
            const doc = docs.find(doc => doc.id === params.doc);
            if (!doc) throw new NotFoundError(response, "Documento não encontrado");
            await remove(session.get("login"), Documento, doc.id, response);
            return await update(session.get("login"), Acolhido, acolhido.id, {
                ref_documentos: acolhido.fields.ref_documentos.filter(ref => ref.id !== doc.id)
            }, response);
        } else {
            if (!params.id) throw new ClientError(response, "ID não informado");
            const acolhido = (await read(session.get("login"), Acolhido, { id: params.id }, response))[0];
            if (!acolhido) throw new NotFoundError(response, "Acolhido não encontrado");
            return await remove(session.get("login"), Acolhido, acolhido.id, response);
        }
    }
};