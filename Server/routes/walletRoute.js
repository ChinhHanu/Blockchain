let router = require("express").Router();

var walletAccountController = require("../controller/WalletController");

router.route('/')
    .get(walletAccountController.create)

router.route('/:id').delete(walletAccountController.delete)

module.exports = router;