import { IncomingMessage, ServerResponse } from "http";

declare class Session extends Map<any, any> {
    constructor(request:IncomingMessage, response: ServerResponse, collection?: SessionCollection)

    readonly id: string
    lastUse: number

    /**
     * Renova o último uso da sessão para o momento atual.
     */
    renew(): void
}

declare class SessionCollection extends Map<string, Session> {
    constructor(name: string, { maxAge, cleaningInterval }: { maxAge: number, cleaningInterval: number })

    readonly id: string
    readonly name: string
    get cookieKeyName(): string

    get maxAge(): number
    get cleaningInterval(): number
    private intervalId: number

    /**
     * Limpa as sessões que forem mais velhas que a data passada.
     * 
     * Se nenhuma data for passada, será usada a padrão.
     * @param maxAge Contada em milissegundos.
     */
    clear(maxAge?: number): void

    /**
     * Inicia um novo intervalo de rotina de limpeza.
     * @param interval Em milissegundos.
     */
    setCleaningInterval(interval: number): void

    unsetCleaningInterval(): void
}

declare namespace Session {
    export { SessionCollection as Collection }
}

export = Session