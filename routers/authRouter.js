
const controller = require('../controllers').AuthController;
var router = require('express').Router();
const StatusCodes = require('http-status-codes').StatusCodes;

router.post('/register', (req, res, next) => {
    controller.register(req.body, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.BAD_REQUEST).json({ success: false});
    }).catch(err => {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) 
    });
});

router.post('/login', (req, res, next) => {
    controller.login(req.body, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false});
    }).catch(err => {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) 
    });
});

router.post('/facebook', (req, res, next) => {
    controller.facebook(req.body, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false});
    }).catch(err => {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) 
    });
});

router.post('/google', (req, res, next) => {
    controller.google(req.body, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false});
    }).catch(err => {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) 
    });
});

module.exports = router;