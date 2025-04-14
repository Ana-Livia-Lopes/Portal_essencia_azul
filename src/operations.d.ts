import Session from "./tools/node/session"
import { DatabaseDocument, DatabaseAnalytics } from "./types"

declare type SearchRuleRelation =
    "=" | "!=" |
    ">" | ">=" |
    "<" | "<=" |
    "in" | "not in"

declare interface SearchRule<T extends DatabaseDocument<object>> {
    field: (keyof T["fields"] | "id")
    relation: SearchRuleRelation
    value: any
}

declare interface ReadOptions<T extends DatabaseDocument<object>> {
    conditions?: SearchRule<T>[]
    limit?: number
    limitOffset?: number
    orderBy?: (keyof T["fields"])
    orderDirection: "asc" | "desc"
}

declare type AnalyticsAggregateFunction = "min" | "max" | "count" | "sum" | "avg"


declare interface ReadAnalyticsOptions<T extends DatabaseDocument<object>> extends ReadOptions<T> {
    aggregate: AnalyticsAggregateFunction
    groupBy?: (keyof T["fields"])
    selectGroupBy?: boolean // inclui o campo de groupBy na busca, padrão deverá ser true
}


declare interface UpdateOptions {
    readAfter: boolean
}

declare namespace Operations {
    export function login(session: Session, email: string, password: string): Promise<Login>
    export function isLogged(session: Session): boolean
    export function logout(session: Session): boolean
    export function validateKey(key: string): Promise<string>

    export function create<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        fields: InstanceType<C>["fields"]
    ): Promise<InstanceType<C>>

    export function read<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        search: ReadOptions<InstanceType<C>>,
    ): Promise<(InstanceType<C> | null) | InstanceType<C>[]> // só retorna único se limite for 1

    export function analytics<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        search: ReadAnalyticsOptions<InstanceType<C>>
    ): Promise<DatabaseAnalytics<InstanceType<C>>>

    export function update<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C> | boolean> // Leitura atualizada

    export function remove<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        id: number
    ): Promise<boolean>
}

declare class Login {
    nome: string
    email: string
    private key: string

    create<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        fields: InstanceType<C>["fields"]
    ): Promise<InstanceType<C>>

    read<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        search: ReadOptions<InstanceType<C>>
    ): Promise<(InstanceType<C> | null) | InstanceType<C>[]>

    analytics<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        search: ReadAnalyticsOptions<InstanceType<C>>
    ): Promise<DatabaseAnalytics<InstanceType<C>>>

    update<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C> | boolean>

    remove<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        id: number
    ): Promise<boolean>
}

export = Operations;