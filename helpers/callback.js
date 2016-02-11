/**
 * Utility function that returns an object with the following properties.
 * {success: true, message: message}
 */
module.exports.success = function(message) {
    return {success: true, message: message};
}

/**
 * Utility function that returns an object with the following properties.
 * {success: false, message: message}
 */
module.exports.failed = function(message) {
    return {success: false, message: message};
}
