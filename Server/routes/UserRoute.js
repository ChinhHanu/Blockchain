let router = require("express").Router();

var accountController = require("../controller/AccountController");

router.route('/')
    .get(accountController.index)
    .post(accountController.new)

router.route('/:id')
    .delete(accountController.delete)

router.route('/login').post(accountController.login);
router.route('/logout').get(accountController.logout);
router.route('/testlogin').get(accountController.testlogin)
module.exports = router;
