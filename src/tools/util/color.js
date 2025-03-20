/**
 * @typedef {string[6]} HexColorString
 * @typedef {{
 *      red: number,
 *      green: number,
 *      blue: number
 * }} RGBColorObject
 * @typedef {{
 *      hue: number,
 *      lightness: number,
 *      saturation: number
 * }} HSLColorObject
 */

const validstr = require("../base/string_valid.js");
const Namespace = require("../namespace.js");

var Color = (function() {
    function hslToRGB(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    const validHexChars = "0123456789ABCDEFabcdef".split("");

    const Color = class Color {
        /**
         * @param {"rgb"|"hsl"|"hex"} format 
         * @param {RGBColorObject|HSLColorObject|HexColorString} values 
         * @param {number} alpha 
         */
        constructor(format, values, alpha = 1) {
            if (typeof alpha != "number" || !Number.isFinite(alpha)) throw new TypeError("Alpha de cor precisa ser um número");
            if (alpha > 1 || alpha < 0) throw new RangeError("Alpha precisa estar entre 0 e 1");
            this.alpha = alpha;

            values = Object.assign({}, values);

            let invalid = [];
            switch (format) {
                case "hex":
                    if (typeof values !== "string") throw new TypeError("Valores de cor HEX precisam ser uma string");
                    values.replace("#", "");
                    
                    for (const char of values) if (!validHexChars.includes(char)) throw new TypeError("Valores de cor HEX precisam ser alfanuméricos hexadecimais");

                    if (values.length != 6) throw new RangeError("Valores de cor HEX precisam ter 6 caracteres");

                    values = {
                        red: parseInt(values.substring(0, 2), 16),
                        green: parseInt(values.substring(2, 4), 16),
                        blue: parseInt(values.substring(4, 6), 16)
                    }
                case "rgb":
                    if (!values || typeof values != "object") throw new TypeError("Valores de cor RGB precisam ser um objeto");

                    if (typeof values.red == "undefined") values.red = 0;
                    if (typeof values.green == "undefined") values.green = 0;
                    if (typeof values.blue == "undefined") values.blue = 0;

                    if (typeof values.red !== "number") invalid.push("red");
                    if (typeof values.green !== "number") invalid.push("green");
                    if (typeof values.blue !== "number") invalid.push("blue");
                    if (invalid.length > 0) throw new TypeError(`Cores RGB precisam de [${invalid.join(", ")}] numéricos`);

                    if (values.red > 255 || values.red < 0) invalid.push("red");
                    if (values.green > 255 || values.green < 0) invalid.push("green");
                    if (values.blue > 255 || values.blue < 0) invalid.push("blue");
                    if (invalid.length > 0) throw new RangeError(`Cores RGB precisam de [${invalid.join(", ")}] entre 0 e 255`);

                    this.red = parseInt(values.red);
                    this.green = parseInt(values.green);
                    this.blue = parseInt(values.blue);

                    let red_rgb = this.red / 255;
                    let green_rgb = this.green / 255;
                    let blue_rgb = this.blue / 255;

                    let max = Math.max(red_rgb, green_rgb, blue_rgb);
                    let min = Math.min(red_rgb, green_rgb, blue_rgb);

                    let hue_rgb = 0;
                    let saturation_rgb = 0;
                    let lightness_rgb = (max + min) / 2;

                    if (max != min) {
                        let delta = max - min;
                        saturation_rgb = lightness_rgb > 0.5 ? delta / (2 - max - min) : delta / (max + min);

                        switch (max) {
                            case red_rgb:
                                hue_rgb = (green_rgb - blue_rgb) / delta + (green_rgb < blue_rgb ? 6 : 0);
                                break;
                            case green_rgb:
                                hue_rgb = (blue_rgb - red_rgb) / delta + 2;
                                break;
                            case blue_rgb:
                                hue_rgb = (red_rgb - green_rgb) / delta + 4;
                                break;
                        }

                        hue_rgb /= 6;
                    } else {
                        hue_rgb = saturation_rgb = 0;
                    }

                    this.hue = Math.round(hue_rgb * 360);
                    this.saturation = Math.round(saturation_rgb * 100);
                    this.lightness = Math.round(lightness_rgb * 100);
                    break;
            
                case "hsl":
                    if (!values || typeof values != "object") throw new TypeError("Valores de cor HSL precisam ser um objeto");

                    if (typeof values.hue == "undefined") values.hue = 0;
                    if (typeof values.saturation == "undefined") values.saturation = 100;
                    if (typeof values.lightness == "undefined") values.lightness = 50;

                    if (typeof values.hue !== "number") invalid.push("hue");
                    if (typeof values.saturation !== "number") invalid.push("saturation");
                    if (typeof values.lightness !== "number") invalid.push("lightness");
                    if (invalid.length > 0) throw new TypeError(`Cores HSL precisam de [${invalid.join(", ")}] numéricos`);

                    if (values.hue > 360 || values.hue < 0) throw new RangeError("Cores HSL precisam de [hue] entre 0 e 360");
                    if (values.saturation > 100 || values.saturation < 0) invalid.push("saturation");
                    if (values.lightness > 100 || values.lightness < 0) invalid.push("lightness");
                    if (invalid.length > 0) throw new RangeError(`Cores HSL precisam de [${invalid.join(", ")}] entre 0 e 100`);

                    this.hue = parseInt(values.hue);
                    this.saturation = parseInt(values.saturation);
                    this.lightness = parseInt(values.lightness);

                    let hue_hsl = values.hue / 360;
                    let saturation_hsl = values.saturation / 100;
                    let lightness_hsl = values.lightness / 100;

                    let r, g, b;

                    if (saturation_hsl === 0) {
                        r = g = b = lightness_hsl;
                    } else {
                        const q = lightness_hsl < 0.5 ? lightness_hsl * (1 + saturation_hsl) : lightness_hsl + saturation_hsl - lightness_hsl * saturation_hsl;
                        const p = 2 * lightness_hsl - q;

                        r = hslToRGB(p, q, hue_hsl + 1 / 3);
                        g = hslToRGB(p, q, hue_hsl);
                        b = hslToRGB(p, q, hue_hsl - 1 / 3);
                    }

                    this.red = Math.round(r * 255);
                    this.green = Math.round(g * 255);
                    this.blue = Math.round(b * 255);
                    break;

                default:
                    throw new TypeError("Formato de cor desconhecido");
            }

            Object.freeze(this);
        }

        get rgb() { return { red: this.red, green: this.green, blue: this.blue, alpha: this.alpha } }
        get hsl() { return { hue: this.hue, saturation: this.saturation, lightness: this.lightness, alpha: this.alpha } }
        get hex() { return `#${this.red.toString(16).padStart(2, "0")}${this.green.toString(16).padStart(2, "0")}${this.blue.toString(16).padStart(2, "0")}` }
        
        get css_rgb() { return `rgb(${this.red}, ${this.green}, ${this.blue});` }
        get css_hsl() { return `hsl(${this.hue}, ${this.saturation}, ${this.lightness});` }
        get css_rgba() { return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha});` }
        get css_hsla() { return `hsla(${this.hue}, ${this.saturation}, ${this.lightness}, ${this.alpha});` }

        red;
        green;
        blue;
        hue;
        saturation;
        lightness;

        alpha;

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {RGBColorObject} values 
         * @param {number} alpha 
         * @returns {Color}
         */
        static rgb(values, alpha = 1) {
            return new Color("rgb", values, alpha);
        }

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {HexColorString} string 
         * @param {number} alpha 
         * @returns {Color}
         */
        static hex(string, alpha = 1) {
            return new Color("hex", string, alpha);
        }

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {HSLColorObject} values 
         * @param {number} alpha 
         * @returns {Color}
         */
        static hsl(values, alpha = 1) {
            return new Color("hsl", values, alpha);
        }

        /**
         * Verifica se uma string é uma cor hexadecimal válida.
         * @param {string} colorStr 
         * @returns {boolean}
         */
        static validhex(colorStr = "") {
            if (!validstr(colorStr)) return false;
            colorStr = String(colorStr);
            if (colorStr[0] == "#") colorStr = colorStr.replace("#", "");
            for (const char of colorStr) if (!validHexChars.includes(char)) return false;
            if (colorStr.length !== 6 && colorStr.length !== 8) return false;

            return true;
        }
    }

    Namespace(Color, "Color");

    return Color;
})();

module.exports = Color;