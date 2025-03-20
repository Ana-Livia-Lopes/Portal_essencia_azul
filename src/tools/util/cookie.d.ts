namespace Cookie {
    /**
     * Converte uma string de Cookie em um objeto.
     * @param cookieHeaderString 
     */
    function parse(cookieHeaderString: string): object

    /**
     * Converte um objeto em uma string Cookie.
     * @param cookieObject 
     */
    function stringify(cookieObject: object): string
}

export = Cookie