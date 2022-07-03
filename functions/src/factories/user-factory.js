const _ = require("lodash");

function createUser(data) {
    let isEAD = data["unidade"] === null || data["unidade"] === undefined; 
    return {
        "isEAD":    isEAD,
        "id":       isEAD ? data["matricula"] : data["identificacao"],
        "userName": isEAD ? data["nomeAluno"] : data["nomeUsuario"], 
        "status":   isEAD ? data["situacaoAluno"] : data["situacao"],
        "gender":   data["sexo"],
        "campus":   isEAD ? "EAD" : data["unidade"],
        "course":   isEAD ? data["nomeCurso"] : data["curso"],
        "personId": isEAD ? data["id"] : null
    };
}

module.exports = { createUser }