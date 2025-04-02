const success = (statusCode:number, result: object) => {
    return {
        statusCode,
        result
    }
}

const error = (statusCode: number, message: String) => {
    return {
        statusCode,
        message
    }
}

export {
    success,
    error
}