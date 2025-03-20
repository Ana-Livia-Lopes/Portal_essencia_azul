class ConsoleStyle {
    constructor() { throw new TypeError("Illegal constructor") }

    static #ProcessedMessage = class StyleProcessedMessage {
        constructor(message = "") {
            message = String(message);
            this.original = message;
            this.escapeReplaced = message;

            let styleIndex = 0;

            while (ConsoleStyle.#ProcessedMessage.#styleBlockRegExp.test(message)) {
                let match = message.match(ConsoleStyle.#ProcessedMessage.#styleBlockRegExp)[1];
                let matchBlock = `{${match}}`;

                try {
                    let styles = match.replaceAll(";", ",").replaceAll(", ", ",").split(",");
                    let styleEscape = "";

                    styles.forEach(style => {
                        let stylecode = ConsoleStyle.#consts[style];

                        if (!stylecode && stylecode != 0) throw new Error("Código de estilo desconhecido");

                        styleEscape += `\x1b[${stylecode}m`;
                    });
                    
                    this.escapeReplaced = this.escapeReplaced.replace(matchBlock, styleEscape);
                    message = message.replace(matchBlock, "");
                } catch(err) {
                    console.error(`Estilo ${styleIndex} inválido: ${err}`);
                    this.escapeReplaced = this.escapeReplaced.replace(matchBlock, "");
                    message = message.replace(matchBlock, "");
                }

                
                styleIndex++;
            }

            this.escapeReplaced += "\x1b[0m";
            this.text = message;

            Object.freeze(this);
        }

        original;
        text;
        escapeReplaced;

        log() { ConsoleStyle.log(this.escapeReplaced) }
        warn() { ConsoleStyle.warn(this.escapeReplaced) }
        error() { ConsoleStyle.error(this.escapeReplaced) }

        static #styleBlockRegExp = /\{([a-z0-9_\,\:]+)\}/;
    }

    static #process(message) { return new ConsoleStyle.#ProcessedMessage(message) }

    static log(message) {
        const processed = ConsoleStyle.#process(message);
        console.log(processed.escapeReplaced);
        return processed;
    }

    static warn(message) {
        const processed = ConsoleStyle.#process(message);
        console.warn(processed.escapeReplaced);
        return processed;
    }

    static error(message) {
        const processed = ConsoleStyle.#process(message);
        console.error(processed.escapeReplaced);
        return processed;
    }

    static #consts = {
        reset: 0,
        bold: 1,
        italic: 3,
        underline: 4,
        default_color_codes: {
            black: [30, 40],
            red: [31, 41],
            green: [32, 42],
            yellow: [33, 43],
            blue: [34, 44],
            magenta: [35, 45],
            cyan: [36, 46],
            white: [37, 47],
            bright_black: [90, 100],
            bright_red: [91, 101],
            bright_green: [92, 102],
            bright_yellow: [93, 103],
            bright_blue: [94, 104],
            bright_magenta: [95, 105],
            bright_cyan: [96, 106],
            bright_white: [97, 107]
        },
        setup_colors: {
            aqua: "0;255;255",
            aliceblue: "240;248;255",
            antiquewhite: "250;235;215",
            aquamarine: "127;255;212",
            azure: "240;255;255",
            beige: "245;245;220",
            bisque: "255;228;196",
            blanchedalmond: "255;235;205",
            blueviolet: "138;43;226",
            brown: "165;42;42",
            burlywood: "222;184;135",
            cadetblue: "95;158;160",
            chartreuse: "127;255;0",
            chocolate: "210;105;30",
            coral: "255;127;80",
            cornflowerblue: "100;149;237",
            cornsilk: "255;248;220",
            crimson: "220;20;60",
            darkblue: "0;0;139",
            darkcyan: "0;139;139",
            darkgoldenrod: "184;134;11",
            darkgray: "169;169;169",
            darkgreen: "0;100;0",
            darkkhaki: "189;183;107",
            darkmagenta: "139;0;139",
            darkolivegreen: "85;107;47",
            darkorange: "255;140;0",
            darkorchid: "153;50;204",
            darkred: "139;0;0",
            darksalmon: "233;150;122",
            darkseagreen: "143;188;143",
            darkslateblue: "72;61;139",
            darkslategrey: "47;79;79",
            darkturquoise: "0;206;209",
            darkviolet: "148;0;211",
            deeppink: "255;20;147",
            deepskyblue: "0;191;255",
            dimgray: "105;105;105",
            dodgerblue: "30;144;255",
            firebrick: "178;34;34",
            floralwhite: "255;250;240",
            forestgreen: "34;139;34",
            fuchsia: "255;0;255",
            gainsboro: "220;220;220",
            ghostwhite: "248;248;255",
            gold: "255;215;0",
            goldenrod: "218;165;32",
            gray: "128;128;128",
            green: "0;128;0",
            greenyellow: "173;255;47",
            honeydew: "240;255;240",
            hotpink: "255;105;180",
            indianred: "205;92;92",
            indigo: "75;0;130",
            ivory: "255;255;240",
            khaki: "240;230;140",
            lavender: "230;230;250",
            lavenderblush: "255;240;245",
            lawngreen: "124;252;0",
            lemonchiffon: "255;250;205",
            lightblue: "173;216;230",
            lightcoral: "240;128;128",
            lightcyan: "224;255;255",
            lightgoldenrodyellow: "250;250;210",
            lightgray: "211;211;211",
            lightgreen: "144;238;144",
            lightpink: "255;182;193",
            lightsalmon: "255;160;122",
            lightseagreen: "32;178;170",
            lightskyblue: "135;206;250",
            lightslategrey: "119;136;153",
            lightsteelblue: "176;196;222",
            lightyellow: "255;255;224",
            lime: "0;255;0",
            limegreen: "50;205;50",
            linen: "250;240;230",
            magenta: "255;0;255",
            maroon: "128;0;0",
            mediumaquamarine: "102;205;170",
            mediumblue: "0;0;205",
            mediumorchid: "186;85;211",
            mediumpurple: "147;112;219",
            mediumseagreen: "60;179;113",
            mediumslateblue: "123;104;238",
            mediumspringgreen: "0;250;154",
            mediumturquoise: "72;209;204",
            mediumvioletred: "199;21;133",
            midnightblue: "25;25;112",
            mintcream: "245;255;250",
            mistyrose: "255;228;225",
            moccasin: "255;228;181",
            navajowhite: "255;222;173",
            navy: "0;0;128",
            oldlace: "253;245;230",
            olive: "128;128;0",
            olivedrab: "107;142;35",
            orange: "255;165;0",
            orangered: "255;69;0",
            orchid: "218;112;214",
            palegoldenrod: "238;232;170",
            palegreen: "152;251;152",
            paleturquoise: "175;238;238",
            palevioletred: "219;112;147",
            papayawhip: "255;239;213",
            peachpuff: "255;218;185",
            peru: "205;133;63",
            pink: "255;192;203",
            plum: "221;160;221",
            powderblue: "176;224;230",
            purple: "128;0;128",
            rebeccapurple: "102;51;153",
            rosybrown: "188;143;143",
            royalblue: "65;105;225",
            saddlebrown: "139;69;19",
            salmon: "250;128;114",
            sandybrown: "244;164;96",
            seagreen: "46;139;87",
            seashell: "255;245;238",
            sienna: "160;82;45",
            silver: "192;192;192",
            skyblue: "135;206;235",
            slateblue: "106;90;205",
            slategray: "112;128;144",
            snow: "255;250;250",
            springgreen: "0;255;127",
            steelblue: "70;130;180",
            tan: "210;180;140",
            teal: "0;128;128",
            thistle: "216;191;216",
            tomato: "255;99;71",
            turquoise: "64;224;208",
            violet: "238;130;238",
            wheat: "245;222;179",
            whitesmoke: "245;245;245",
            yellowgreen: "154;205;50"
        }
    }

    static #colorNames = [];

    static {
        const default_color_codes = ConsoleStyle.#consts.default_color_codes;
        delete ConsoleStyle.#consts.default_color_codes;

        for (const [ color, [ text, background ] ] of Object.entries(default_color_codes)) {
            ConsoleStyle.#consts[`${color}`] = text;
            ConsoleStyle.#consts[`color:${color}`] = text;
            ConsoleStyle.#consts[`background:${color}`] = background;

            ConsoleStyle.#colorNames.push(color);
        }

        const setup_colors = ConsoleStyle.#consts.setup_colors;
        delete ConsoleStyle.#consts.setup_colors;

        for (const [ color, code ] of Object.entries(setup_colors)) {
            ConsoleStyle.#consts[`${color}`] = `38;2;${code}`;
            ConsoleStyle.#consts[`color:${color}`] = `38;2;${code}`;
            ConsoleStyle.#consts[`background:${color}`] = `48;2;${code}`;

            ConsoleStyle.#colorNames.push(color);
        }
    }

    static colorshow() {
        for (const color of ConsoleStyle.#colorNames) {
            ConsoleStyle.log(`{${color}}${color}`)
        }
    }
}

module.exports = ConsoleStyle;