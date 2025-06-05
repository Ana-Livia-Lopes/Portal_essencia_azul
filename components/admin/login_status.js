module.exports = function(_, { session }) {
    return `<script>
        window.LOGIN_STATUS = ${JSON.stringify(session.get("login"))}
    </script>`
}