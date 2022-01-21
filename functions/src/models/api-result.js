
module.exports = class ApiResult {
    constructor({ statusCode, data, headers, message }) {
        this.statusCode = statusCode != null ? statusCode : 400;
        this.headers = headers != null ? headers : { "Content-Type": "application/json; charset=utf-8" };
        this.data = data != null ? data : { "message": message }; 
    } 
}