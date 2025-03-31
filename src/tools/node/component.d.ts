type ComponentType = "hypertext" | "execute"

declare class Component {
    constructor(name: string, filelocation: string, type: ComponentType)

    name: string
    type: ComponentType
    filelocation: string

    open(parameters: object): Promise<string>
}

declare class ComponentCollection {
    private map: Map<string, Component>

    /**
     * Insere componentes na coleção.
     * @param components 
     */
    add(...components: Component[]): void

    /**
     * Remove componentes da coleção.
     * @param components 
     */
    remove(...components: Component[]): void

    /**
     * Carrega os componentes da coleção dentro do texto HTML.
     * 
     * Substitui o seguinte modelo de tag:
     * 
     * ```html
     * <component name="header" size=29 />
     * ```
     * @param html
     */
    load(html: string): Promise<string>

    keys(): Iterator<string>

    values(): Iterator<Component>

    entries(): Iterator<[string, Component]>

    get length(): number
}

declare namespace Component {
    export { ComponentCollection as Collection }
}

export = Component