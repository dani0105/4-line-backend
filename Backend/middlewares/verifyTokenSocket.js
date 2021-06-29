
const StatusCodes = require('http-status-codes').StatusCodes;
const jwt = require('jsonwebtoken');

module.exports = () => {
    return (socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, process.env.SERVER_SCRET, function (err, decoded) {
                if (err) 
                    return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        }
        else {
            next(new Error('Authentication error'));
        }
    }
}