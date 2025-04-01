declare namespace BaseDataTypes {
    
    interface Acolhido {
        a: string
    }
    interface Residente {}
    interface Familia {}
    
    interface Apoiador {}
    interface Voluntario {}
    
    interface Documento {}
    interface Imagem {}
    
    interface Solicitacao {
        b: string
    }
    interface SolicitacaoAcolhido extends Solicitacao, Acolhido {}
    interface SolicitacaoVoluntario extends Solicitacao, Voluntario {}

    interface Admin {}
}

declare interface AlteracaoBase {
    id: number
    tabela: string
}

declare type TipoAlteracao = "adicionar" | "remover" | "editar"

declare interface AlteracaoAdicionar extends AlteracaoBase {
    tupla: object
}

declare interface AlteracaoRemover extends AlteracaoBase {
    tupla: object
}

declare interface AlteracaoEditar extends AlteracaoBase {
    campo: string
    valor_novo: any
    valor_antigo: any
}

declare namespace DataTypes {
    export { BaseDataTypes }

    interface DatabaseTuple<T> {
        /**
         * @param serverKey Chave de autorização de uso de construtor.
         * @param fields 
         * @throws {TypeError} Construtor ilegal
         */
        constructor(serverKey: string, fields: T)

        id: number

        static create(admin: Admin): DatabaseTuple
    }

    type Alteracao<A extends TipoAlteracao = TipoAlteracao> =
        A extends "adicionar" ? AlteracaoAdicionar :
        A extends "remover" ? AlteracaoRemover :
        A extends "editar" ? AlteracaoEditar :
        null

    class Acolhido implements BaseDataTypes.Acolhido, DatabaseTuple<BaseDataTypes.Acolhido> { // preciso diminuir isso plmds, sla, importar as propriedades direto pelo dbtuple.
        
    }

    class Admin implements BaseDataTypes.Admin, DatabaseTuple {

    }
}

export = DataTypes