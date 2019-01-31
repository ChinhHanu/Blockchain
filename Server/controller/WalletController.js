const uuidv1 = require("uuid");
const Cryptography = require('../../common/cryptography')

var WalletAccount = require("../models/WalletModel");

exports.create = function (req, res) {
  let walletAcc = new WalletAccount();

  walletAcc.walletId = uuidv1();
  walletAcc.keyPair = Cryptography.genKeyPair();
  walletAcc.publicKey = Cryptography.genKeyPair().getPublic().encode('hex');
  walletAcc.balance = 500;

  walletAcc.save(function (err) {
    if (err) {
      console.log(17, walletAcc);
      res.json("Failed to create");
    } else {
      res.json({
        message: "New wallet was created!",
        data: walletAcc
      });
    }
  });
};

exports.delete = function (req, res) {
  var myQuery = { walletId: req.params.id };
  WalletAccount.deleteOne(myQuery, function (err) {
    if (err) res.json(err);
    res.json('Deleted the wallet successfully');
  })
};
