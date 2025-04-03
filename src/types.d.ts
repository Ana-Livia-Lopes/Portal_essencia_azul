declare namespace BaseDataTypes {
    
    interface Acolhido {
        a: string
        b: any
        c: []
    }
    interface Residente {}
    interface Familia {}
    
    interface Apoiador {}
    interface Voluntario {}
    
    interface Documento {}
    interface Imagem {}

    type TipoContato = "email"|"telefone"

    interface Contato {
        tipo: TipoContato
        valor: string
    }
    
    interface Solicitacao {
        remetente: {
            nome: string
            contato: Contato["valor"]
            tipo_contato: Contato["tipo"]
            outros_contatos: Contato[]
        }
    }
    interface SolicitacaoAcolhido extends Solicitacao, Acolhido {}
    interface SolicitacaoVoluntario extends Solicitacao, Voluntario {}

    type NivelAdmin = 1 | 2 | 3
    // São cumulativos (ex: 2 tem acesso a tudo de 1 e 3 tem acesso a tudo de 1 e 2)
    // 1 tem acesso ao gerenciamento (não pode manter administradores além dele próprio)
    // 2 tem acesso a páginas de desenvolvimento, pode manter administadores de nivel 1
    // 3 não pode ser removido, pode manter administradores de nivel 1 e 2

    interface Admin {
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
     * Esta classe representa apenas uma leitura do banco, editar seus valores aqui não alterarão diretamente o banco de dados.
     * 
     * Ações CRUD estarão restritas atrás da classe Admin, que possui sua chave de alteração para validar os métodos de operação no banco.
     */
    export class DatabaseTuple<F extends object> {
        /**
         * @param creationKey Chave de autorização de uso de construtor.
         * @param fields 
         * @throws {TypeError} Construtor privado
         */
        constructor(creationKey: string, fields: F)
    
        id: number
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
    }



    export class Acolhido extends DatabaseTuple<BaseDataTypes.Acolhido>  {
        test: string
    }

    export class Admin extends DatabaseTuple<BaseDataTypes.Admin> {
        get alteracoes(): Alteracao<TipoAlteracao>[]

        static privateFields: (keyof BaseDataTypes.Admin)[] = [ "senha", "chave" ]
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

        
    type SearchRuleRelation = "equals" | "bigger"

    interface SearchRule<T extends DatabaseTuple<object>> {
        field: (keyof T["fields"])
        relation: SearchRuleRelation
        value: any
    }

    interface ReadOptions<T extends DatabaseTuple<object>> {
        fields?: (keyof T["fields"])[] | "*"
        conditions?: SearchRule<T>[] | SearchRule<T>
    }


    interface UpdateOptions {
        readAfter: boolean
    }

    export function create<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        fields: InstanceType<C>["fields"]
    ): Promise<InstanceType<C>>

    export function read<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        search: ReadOptions<InstanceType<C>>,
    ): Promise<InstanceType<C> | null>
    
    export function update<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C>> // Leitura atualizada
    
    export function remove<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        id: number
    ): Promise<boolean>

    function a() {

        new Admin().read(Acolhido, { fields: [ "a" ], conditions: [
            { field: "a", relation: "bigger", value },
            { field: "b" }
        ] },)
    }
}

export = DataTypes