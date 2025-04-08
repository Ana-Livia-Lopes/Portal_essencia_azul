import Session from "./tools/node/session"
import { DatabaseTuple, DatabaseAnalytics } from "./types"

declare type SearchRuleRelation =
    "equals" | "different" |
    "bigger" | "biggerequal" |
    "less" | "lessequal" |
    "startswith" | "endswith" |
    "includes" | "notincludes" |
    "like" | "between" | "in"

declare interface SearchRule<T extends DatabaseTuple<object>> {
    field: (keyof T["fields"] | "id")
    relation: SearchRuleRelation
    value: any
}

declare interface ReadOptions<T extends DatabaseTuple<object>> {
    fields?: (keyof T["fields"] | "id")[] | "*"
    conditions?: SearchRule<T>[] | SearchRule<T>
    distinct?: boolean,
    limit?: number
    limitOffset?: number
    orderBy?: (keyof T["fields"])
    orderDirection: "asc" | "desc"
}

declare interface ReadAnalyticsOptions<T extends DatabaseTuple<object>> extends ReadOptions<T> {
    aggregate: SearchAggregateFunction
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

    export function create<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        fields: InstanceType<C>["fields"]
    ): Promise<InstanceType<C>>

    export function read<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        search: ReadOptions<InstanceType<C>>,
    ): Promise<(InstanceType<C> | null) | InstanceType<C>[]> // só retorna único se limite for 1

    export function analytics<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        search: ReadAnalyticsOptions<InstanceType<C>>
    ): Promise<DatabaseAnalytics<InstanceType<C>>>

    export function update<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C> | boolean> // Leitura atualizada

    export function remove<T extends object, C extends typeof DatabaseTuple<T>>(
        key: string,
        type: C,
        id: number
    ): Promise<boolean>
}

declare class Login {
    nome: string
    email: string
    private key: string

    create<T extends object, C extends typeof DatabaseTuple<T>>(
        type: C,
        fields: InstanceType<C>["fields"]
    ): Promise<InstanceType<C>>

    read<T extends object, C extends typeof DatabaseTuple<T>>(
        type: C,
        search: ReadOptions<InstanceType<C>>
    ): Promise<(InstanceType<C> | null) | InstanceType<C>[]>

    analytics<T extends object, C extends typeof DatabaseTuple<T>>(
        type: C,
        search: ReadAnalyticsOptions<InstanceType<C>>
    ): Promise<DatabaseAnalytics<InstanceType<C>>>

    update<T extends object, C extends typeof DatabaseTuple<T>>(
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C> | boolean>

    remove<T extends object, C extends typeof DatabaseTuple<T>>(
        type: C,
        id: number
    ): Promise<boolean>
}

export = Operations;