const { addDoc, collection, doc, getDoc } = require("firebase/firestore");
const { RegistroParticipacao, read, Acolhido } = require("../../src");
const { ClientError, ServerError, NotFoundError } = require("../../src/server");
const { db } = require("../../firebase");
const filterUndefined = require("./_filterUndefined");

const familiaverifier = (v, _, __) =>
    typeof v === "object"
    && typeof v.nome === "string" && v.nome.trim() !== ""
    && typeof v.autista === "boolean"
    && typeof v.relacao === "string" && v.relacao.trim() !== ""
    && (typeof v.ref_acolhido === "string" || v.ref_acolhido === undefined);

/** @type {import("../../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ request, response, body, session }) {
        const participante = body.fields.participante;
        const tipo = body.fields.tipo;
        const contato = body.fields.contato;

        if (!participante || !tipo || !contato) {
            throw new ClientError(response, "Parâmetros insuficientes");
        }

        if (typeof participante !== "string" || participante.trim().length === 0) {
            throw new ClientError(response, "Nome do Participante não é um texto válido");
        }

        if (typeof contato !== "string" || contato.trim().length === 0) {
            throw new ClientError(response, "Contato não é válido");
        }

        if (!RegistroParticipacao.tipos.includes(tipo)) {
            throw new ClientError(response, "Tipo de convite não é válido");
        }

        const documento = {
            tipo,
            participante,
            contato,
        };

        if (tipo === "familia") {
            try {
                const familia = JSON.parse(body.fields.familia ?? "null");
    
                if (!(Array.isArray(familia) && familia.every(familiaverifier))) {
                    throw new ClientError(response, "Família deve ser uma lista de membros");
                }
    
                for (const membro of familia) {
                    if (membro.ref_acolhido) {
                        if (!(await getDoc(doc(db, "acolhidos", membro.ref_acolhido))).exists()) {
                            throw new NotFoundError(response, "Acolhido mencionado não encontrado");
                        }
    
                        membro.relacao = "Acolhido";
                        membro.autista = true;
                        membro.ref_acolhido = doc(db, "acolhidos", membro.ref_acolhido)
                    }
    
                    for (const key in membro) {
                        if (!(key === "nome" || key === "autista" || key === "relacao" || key === "ref_acolhido")) {
                            delete membro[key];
                        }
                    }
                }
    
                documento.familia = familia;
            } catch (err) {
                console.log(err);
                throw new ClientError(response, "Estrutura de dados da família inválida");
            }
        }

        await addDoc(collection(db, "registro_participacoes"), filterUndefined(documento));

        return {
            status: "okay",
            message: "Convite registrado com sucesso"
        }
    },
}