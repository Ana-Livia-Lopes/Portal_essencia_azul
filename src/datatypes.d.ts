declare class AcolhidoBase {
    private id: number
    nome: string
    idade: number
    email: string
    telefone: string[]
    nome_responsaveis: string[]
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

declare class Acolhido extends AcolhidoBase {
    private id_familia: number
    
    familia: Familia

    private ids_documentos: number[]
    get documentos(): Documento[]
}

declare class Residente {
    private id: number
    private id_familia: number
    nome: string
    estado: "neurotipico" | "autista" | "investigacao"
}

declare class Familia {
    private id: number
    sobrenome: string
    endereco: string

    get acolhidos(): Acolhido[]
    get residentes(): Residente[]
    get moradores(): (Acolhido | Residente)[]

    get autistas(): number
    get em_investigacao(): number
    get neurotipicos(): number

    observacoes: string
}

declare class Documento {
    private id: number
    private id_acolhido: number
    get acolhido(): Acolhido

    arquivo: Blob
}

declare class Admin {
    private id: number
    readonly nivel: 2|1
    nome: string
    email: string
    senha: string
}

declare class Apoiador {
    private id: number
    nome: string
    logo: Blob
    link: string
}

declare class Imagem {
    private id: number
    titulo: string
    descricao: string
    grupos: string[]
    conteudo: Blob
}

declare class SolicitacaoAcolhido extends AcolhidoBase {}

declare class SolicitacaoVoluntario {
    private id: number
    nome: string
    cpf: string
    email: string
    telefone: string
    como_ajudar: string
    por_que_ser_voluntario: string
}

declare interface AlteracaoBase {
    tabela: string
    id: string
}

type TipoAlteracao = "adicionar" | "remover" | "editar"

declare type Alteracao<A extends TipoAlteracao> =
    A extends "adicionar" ? AlteracaoBase & { tupla: object } :
    A extends "remover" ? AlteracaoBase & { tupla: object } :
    A extends "editar" ? AlteracaoBase & { campo: string, valor_novo: any, valor_antigo: any } : null

declare class RegistroAlteracao<A extends TipoAlteracao> {
    constructor(tipo: A)

    private id: number
    private id_admin: number
    get admin(): Admin
    data: Date
    descricao: string
    acao: A
    alteracao: Alteracao<A>
}