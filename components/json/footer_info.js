module.exports = function() {
    delete require.cache[require.resolve("../../footer.json")];
    const footerInfo = require("../../footer.json");
    return `<script>
        window.FOOTER_INFO = ${JSON.stringify(footerInfo)};
    </script>`;
}