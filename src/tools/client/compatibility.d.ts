declare namespace Compatibility {
    /**
     * Testa se é compatível com campos privados de classe.
     * ```js
     * class {
     *     #privateField;
     * }
     * ```
     */
    function privateFields(): boolean
}

export = Compatibility