import { analytics, create, isLogged, login, logout, validateKey, read, remove, update } from "./operations";
import { PrivateHiddenData, BaseDataTypes, Acolhido, Residente, Familia, Apoiador, Voluntario, Documento, Imagem, Evento, Produto, SolicitacaoAcolhido, SolicitacaoVoluntario, Admin } from "./types";

declare namespace EssenciaAzul {
    export { analytics, create, read, remove, update }
    export { login, logout, isLogged, validateKey }
    
    export { PrivateHiddenData, BaseDataTypes }
    export { Acolhido, Residente, Familia, Apoiador, Voluntario, Documento, Imagem, Evento, Produto, SolicitacaoAcolhido, SolicitacaoVoluntario, Admin }
}

export = EssenciaAzul