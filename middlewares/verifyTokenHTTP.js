
const StatusCodes = require('http-status-codes').StatusCodes;
const jwt = require('jsonwebtoken');

module.exports = () => {
    return (req, res, next) => {
        if( req.method == 'OPTIONS')
            next();
        else{
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                jwt.verify(token, process.env.SERVER_SCRET, (err, user) => {
                    if (err) {
                        return res.sendStatus(StatusCodes.FORBIDDEN);
                    }
                    next();
                });
            } else {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
            }
        } 
    }
}