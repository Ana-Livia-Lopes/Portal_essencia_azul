/**
 * Lista constituída por Nodes conectados entre si.
 * 
 * Sem suporte para elementos vazios.
 */
declare class LinkedList<T = any> {
    constructor(...values: T[])

    get first(): T
    get last(): T
    get length(): number

    /**
     * Retorna o elemento na posição passada. Se não encontrar, retorna `undefined`.
     * @param index 
     */
    at(index: number): T
    /**
     * Define um valor de um elemento da lista.
     * 
     * Não pode passar do tamanho padrão da lista.
     * @param index 
     * @param value 
     */
    set(index: number, value: T): void
    /**
     * Insere elementos a partir de uma posição na lista.
     * 
     * Se ultrapassar o tamanho da lista, preencherá em seu final.
     * @param index 
     * @param values 
     */
    insert(index: number, ...values: T[]): void
    /**
     * Remove um elemento em um índice selecionado e, se existir, o retorna.
     * 
     * Se o índice não existir, não remove nada.
     * @param index 
     */
    remove(index: number): T | undefined
    
    /**
     * Adiciona elementos no final da lista. Similar a:
     * 
     * ```js
     * LinkedList.insert(last_node_index, ...values);
     * ```
     * @param values 
     */
    append(...values: T[]): void
    /**
     * Adiciona elementos no começo da lista. Similar a:
     * 
     * ```js
     * LinkedList.insert(0, ...values);
     * ```
     * @param values 
     */
    unshift(...values: T[]): void
    /**
     * Remove o último elemento da lista. Similar a:
     * 
     * ```js
     * return LinkedList.remove(last_node_index);
     * ```
     */
    pop(): T | undefined
    /**
     * Remove o primeiro elemento da lista. Similar a:
     * 
     * ```js
     * return LinkedList.remove(0)
     * ```
     */
    shift(): T | undefined

    /**
     * Verifica se a lista tem um valor específico.
     * @param value 
     */
    has(value: T): boolean

    /**
     * Limpa todos os valores da lista.
     */
    clear(): void

    values(): LinkedListIterator<T>

    /**
     * Conjunto de operações de Proxy de uma LinkedList.
     * 
     * Inclui traps para as operações caso receba propriedades com valores inteiros e maiores ou iguais a zero:
     * 
     * * get:
     * 
     * ```js
     * return target.at(property);
     * ```
     * 
     * * set:
     * 
     * ```js
     * target.set(property, newValue);
     * ```
     * 
     * * deleteProperty:
     * 
     * ```js
     * target.remove(index);
     * ```
     */
    static proxyHandler: LinkedListProxyHandler
}

interface LinkedListProxyHandler extends ProxyHandler<LinkedList<any>> {
    get(target: any, property: string|symbol): any,
    set(target: any, property: string|symbol, newValue: any): boolean,
    deleteProperty(target: any, property: string|symbol): boolean
}

declare class LinkedListNode {
    constructor(value: any, { next, last }: { next?: LinkedListNode, last?: LinkedListNode })

    value: any;
    next: LinkedListNode | null
    last: LinkedListNode | null
}

interface LinkedListIterator<T> extends Iterator<T> {
    [Symbol.iterator](): LinkedListIterator<T>
}

export = LinkedList