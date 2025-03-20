const Namespace = require("../namespace.js");

var Cookie = ( function() {
    const Cookie = {};
    Namespace(Cookie, "Cookie");
    
    Cookie.parse = function parseCookie(cookieHeaderString) {
        cookieHeaderString = String(cookieHeaderString);
    
        const cookies = {};
    
        if (cookieHeaderString) {
            cookieHeaderString.split(";").forEach(cookieString => {
                const [ cookieName, cookieValue ] = cookieString.split('=');
                if (cookieName && cookieValue !== undefined) {
                    cookies[cookieName.trim()] = decodeURIComponent(cookieValue.trim());
                }
            });
        }
    
        return cookies;
    }
    
    Cookie.stringify = function stringifyCookie(cookieObject) {
        if (!(cookieObject instanceof Object) || typeof cookieObject !== "object") throw new TypeError("Não é possível compilar não-objetos");
    
        let cookie = [];
    
        for (const [key, value] of Object.entries(cookieObject)) {
            cookie.push(`${encodeURIComponent(key.trim())}=${encodeURIComponent(String(value).trim())}`);
        }
    
        return cookie.join(";");
    }

    return Cookie;
} )();

module.exports = Cookie;