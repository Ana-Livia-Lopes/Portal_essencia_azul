import Cookie from "./@types/cookie"
import protect from "./@types/protect"
import timestamp from "./@types/timestamp"
import Property from "./@types/property"

declare namespace Util {
    export { Cookie }
    export { protect }
    export { timestamp }
    export { Property }
}

export = Util