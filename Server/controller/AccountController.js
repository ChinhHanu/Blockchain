const uuidv1 = require("uuid");
const Cryptography = require('../../common/cryptography')

var Account = require("../models/UserModel");
var WalletAccount = require("../models/WalletModel");

exports.index = function (req, res) {
  Account.get(function (err, user_accounts) {
    if (err) {
      res.json("Error");
    } else {
      res.json({
        message: "Accounts retrieved successfully",
        data: user_accounts
      });
    }
  });
};

exports.new = function (req, res) {
  let walletAcc = new WalletAccount();
  walletAcc.walletId = uuidv1();
  const keyPairEC = Cryptography.genKeyPair();
  walletAcc.publicKey = keyPairEC.getPublic().encode('hex');
  walletAcc.privateKey = keyPairEC.getPrivate();
  walletAcc.balance = 0;

  walletAcc.save(function (err) {
    if (err) {
      return res.json("Fail to create the account because of the error wallet");
    } else {
      var account = new Account();
      account.username = req.body.username
        ? req.body.username
        : account.username;
      account.password = req.body.password;
      account.walletId = walletAcc.walletId;

      Account.findOne({ username: account.username }).exec(function (err, existedAccount) {
        if (err) {
          return res.json(err);
        } else if (existedAccount) {
          let myQuery = { walletId: account.walletId };
          WalletAccount.deleteOne(myQuery, function (err) {
            if (err) return false;
            return true;
          });
          return res.json("This username is existed!!");
        } else {
          account.save(function (err) {
            if (err) {
              let myQuery = { walletId: account.walletId };
              WalletAccount.deleteOne(myQuery, function (err) {
                if (err) return false;
                return true;
              });
              return res.json(
                "Fail to create the account because of the error user"
              );
            }
          });
          return res.json({
            message: "Create User account successfully",
            data: account
          });
        }
      });
    }
  });
};

exports.login = function (req, res) {
  let acc_username = req.body.username;
  let acc_password = req.body.password;

  Account.findOne({ username: acc_username }).exec(function (err, account) {
    if (err) {
      return res.json("error");
    } else if (!account) {
      return res.render("login_popup", {
        msg: "username or password is incorrect"
      });
    }
    if (acc_password === account.password) {
      req.session.userId = account._id;
      return res.redirect('/user_wallet/home');
    } else {
      return res.render("login_popup", {
        msg: "username or password is incorrect"
      });
    }
  });
};

exports.delete = function (req, res) {
  Account.remove(
    {
      _id: req.params.account_id
    },
    function (err) {
      if (err) {
        res.json({
          status: "error",
          message: "The id is not existed"
        });
      }
      res.json({
        status: "success",
        message: "Account deleted"
      });
    }
  );
};

exports.logout = function (req, res) {
  if (req.session) {
    //delete session object
    req.session.destroy(function (err) {
      if (err) {
        return res.json(err);
      } else {
        return res.redirect('/');
      };
    });
  }
}

exports.testlogin = function (req, res) {
  res.render('testlogin')
}

//WALLET ACCOUNT
exports.walletDelete = function (id) {
  var myQuery = { walletId: id };
  WalletAccount.deleteOne(myQuery, function (err) {
    if (err) return false;
    return true;
  });
};
