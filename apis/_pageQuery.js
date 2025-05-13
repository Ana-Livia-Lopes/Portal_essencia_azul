const { limit, startAfter } = require("firebase/firestore");

module.exports = function paging({ page = 1, pageSize = 100 } = {}) {
    return [ limit(pageSize), startAfter(page * pageSize) ];
}