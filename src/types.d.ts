declare namespace BaseDataTypes {
    class Acolhido {
        nome: string
        idade: number
        email: string
        telefone: string[]
        nome_responsaveis: string[]
        id_familia: number
        nivel_suporte: 1 | 2 | 3
        escola: {
            nome: string,
            tem_suporte: boolean
        } | false
        identificacao: {
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
        convenio: string | false
        terapias: string[]
        terapias_precisa: string[]

        observacoes: string
    }
    class Residente {}
    class Familia {}

    class Apoiador {}
    class Voluntario {}
    
    class Documento {}
    class Imagem {}

    type TipoContato = "email"|"telefone"

    class Contato {
        tipo: TipoContato
        valor: string
    }
    
    abstract class Solicitacao {
        remetente: {
            nome: string
            contato: Contato["valor"]
            tipo_contato: Contato["tipo"]
            outros_contatos: Contato[]
        }
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
}

declare namespace DataTypes {
    export { BaseDataTypes }

    /**
     * Valor filler para substituir valores que não devem ser obtidos do banco de dados.
     */
    export class PrivateHiddenData extends null {}

    abstract class DatabaseInfo<F extends object> {
        table: string
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
        static tableName: string
    }
    
    /**
     * Esta classe representa apenas uma leitura do banco, editar seus valores aqui não alterarão diretamente o banco de dados.
     * 
     * Ações CRUD estarão restritas atrás da classe Admin, que possui sua chave de alteração para validar os métodos de operação no banco.
     */
    export abstract class DatabaseTuple<F extends object> extends DatabaseInfo<F> {
        /**
         * @param creationKey Chave de autorização de uso de construtor.
         * @param fields 
         * @throws {TypeError} Construtor privado
         */
        constructor(creationKey: string, id: number, fields: F)
    
        id: number
        references: object
    }

    type AnalyticsAggregateFunction = "min" | "max" | "count" | "sum" | "avg"

    /**
     * Diferente de uma tupla, os valores serão definidos baseados em uma função agregadora.
     * 
     * Não possui ID.
     */
    export abstract class DatabaseAnalytics<F extends DatabaseTuple<object>> extends DatabaseInfo<F["fields"]> {
        aggregator: AnalyticsAggregateFunction
    }



    export class Acolhido extends DatabaseTuple<BaseDataTypes.Acolhido>  {
        references: {
            get familia(): Familia,
            get documentos(): Documento
        }
    }

    export class Admin extends DatabaseTuple<BaseDataTypes.Admin> {
        references: {
            get alteracoes(): Alteracao<TipoAlteracao>[]
        }

        static privateFields: (keyof BaseDataTypes.Admin)[]
    }


    interface AlteracaoBase {
        id: number
        tabela: string
    }
    
    type TipoAlteracao = "adicionar" | "remover" | "editar"
    
    interface AlteracaoAdicionar extends AlteracaoBase {
        tupla: object
    }
    
    interface AlteracaoRemover extends AlteracaoBase {
        tupla: object
    }
    
    interface AlteracaoEditar extends AlteracaoBase {
        campo: string
        valor_novo: any
        valor_antigo: any
    }

    export type Alteracao<A extends TipoAlteracao = TipoAlteracao> =
        A extends "adicionar" ? AlteracaoAdicionar :
        A extends "remover" ? AlteracaoRemover :
        A extends "editar" ? AlteracaoEditar : never
}

export = DataTypes