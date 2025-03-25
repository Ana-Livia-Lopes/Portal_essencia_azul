declare class Acolhido {
    private id: number
    nome: string
    idade: number
    email: string
    telefone: string[]
    nome_responsaveis: string[]
    private id_familia: number
    familia: Familia
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

    // get total_residentes(): (Acolhido | Residente)[] // Todos os residentes, incluindo acolhidos
    
    // get acolhidos(): Acolhido[] // Somente acolhidos
    // get outros_residentes(): Residente[] // Outros residentes não acolhidos
    // get outros_residentes_autistas(): Residente[] // Somente residentes não acolhidos autistas
    // get outros_residentes_investigacao(): Residente[] // Somente residentes não acolhidos em investigação

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

declare class SolicitacaoAcolhido {}

declare class SolicitacaoVoluntario {
    private id: number
    nome: string
    cpf: string
    email: string
    telefone: string
    como_ajudar: string
    por_que_ser_voluntario: string
}

declare class RegistroAlteracao {
    private id: number
    private id_admin: number
    get admin(): Admin
    data: Date
    description: string
    alteracao: {
        tabela: string
        campo: string
        id: number
        valor_novo: any
        valor_antigo: any
    }
}