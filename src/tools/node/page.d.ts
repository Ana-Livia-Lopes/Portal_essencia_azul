import { ServerResponse, IncomingMessage, Server } from "http"
import ServerManager from "./server"
import Session from "./session"
import Component from "./component"

type ContentType = "text/html"|"text/plain"|"text/css"|"text/javascript"|"application/json"|"application/xml"|"application/octet-stream"|"image/png"|"image/jpeg"|"image/svg+xml"|"image/gif"|"image/webp"|"image/x-icon"|"image/vnd.microsoft.icon"|"image/vnd.wap.wbmp"|"image/bmp"|"image/tiff"|"image/x-xbitmap"|"image/vnd.djvu"|"image/x-portable-pixmap"|"image/x-portable-anymap"|"image/x-portable-bitmap"|"image/x-portable-graymap"
type PageType = "hypertext"|"execute"
type URLType = "simple"|"special"

interface PageLoadParameters {
    query?: object
    body?: object
    params?: object
    session?: Session
    server: ServerManager
    content: PageContent
    page: Page
    request: IncomingMessage
    response: ServerResponse
    components: Component.Collection
    localhooks: object
    apis?: ServerAPIObjects
}

interface PageEvents {
    before: ( ( parameters: PageLoadParameters, apis: ServerAPIObjects ) => void ) | ( ( parameters: PageLoadParameters, apis: ServerAPIObjects ) => void )[]
    after: ( ( parameters: PageLoadParameters, apis: ServerAPIObjects ) => void ) | ( ( parameters: PageLoadParameters, apis: ServerAPIObjects ) => void )[]
}

interface PageListObject {
    filelocation: string
    pagelocation: string|string[]
    pagetype?: PageType
    contenttype?: ContentType
    statuscode?: number,
    excludeExtFromName?: boolean
    flags?: string[]
    urltype: URLType,
    events?: PageEvents
}

interface ServerAPIObjects {}

interface PageBasicOptions {
    /**
     * Código de resposta HTTP padrão da página.
     */
    statuscode?: number
    /**
     * Lista de Flags da página.
     */
    flags?: symbol[]
    /**
     * Lista de eventos de execução da página.
     */
    events: PageEvents
}

declare type Flags = {
    /** Envia um objeto `QUERY` em um `<script>` para o documento HTML utilizá-lo. */
    HTMLClientQuery: symbol,
    /** Envia um objeto `PARAMS` em um `<script>` para o documento HTML utilizá-lo. Requer uma `SpecialPage`. */
    HTMLClientParams: symbol
}

/**
 * Informações para intermédio de página web por servidor.
 */
declare class Page {
    /**
     * @param filelocation Localização do arquivo. Precisa ser absoluta.
     * @param pagelocation Caminho determinado até a página.
     * @param pagetype Forma de carregamento da página.
     * @param contenttype Marcador de conteúdo enviado para o cliente.
     * @param options Opções adicionais.
     */
    constructor(filelocation: string, pagelocation: string, pagetype: PageType, contenttype: ContentType, options?: PageBasicOptions)
    
    readonly filename: string
    readonly filelocation: string
    readonly path: string
    readonly contentType: ContentType
    readonly statusCode: number
    readonly pageType: PageType
    readonly flags: symbol[]

    /**
     * Carrega o conteúdo da página de acordo com o que foi definido em `pagetype`.
     * @param parameters Parâmetros fornecidos para execução. Páginas de hipertexto necessitam de um `PageContent`.
     */
    load(parameters: PageLoadParameters, apis: ServerAPIObjects): Promise<any>

    /**
     * Testa se um caminho de URL bate com a localização da página.
     * @param url 
     */
    match(url: string): boolean | object

    static readonly Flags: Flags
}

declare class SpecialPage extends Page {
    /**
     * @param filelocation Localização do arquivo. Precisa ser absoluta.
     * @param pagelocation Caminho determinado até a página que pode ser personalizável.
     * 
     * `/[paramName]/[anotherParam]/fixurl`
     * @param pagetype Forma de carregamento da página.
     * @param contenttype Marcador de conteúdo enviado para o cliente.
     * @param options Opções adicionais. 
     */
    constructor(filelocation: string, pagelocation: string, pagetype: PageType, contenttype: ContentType, options?: PageBasicOptions)

    pathRegExp: RegExp
    paramNames: string[]

    /**
     * Testa se um caminho de URL bate com a localização da página.
     * @param url 
     * @param getParams Se verdadeiro, retornará um objeto com os parâmetros do URL obtidos.
     */
    match(url: string, getParams?: boolean): boolean | object
}

declare class PageContent {
    constructor()

    body: (string|Buffer)[] // mudar pra typedarray
    before: (string|Buffer)[]
    after: (string|Buffer)[]

    /**
     * Adiciona um novo fragmento de conteúdo ao conjunto.
     * @param chunk 
     * @param area Área onde será adicionado.
     */
    append(chunk: (string|Buffer), area: "body"|"before"|"after"): void
    /**
     * Escreve todo o conteúdo e o envia para o cliente.
     * @param response 
     */
    write(response: ServerResponse): void
    /**
     * Limpa todo o conteúdo presente.
     * @param areas Áreas que serão limpas. Vazio para limpar todas.
     */
    clear(...areas: ("body"|"before"|"after")[]): void
}

declare class PageCollection {
    constructor(...pages: Page[])

    private allPages: Map<string, Page> // Substituir para TypedMap e TypedSet
    private commomPages: Map<string, Page>
    private specialPages: Set<SpecialPage>

    /**
     * Insere novas páginas na coleção.
     * @param pages 
     */
    append(...pages: Page[]): void
    /**
     * Remove páginas da coleção.
     * @param pages 
     */
    remove(...pages: Page[]): void
    /**
     * Testa se alguma das páginas da coleção bate com o URL.
     * @param url 
     */
    match(url: string): [ Page|null, Object, typeof Page|typeof SpecialPage|null ]
    /**
     * Remove todas as páginas da coleção.
     */
    clear(): void

    get length(): number

    values(): MapIterator<Page>
    keys(): MapIterator<string>
    entries(): MapIterator<[string, Page]>
}

declare namespace Page {
    export { PageCollection as Collection }
    export { SpecialPage as Special }
    export { PageContent as Content }

    export { PageBasicOptions }
    export { PageLoadParameters }
    export { PageListObject }

    /**
     * Mapeia um diretório afim de instanciar todos os arquivos dele como recursos de página Web.
     * @param dirpath Localização do diretório.
     * @param pathbase Caminho base que será adicionado no início de todos os arquivos instanciados.
     * @param collection Coleção onde as instâncias serão salvas.
     * @param syncChanges Coloca o diretório em observação e manipula as páginas conforme o diretório é alterado.
     */
    export function MapDir(dirpath: string, pathbase: string, collection: PageCollection, syncChanges?: boolean): void
    /**
     * Mapeia um array com páginas para instanciar.
     * @param array Lista com objetos informando como as páginas serão instanciadas.
     * @param collection Coleção onde as instâncias serão salvas.
     * @param pathCorrectionBase Caminho base de localização dos arquivos da lista.
     */
    export function LoadList(array: PageListObject[], collection: PageCollection, pathCorrectionBase: string): void
}

export = Page