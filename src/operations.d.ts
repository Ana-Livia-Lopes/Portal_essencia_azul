import { Session } from "./server/"
import { DatabaseDocument } from "./types"

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
    id?: string | number
    conditions?: SearchRule<T>[]
    limit?: number
    limitOffset?: number
    orderBy?: (keyof T["fields"])
    orderDirection: "asc" | "desc"
}


declare interface UpdateOptions {
    // Para MySQL, sempre update
    editType: "set" | "update"
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
    ): Promise<InstanceType<C>[]> // só retorna único se limite for 1

    export function update<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C>>

    export function remove<T extends object, C extends typeof DatabaseDocument<T>>(
        key: string,
        type: C,
        id: number
    ): Promise<InstanceType<C>>
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
    ): Promise<InstanceType<C>[]>

    update<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        id: number,
        fields: InstanceType<C>["fields"],
        options: UpdateOptions
    ): Promise<InstanceType<C>>

    remove<T extends object, C extends typeof DatabaseDocument<T>>(
        type: C,
        id: number
    ): Promise<InstanceType<C>>
}

export = Operations;