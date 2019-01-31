const axios = require("axios");

const Wallet = require("../models/UserWalletModel");
const User = require("../models/UserModel");
const WalletAcc = require("../models/WalletModel");
const TransactionPool = require("../models/TransactionPoolModel");
var transactionPool = new TransactionPool();
var successfullList = [];


exports.home = function (req, res) {
   User.findById(req.session.userId).exec(function (err, user) {
      if (err) return res.json(err);
      else {
         if (user === null) {
            return res.render("login_popup", {
               msg: "Not authorized"
            });
         } else {
            let walletId = user.walletId;
            let username = user.username;
            WalletAcc.findOne({ walletId: walletId }).exec(function (
               err,
               walletAcc
            ) {
               if (err) return res.json(err);
               else {
                  res.render("wallet", {
                     username: username,
                     balance: walletAcc.balance,
                     real_balance: walletAcc.balance,
                     pk: walletAcc.publicKey,
                     list: [],
                     sucList: []
                  });
               }
            });
         }
      }
   });
};

exports.buy = function (req, res) {
   let publicKey = req.body.publicKey;
   let choice = req.body.userchoice;
   let quantity = req.body.quantity;
   let real_balance = req.body.real_balance;
   let balance_available = req.body.balance;
   var total;
   var outputBalance;
   var listHistory = [];

   if (choice === "tea") {
      total = 0;
   } else if (choice === "coffee") {
      total = quantity * 7;
   } else if (choice === "yogurt") {
      total = quantity * 10;
   }

   User.findById(req.session.userId).exec(function (err, user) {
      if (err) return res.json(err);
      else {
         if (user === null) {
            return res.render("login_popup", {
               msg: "Not authorized"
            });
         } else {
            let walletId = user.walletId;
            let username = user.username;
            WalletAcc.findOne({ walletId: walletId }).exec(function (
               err,
               walletAcc
            ) {
               if (err) return res.json(err);
               else {
                  let wallet = new Wallet(walletAcc.walletId, walletAcc.publicKey, walletAcc.privateKey, balance_available);
                  if (total <= real_balance) {
                     let transaction = wallet.createTransaction(
                        'r3c1p13nt',
                        50,
                        transactionPool
                     );
                     transaction.outputs.forEach(output => {
                        if (output.address === publicKey) {
                           outputBalance = output.amount;
                           console.log(56, "outputBalance: " + outputBalance);
                           return outputBalance;
                        }
                     });

                     transactionPool.transactions.forEach(transaction => {
                        transaction.outputs.forEach(output => {
                           if (output.address === publicKey) {
                              listHistory.push(transaction);
                           }
                        });
                     });
                     function axiosTest() {
                        return axios
                           .get("http://localhost:3000/blocks")
                           .then(response => {
                              // returning the data here allows the caller to get it through another .then(...)
                              return response.data;
                           });
                     }

                     axiosTest().then(data => {
                        console.log(108, data);
                        let balance = wallet.calculateBalance(data, real_balance);

                        return res.render("wallet", {
                           username: username,
                           balance: outputBalance,
                           real_balance: balance,
                           pk: publicKey,
                           list: listHistory,
                           sucList: successfullList
                        });

                     });
                  } else {
                     return res.render("wallet_popup", {
                        username: username,
                        balance: balance_available,
                        real_balance: real_balance,
                        pk: publicKey,
                        list: listHistory,
                        sucList: successfullList,
                        msg: "The amount exceeds the balance available"
                     });
                  }
               }
            });
         }
      }
   });
};

exports.charge = function (req, res) {
   var amountMoney = req.body.quantity;
   var balance_available = Number(req.body.balance);
   let real_balance = req.body.real_balance;
   var publicKey = req.body.publicKey;
   var listHistory = [];

   let transactionCharge = {
      transactionId: "bc3c4255-bb46-4799-84c3-7c0deacb690f",
      input: {
         timestamp: Date.now(),
         amount: Number(amountMoney),
         address: "Coin Seller",
         signature: "OK"
      },
      outputs: [
         { amount: 0, address: "Coin Seller" },
         {
            amount: amountMoney,
            address: publicKey
         }
      ]
   }

   User.findById(req.session.userId).exec(function (err, user) {
      if (err) return res.json(err);
      else {
         if (user === null) {
            return res.json("Not authorized! Go back");
         } else {
            let walletId = user.walletId;
            let username = user.username;
            WalletAcc.findOne({ walletId: walletId }).exec(function (
               err,
               walletAcc
            ) {
               if (err) return res.json(err);
               else {
                  let wallet = new Wallet(walletAcc.walletId, walletAcc.publicKey, walletAcc.privateKey, balance_available)
                  transactionPool.addTransaction(transactionCharge);
                  transactionPool.transactions.forEach(transaction => {
                     transaction.outputs.forEach(output => {
                        if (output.address === walletAcc.publicKey) {
                           listHistory.push(transaction);
                        }
                     });
                  });
                  let outputBalance = wallet.calculateBalanceAvailable(transactionPool);
                  function axiosTest() {
                     return axios
                        .get("http://localhost:3000/blocks")
                        .then(response => {
                           // returning the data here allows the caller to get it through another .then(...)
                           return response.data;
                        });
                  }

                  axiosTest().then(data => {
                     let balance = wallet.calculateBalance(data, real_balance);
                     return res.render("wallet", {
                        username: username,
                        balance: outputBalance,
                        real_balance: balance,
                        pk: publicKey,
                        list: listHistory,
                        sucList: successfullList
                     });
                  });
               }
            });
         }
      }
   });
};

exports.getTransaction = function (req, res) {
   res.json(transactionPool.transactions);
   //ClearTransaction();
};
// Clear transaction by id
exports.DeleteTransaction = function(req, res){
   function getTransactionId(){
      return axios.get(`http://localhost:3001/transId`).then(response =>{
         return response.data;
      })
   }
   
   getTransactionId().then(data =>{
      if(data === null){
         console.log(228,"----");
      }else{
         console.log(230, data);

         transactionPool.clearById(data);
         res.send(233,"Successfully!");
         //res.json(transactionPool.transactions);
      }
   });
}

exports.validTransaction = function (req, res) {
   res.json(transactionPool.validTransactions());
}

// test Transaction Pools
exports.testPool = function (req, res) {
   res.json(transactionPool);
};

// clear transaction pool
exports.clearTransaction = function () {
   transactionPool.transactions.shift();
};

exports.getChain = function (req, res) {
   function axiosTest() {
      return axios.get("http://localhost:3000/blocks").then(response => {
         // returning the data here allows the caller to get it through another .then(...)
         return response.data;
      });
   }

   axiosTest().then(data => {
      let balance = wallet.calculateBalance(data);
      res.json({ message: "Request received!", balance });
   });
};

exports.getBlock = function (req, res) {
   res.json(get);
};
