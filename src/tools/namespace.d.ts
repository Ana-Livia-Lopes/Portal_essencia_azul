/**
 * Define um objeto como uma área de trabalho.
 * @param object 
 * @param name 
 */
declare function Namespace<OBJ>(object: OBJ, name: string): OBJ

declare namespace Namespace {
    /**
     * Verifica se um objeto é uma área de trabalho.
     * @param object 
     */
    function isNamespace(object: any): boolean

    /**
     * Lista de áreas de trabalho disponíveis.
     * 
     * @protected
     */
    const availableNamespaces: object
}

export = Namespace