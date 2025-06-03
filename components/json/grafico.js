const analytics = require("../../analytics.js");

module.exports = function() {
    return `<script>
        window.ANALYTICS = ${JSON.stringify(analytics)}
    </script>`
}