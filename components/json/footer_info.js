const escapeHtml = require("./_escapeHtml.js");

module.exports = function() {
    delete require.cache[require.resolve("../../footer.json")];
    const original = require('../../footer.json');
    const footerInfo = escapeHtml(require("../../footer.json"), false);
    footerInfo.endereco.link = original.endereco.link;
    return `<script>
        window.FOOTER_INFO = ${footerInfo};
    </script>`;
}