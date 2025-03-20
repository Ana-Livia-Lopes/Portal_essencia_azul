import { TypedCollection, TypeList } from "./typed";

/**
 * Coleção Map com tipagem controlada.
 */
declare class TypedMap<K,V> extends Map<K,V> {
    /**
     * @param type Classe construtora que poderá ser armazenada no valor.
     * @param keytype Classe construtora que poderá ser armazenada na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V), keytype?: (new (...args: any[]) => K), includeAllInstances?: boolean)
    /**
     * @param type Classe construtora que poderá ser armazenada no valor.
     * @param keytype Lista de classes construtoras que poderão ser armazenadas na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V), keytype?: (new (...args: any[]) => K)[], includeAllInstances?: boolean)
    /**
     * @param type Classe construtora que poderá ser armazenada no valor.
     * @param keytype Instância de lista de tipos que poderão ser armazenados na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V), keytype?: TypeList, includeAllInstances?: boolean)
    /**
     * @param type Lista de classes construtoras que poderão ser armazenadas no valor.
     * @param keytype Classe construtora que poderá ser armazenada na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V)[], keytype?: (new (...args: any[]) => K), includeAllInstances?: boolean)
    /**
     * @param type Lista de classes construtoras que poderão ser armazenadas no valor.
     * @param keytype Lista de classes construtoras que poderão ser armazenadas na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V)[], keytype?: (new (...args: any[]) => K)[], includeAllInstances?: boolean)
    /**
     * @param type Lista de classes construtoras que poderão ser armazenadas no valor.
     * @param keytype Instância de lista de tipos que poderão ser armazenados na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V)[], keytype?: TypeList, includeAllInstances?: boolean)
    /**
     * @param type Instância de lista de tipos que poderão ser armazenados no valor.
     * @param keytype Classe construtora que poderá ser armazenada na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: TypeList, keytype?: (new (...args: any[]) => K), includeAllInstances?: boolean)
    /**
     * @param type Instância de lista de tipos que poderão ser armazenados no valor.
     * @param keytype Lista de classes construtoras que poderão ser armazenadas na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: TypeList, keytype?: (new (...args: any[]) => K)[], includeAllInstances?: boolean)
    /**
     * @param type Instância de lista de tipos que poderão ser armazenados no valor.
     * @param keytype Instância de lista de tipos que poderão ser armazenados na chave.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: TypeList, keytype?: TypeList, includeAllInstances?: boolean)

    readonly type: (new (...args: any[]) => V) | (new (...args: any[]) => V)[] | TypeList
    readonly keytype: (new (...args: any[]) => K) | (new (...args: any[]) => K)[] | TypeList
    readonly includeAllInstances: boolean

    /**
     * Verifica se um valor condiz com o tipo do Map.
     * @param value 
     * @param type 
     */
    checkType(value: any, type?: "key"|"value"): boolean

    set(key: K, value: V): this;
}

export = TypedMap;