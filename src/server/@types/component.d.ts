import Page, { ExecutablePageFunction, PageLoadParameters, ScreenBuildParts } from "./page"

declare abstract class Component {
    constructor(name: string, file: string)

    name: string
    file: string

    abstract content(): any
    abstract process(attributes: object, requestParameters: PageLoadParameters): any
    load(): Promise<any>
}

declare class ScreenComponent extends Component {
    content(ComponentCollection?: ComponentCollection): Promise<ScreenBuildParts>
    process(attributes: object, requestParameters: PageLoadParameters): Promise<string>
}

declare class ExecutableComponent extends Component {
    content(): ExecutablePageFunction
    process(attributes: object, requestParameters: PageLoadParameters): Promise<string | undefined>
}

declare class ComponentCollection extends Map<string, Component> {
    private set(): void

    add(component: Component): void
}

declare type ComponentBindedLoad = (parameters: Page.PageLoadParameters) => Promise<any>

declare namespace Component {
    export { ScreenComponent as Screen }
    export { ExecutableComponent as Executable }
    export { ComponentCollection as Collection }
    export { ComponentBindedLoad as BindedLoad }
}

export = Component