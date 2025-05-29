const { getDocs, query, collection, where } = require("firebase/firestore");
const { db } = require("./firebase.js");

const analyticsResult = {
    possuiCarteira: 75,
    possuiCordao: 40,
    possuiVaga: 60,
    possuiApoio: 30,
    totalAcolhidos: 100,
    totalEstudam: 80,
    qntdAutistas: 35,
    qntdNeurotipicos: 53,
    qntdInvestigacao: 12
};

async function createAnalytics() {
    const familias = await getDocs(query(collection(db, "familias")));

    const newValues = {
        possuiCarteira: 0,
        possuiCordao: 0,
        possuiVaga: 0,
        possuiApoio: 0,
        totalAcolhidos: 0,
        totalEstudam: 0,
        qntdAutistas: 0,
        qntdNeurotipicos: 0,
        qntdInvestigacao: 0
    };

    for (const familia of familias.docs) {
        const residentes = familia.data().residentes;
        const acolhidos = await getDocs(query(collection(db, "acolhidos"), where("ref_familia", "==", familia.ref)));

        if (residentes instanceof Array) {
            for (const residente of residentes) {
                if (residente) {
                    switch (residente.tipo) {
                        case "neurotipico":
                            newValues.qntdNeurotipicos++;
                            break;
                        case "autista":
                            newValues.qntdAutistas++;
                            break;
                        case "em investigacao":
                            newValues.qntdInvestigacao++;
                            break;
                    }
                }
            }
        }

        for (const acolhido of acolhidos.docs) {
            const data = acolhido.data();
            if (data.identificacoes?.ciptea) newValues.possuiCarteira++;
            if (data.identificacoes?.cordao) newValues.possuiCordao++;
            if (data.identificacoes?.vaga) newValues.possuiVaga++;
            newValues.totalAcolhidos++;
            if (data.escola) newValues.totalEstudam++;
            if (data.escola?.tem_suporte) newValues.possuiApoio++;
            newValues.qntdAutistas++;
        }
    }

    Object.assign(analyticsResult, newValues);
}

setInterval(() => {
    createAnalytics();
}, 1000 * 60 * 60 * 24)

module.exports = analyticsResult;