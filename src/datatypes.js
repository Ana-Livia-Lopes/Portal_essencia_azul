var DataTypes = ( function() {
    const Acolhido = class Acolhido {
        id;

        nome;
        idade;
        email;
        telefone = [];
        nome_responsaveis = [];
        familia;
        nivel_suporte;
        escola;
        identificacao;
        interesses = [];
        hiperfoco = [];
        como_acalma;
        atividades_nao_gosta = [];
        restricoes_alimentares = [];
        comida_favorita;
        convenio;
        terapias = [];
        terapias_precisa = [];

        observacoes;

        documentos = [];
    }

    const Residente = class Residente {
        id;

        nome;
        tipo;

        familia;
    }

    const Familia = class Familia {
        id;

        sobrenome;
        endereco;

        get residentes() {}
        get acolhidos() {}
        get moradores() {}

        get autistas() {}
        get investigacao() {}
        get neurotipicos() {}

        observacoes;
    }

    const Documento = class Documento {
        id;
        acolhido;
        arquivo;
    }

    const Admin = class Admin {
        id;
        nome;
        email;
        senha;

        get alteracoes() {}
    }

    const Apoiador = class Apoiador {
        id;
        nome;
        logo;
        link;
    }

    return { Acolhido, Residente, Familia, Documento, Admin, Apoiador };
} )();

require("./tools/namespace.js")(DataTypes, "DataTypes");

module.exports = DataTypes;