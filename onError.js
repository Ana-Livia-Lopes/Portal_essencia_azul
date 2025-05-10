module.exports = function({ error, content }) {
    content.clear();
    content.append(`${error?.name ?? "Error"} (${error?.code ?? 500}): ${error?.message}`);
    console.log(error);
}