import { analytics, create, isLogged, login, logout, validateKey, read, remove, update, register, getPublics, PublicDocs } from "./operations";
import { PrivateHiddenData, BaseDataTypes, Acolhido, Residente, Familia, Apoiador, Voluntario, Documento, Imagem, Evento, Produto, SolicitacaoAcolhido, SolicitacaoVoluntario, Admin, Alteracao, Comentario } from "./types";

declare namespace EssenciaAzul {
    export { analytics, create, read, remove, update, getPublics, PublicDocs }
    export { login, logout, isLogged, validateKey, register }
    
    export { PrivateHiddenData, BaseDataTypes }
    export { Acolhido, Residente, Familia, Apoiador, Voluntario, Documento, Imagem, Evento, Produto, SolicitacaoAcolhido, SolicitacaoVoluntario, Admin, Alteracao, Comentario }
}

export = EssenciaAzul