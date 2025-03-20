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

    get total_residentes(): (Acolhido | Residente)[] // Todos os residentes, incluindo acolhidos
    
    get acolhidos(): Acolhido[] // Somente acolhidos
    get outros_residentes(): Residente[] // Outros residentes não acolhidos
    get outros_residentes_autistas(): Residente[] // Somente residentes não acolhidos autistas
    get outros_residentes_investigacao(): Residente[] // Somente residentes não acolhidos em investigação

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
    nome: string
    email: string
    senha: string
}

declare class Apoiador {
    private id: number
    nome: string
    logo: Blob
}

declare class SolicitacaoAcolhido {
    private id: number
    formulario_json: string
}

declare class SolicitacaoVoluntario {
    private id: number
    nome: string
    cpf: string
    email: string
    telefone: string
    como_ajudar: string
    outras_ajudas: string
    por_que_ser_voluntario: string
}

declare class RegistroAlteracao {
    private id: number
    private id_admin: number
    time: Date
    description: string
    
}