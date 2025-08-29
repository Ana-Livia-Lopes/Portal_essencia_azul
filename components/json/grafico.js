const analytics = require("../../analytics.js");
const escapeHtml = require("./_escapeHtml.js");

module.exports = function() {
    return `<script>
        window.ANALYTICS = ${escapeHtml(analytics)}
    </script>`
}