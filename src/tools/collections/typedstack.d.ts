import Stack from "./stack";
import { TypedCollection, TypeList } from "./typed";

/**
 * Coleção Stack com tipagem controlada.
 */
declare class TypedStack<V> extends Stack<V> {
    /**
     * @param type Classe construtora que poderá ser armazenada.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V), includeAllInstances: boolean)
    /**
     * @param type Lista de classes construtoras que poderão ser armazenadas.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V)[], includeAllInstances: boolean)
    /**
     * @param type Instância de lista de tipos que poderão ser armazenados.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: TypeList, includeAllInstances: boolean)

    readonly type: new (...args: any[]) => V
    readonly includeAllInstances: boolean

    /**
     * Verifica se um valor condiz com o tipo do Stack.
     * @param value 
     */
    checkType(value: any): boolean
}

export = TypedStack