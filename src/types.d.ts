declare namespace BaseDataTypes {
    type TipoContato = "email"|"telefone"
    interface Contato {
        tipo: TipoContato
        valor: string
    }
    interface Responsavel {
        nome: string
        relacao: string
        contatos: Contato[]
    }

    class Acolhido {
        nome: string
        idade: number
        responsaveis: Responsavel[]
        ref_familia: string
        nivel_suporte: 1 | 2 | 3
        escola: {
            nome: string,
            tem_suporte: boolean
        } | null
        identificacoes: {
            cordao: boolean,
            ciptea: boolean,
            vaga_exclusiva: boolean
        }
        interesses: string[]
        hiperfoco: string[]
        como_acalma: string
        atividades_nao_gosta: string[]
        restricoes_alimentares: string[]
        comida_favorita: string
        convenio: string | null
        terapias: {
            faz: string[]
            precisa: string[]
        }
        ref_documentos: string[]

        observacoes: string | string[]
    }
    type TipoResidente = "neurotipico" | "autista" | "investigacao"
    interface Residente {
        nome: string
        tipo: TipoResidente
    }
    class Familia {
        sobrenome: string
        endereco: string
        residentes: Residente[]

        observacoes: string | string[]
    }

    class Apoiador {
        nome: string
        logo: string
        link: string
    }
    class Voluntario {
        nome: string
        cpf: string
        email: string
        telefone: string
        como_ajudar: string
        por_que_ser_voluntario: string
    }
    
    class Documento {
        id_arquivo: number
    }
    class Imagem {
        titulo: string
        descricao: string
        grupos: string[]
        id_conteudo: number
    }
    class Evento {
        titulo: string
        descricao: string
        data: Date
        id_conteudo: number
    }
    class Produto {
        nome: string
        descricao: string
        preco: number
        id_imagem: number
        opcoes: Map<string, Produto> // nome-opcao => id_imagem (banco mysql)
    }
    interface Remetente {
        nome: string
        contatos: Contato[]
    }
    
    abstract class Solicitacao {
        remetente: Remetente
    }
    class SolicitacaoAcolhido extends Solicitacao {
        acolhido: Acolhido
    }
    class SolicitacaoVoluntario extends Solicitacao {
        voluntario: Voluntario
    }

    type NivelAdmin = 1 | 2 | 3
    // São cumulativos (ex: 2 tem acesso a tudo de 1 e 3 tem acesso a tudo de 1 e 2)
    // 1 tem acesso ao gerenciamento (não pode manter administradores além dele próprio)
    // 2 tem acesso a páginas de desenvolvimento, pode manter administadores de nivel 1
    // 3 não pode ser removido, pode manter administradores de nivel 1 e 2

    class Admin {
        nome: string
        email: string
        senha: string
        nivel: NivelAdmin
        chave: string
    }

    type Alteracao<A extends TipoAlteracao = TipoAlteracao> =
        A extends "adicionar" ? AlteracaoAdicionar :
        A extends "remover" ? AlteracaoRemover :
        A extends "editar" ? AlteracaoEditar :
        ( AlteracaoAdicionar | AlteracaoRemover | AlteracaoEditar )
}

declare abstract class AlteracaoBase {
    ref_admin: string
    colecao: string
}
    
declare class AlteracaoAdicionar extends AlteracaoBase {
    documento: object
}

declare class AlteracaoRemover extends AlteracaoBase {
    documento: object
}

declare class AlteracaoEditar extends AlteracaoBase {
    documento_novo: object
    documento_antigo: object
}

declare type TipoAlteracao = "adicionar" | "remover" | "editar"

declare namespace DataTypes {
    export { BaseDataTypes }

    /**
     * Valor filler para substituir valores que não devem ser obtidos do banco de dados.
     */
    export class PrivateHiddenData extends null {}

    abstract class DatabaseInfo<F extends object> {
        collection: string
        fields: F

        /**
         * Defina uma propriedade estática protectedFields do tipo `string[]` para impedir o acesso delas em qualquer leitura.
         * 
         * Deverá substituir * por todas as outras propriedades que não sejam estas e tentar utilizar uma dessas em uma SearchRule deverá retornar um erro de permissão.
         * 
         * Essas verificações devem ser feitas pelos métodos CRUD.
         * 
         * O método login será o único que permitirá o retorno de campos privados de Admin.
         */
        static privateFields?: string[]
        static collection: string
    }
    
    /**
     * Esta classe representa apenas uma leitura do banco, editar seus valores aqui não alterarão diretamente o banco de dados.
     * 
     * Ações CRUD estarão restritas atrás da classe Admin, que possui sua chave de alteração para validar os métodos de operação no banco.
     */
    export abstract class DatabaseDocument<F extends object> extends DatabaseInfo<F> {
        /**
         * @param creationKey Chave de autorização de uso de construtor.
         * @param fields 
         * @throws {TypeError} Construtor privado
         */
        constructor(creationKey: string, id: number, fields: F)
    
        id: number
        references: { [key: string]: any }
        methods: { [key: string]: Function }
    }

    type AnalyticsAggregateFunction = "min" | "max" | "count" | "sum" | "avg"

    /**
     * Diferente de uma tupla, os valores serão definidos baseados em uma função agregadora.
     * 
     * Não possui ID.
     */
    export abstract class DatabaseAnalytics<F extends DatabaseDocument<object>> extends DatabaseInfo<F["fields"]> {
        aggregator: AnalyticsAggregateFunction
    } // alterar



    export class Acolhido extends DatabaseDocument<BaseDataTypes.Acolhido> {
        references: {
            get familia(): Familia,
            get documentos(): Documento
        }
    }
    export class Familia extends DatabaseDocument<BaseDataTypes.Familia> {
        references: {
            get acolhidos(): Acolhido[]
        }
        methods: {
            get count(): {
                autistas: number
                neurotipicos: number
                investigacao: number
            }
        }
    }

    export class Apoiador extends DatabaseDocument<BaseDataTypes.Apoiador> {}
    export class Voluntario extends DatabaseDocument<BaseDataTypes.Voluntario> {}

    export class Imagem extends DatabaseDocument<BaseDataTypes.Imagem> {}
    export class Documento extends DatabaseDocument<BaseDataTypes.Documento> {
        references: {
            get acolhido(): Acolhido
        }
    }
    export class Evento extends DatabaseDocument<BaseDataTypes.Evento> {
        references: {
            get imagem(): Imagem
        }
    }
    export class Produto extends DatabaseDocument<BaseDataTypes.Produto> {
        references: {
            get imagem(): Imagem
        }
    }

    export class SolicitacaoAcolhido extends DatabaseDocument<BaseDataTypes.SolicitacaoAcolhido> {}
    export class SolicitacaoVoluntario extends DatabaseDocument<BaseDataTypes.SolicitacaoVoluntario> {}
    
    export class Admin extends DatabaseDocument<BaseDataTypes.Admin> {
        references: {
            get alteracoes(): Alteracao<TipoAlteracao>[]
        }

        static privateFields: (keyof BaseDataTypes.Admin)[]
    }

    export class Alteracao extends DatabaseDocument<BaseDataTypes.Alteracao<TipoAlteracao>> {}
}

export = DataTypes