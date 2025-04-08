import { analytics, create, isLogged, login, logout, validateKey, read, remove, update } from "./operations";
import { DatabaseAnalytics, DatabaseTuple, PrivateHiddenData, BaseDataTypes } from "./types";

declare namespace EssenciaAzul {
    export { analytics, create, read, remove, update }
    export { login, logout, isLogged, validateKey }
    
    export { DatabaseTuple, DatabaseAnalytics, PrivateHiddenData }
    export { BaseDataTypes }
}

export = EssenciaAzul