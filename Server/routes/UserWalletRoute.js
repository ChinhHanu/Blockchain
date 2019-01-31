let router = require('express').Router();
var walletController = require('../controller/UserWalletController');

router.route('/home').get(walletController.home);

router.route('/buy').post(walletController.buy);

router.route('/charge').post(walletController.charge);

router.route('/getTransaction').get(walletController.getTransaction);

router.route('/getBalance').get(walletController.getChain);

router.route('/validTransaction').get(walletController.validTransaction);

// test Pool
router.route('/testPool').get(walletController.testPool);
router.route("/deleteTrans").get(walletController.DeleteTransaction);
module.exports = router;