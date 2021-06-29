
const controller = require('../controllers').RoomController;
var router = require('express').Router();
const StatusCodes = require('http-status-codes').StatusCodes;


router.post('/room', (req, res, next) => {
    controller.addRoom(req.body, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

router.put('/room', (req, res, next) => {
    controller.updateRoom(req.body, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

router.get('/room', (req, res, next) => {
    controller.getRoom(req.query, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});



router.post('/joinRoom', (req, res, next) => {
    controller.joinRoom(req.body, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

router.put('/roomUserAccount', (req, res, next) => {
    controller.updateRoomUserAccount(req.body, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});

router.get('/roomUserAccount', (req, res, next) => {
    controller.getRoomUserAccount(req.query, res, next).then(result => {
        res.status(StatusCodes.OK).json(result);
    }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false }) )
});


module.exports = router;