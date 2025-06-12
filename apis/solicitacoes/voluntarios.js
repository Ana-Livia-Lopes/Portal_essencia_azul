const { SolicitacaoVoluntario, remove, read, isLogged } = require("../../src/index.js");
const { ClientError, AuthenticationError } = require("../../src/server");
const singleField = require("../_singleField.js");
const { addDoc, collection } = require("firebase/firestore");
const { db } = require("../../firebase.js");
const jsonField = require("../_jsonField.js");
const filterUndefined = require("./_filterUndefined.js");
const { transporter } = require("../../mail.js");
const { auth } = require("../../config.json").mail;

/** @type {import("../../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, response }) {
        const nome = singleField(body.fields.nome);
        const cpf = singleField(body.fields.cpf);
        const email = singleField(body.fields.email);
        const telefone = singleField(body.fields.telefone);
        const como_ajudar = singleField(body.fields.como_ajudar);
        const por_que_ser_voluntario = singleField(body.fields.por_que_ser_voluntario);
        const data_solicitacao = singleField(body.fields.data_solicitacao);

        if (!nome || !cpf || !email || !telefone || !como_ajudar || !por_que_ser_voluntario) {
            throw new ClientError(response, "Parâmetros insuficientes");
        }

        await addDoc(collection(db, "solicitacoes_voluntarios"), filterUndefined({
            nome,
            cpf,
            email,
            telefone,
            como_ajudar,
            por_que_ser_voluntario,
            data_solicitacao
        }));

        return JSON.stringify({
            status: "okay",
            message: "Solicitação registrada com sucesso"
        })
    },
    async get({ params, response, session, query }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (params.id) {
            const solicitacao = (await read(session.get("login"), SolicitacaoVoluntario, { id: params.id }, response))[0];
            if (!solicitacao) throw new ClientError(response, "Solicitação não encontrada");
            return solicitacao;
        } else {
            return await read(session.get("login"), SolicitacaoVoluntario, {
                limit: query?.pageSize ?? 100,
                limitOffset: (query?.pageSize ?? 100) * (query?.page ?? 0),
                orderBy: query?.orderBy,
                orderDirection: query?.orderDirection,
            }, response);
        }
    },
    async delete({ params, session, response, request }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (!params.id) throw new ClientError(response, "ID não informado");
        const voluntario = await remove(session.get("login"), SolicitacaoVoluntario, params.id, response);
        if (request.headers["x-response-email"]) {
            let responseStatus = request.headers["x-response-email"];
            if (responseStatus === "accepted" || responseStatus === "refused") {
                console.log(responseStatus);
                await new Promise((res, rej) => {
                    const subject = responseStatus === "accepted" ?
                        "Sua solicitação para ser voluntário foi aceita!" :
                        "Sua solicitação para ser voluntário foi recusada...";
                    const text = responseStatus === "accepted" ?
                        `Olá${voluntario.fields.nome ? ", " + voluntario.fields.nome : ""}, a Essência Azul acabou de aceitar seu pedido para se tornar um voluntário!
Para saber mais sobre, entre em contato através de https://portalessenciaazul.com/contato.` :
                        `Olá${voluntario.fields.nome ? ", " + voluntario.fields.nome : ""}, a Essência Azul avaliou seu pedido para se tornar um voluntário, mas infelizmente foi recusado...
Para saber mais sobre, entre em contato através de https://portalessenciaazul.com/contato.`;
                    transporter.sendMail({
                        from: auth.user,
                        to: voluntario.fields.email,
                        subject,
                        html: `
                        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                            <img src="https://rsvzdbgemzdhmatbezlp.supabase.co/storage/v1/object/public/public-images//portal-essencia-azul.png" style="width: 220px;" />
                            <h1 style="color: #1535B5;">${subject}</h1>
                            <p style="font-size: 16px; line-height: 1.5;">${text}</p>
                            <p style="margin-top: 30px;">Atenciosamente,<br/>Associação Essência Azul</p>
                            <hr style="margin-top: 40px;" />
                            <p style="font-size: 12px; color: #999;">Você está recebendo este e-mail porque se cadastrou no site da Essência Azul.</p>
                        </div>
                        `,

                    }, (error, info) => {
                        if (error) rej(error); else res(info);
                    });
                });
            }
        }
        return voluntario;
    }
}