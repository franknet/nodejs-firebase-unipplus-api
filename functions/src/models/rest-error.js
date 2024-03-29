
class RestError extends Error {

    constructor({ error, statusCode, message }) {
        super();
        if (error !== undefined) {
            this.message = error["message"];
            if (error["statusCode"] === undefined) {
                this.statusCode = 404;
            } else {
                this.statusCode = error["statusCode"];
            } 

            console.error(error["stack"]);
        } else {
            this.statusCode = statusCode;
            this.message = message;
        } 
        this.headers = { "Content-Type": "application/json" };
        this.data = { "message": this.message };
    } 
}

module.exports = RestError;