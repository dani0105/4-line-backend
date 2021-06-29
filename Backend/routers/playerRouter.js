
const controller = require('../controllers').PlayerController;
var router = require('express').Router();
const StatusCodes = require('http-status-codes').StatusCodes;

router.post('/game', (req, res, next) => {
    controller.addGame(req.body, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.BAD_REQUEST).json({ success: false});
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

router.get('/game', (req, res, next) => {
    controller.getGames(req.query, res, next).then(result => {
        if(result.success)
            res.status(StatusCodes.OK).json(result);
        else
            res.status(StatusCodes.BAD_REQUEST).json({ success: false});
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

module.exports = router;