interface TimestampConfig {
    mainjoin: string = "-"
    subjoin: string = "."
    datejoin?: string
    hourjoin?: string
    fixedDateLength: boolean
}

function timestamp(date?: Date, options?: TimestampConfig): string

function template(date?: Date, template: string, fixedDateLength: boolean): string

timestamp.template = template

export = timestamp