const { RegistroParticipacao, read, remove } = require("../src")

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ request, response, query, session }) {
        let quantidade = 0;
        let autistas = 0;
        let familias = 0;
        const data = await read(session.get("login"), RegistroParticipacao, {}, response);
        for (const item of data) {
            quantidade += 1;
            if (item.fields.tipo == "familia") {
                familias += 1;
                for (const membro of item.fields.familia) {
                    quantidade += 1;
                    if (membro.autista) {
                        autistas += 1;
                    }
                    if (membro.ref_acolhido) {
                        membro.ref_acolhido = membro.ref_acolhido.id;
                    }
                }
            }
        }
        return {
            statistics: {
                participantes: quantidade,
                autistas,
                familias,
            },
            data,
        };
    },
    async delete({ request, response, session, params }) {
        try {
            await remove(session.get("login"), RegistroParticipacao, params.id, response);
            return {
                status: "ok",
            }
        } catch (e) {
            console.log(e);
            return {
                status: "error",
                error: e,
            }
        }
    }
}