declare class CodedError extends Error {
    constructor(code: number, message: string)

    code: number
    classification: string

    static defaultMessages: Readonly<{
        [401]: string
        [403]: string
        [404]: string
        [500]: string
        [503]: string
        [504]: string
    }>
}

CodedError.prototype.name = "CodedError"

export = CodedError