const P2pserver = require("./p2p_server");

// create a p2p server instance with the blockchain and the transaction pool
const p2pserver = new P2pserver();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fs = require('fs');

//include routes
let apiUserWallet = require("./routes/UserWalletRoute");
let apiUser = require("./routes/UserRoute");
let apiWallet = require('./routes/WalletRoute');

const axios = require('axios');


const HTTP_PORT = process.env.PORT || 3000;

//parse incoming requrest
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(
  "mongodb://localhost/user_wallet",
  {
    useCreateIndex: true,
    useNewUrlParser: true
  }
);
var db = mongoose.connection;

// use session for tracking login
app.use(session({
  secret: 'try best',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set("views", "../Wallet/View");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("login");
});

app.use("/user_wallet", apiUserWallet);
app.use("/user", apiUser);
app.use('/wallet', apiWallet);

app.listen(HTTP_PORT, () => {
  console.log("Server is running on port " + HTTP_PORT);
});

// api to get blocks
app.get("/blocks", (req, res) => {
  res.json(p2pserver.blockchain.chain);

  axios.get("http://localhost:3000/user_wallet/deleteTrans");
});

// get stored blocks by p2p_port number
app.get('/chainFromPeer/:port', (req, res) => {
  let filePath = '../Peer/logFile/chain' + req.params.port + '.txt';
  // read data from file txt
  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.error(err);
    }
    let storedChain = JSON.parse(data);
    res.json(storedChain);
  })
})

// get stored blocks
app.get('/storedBlocks', (req, res) => {
  // read data from chain5000.txt
  fs.readFile('./logFile/chain5000.txt', function (err, data) {
    if (err) {
      return console.error(err);
    }
    let storedBlocks = JSON.parse(data);
    res.json(storedBlocks);
  })
});

// get stored transactions
app.get('/storedTransactions', (req, res) => {
  // read data from Transactions.txt
  fs.readFile('./logFile/Transactions.txt', function (err, data) {
    if (err) {
      return console.error(err);
    }
    let transactions = JSON.parse(data);
    res.json(transactions);
  })
})

// api to get transaction
app.get('/transactions', (req, res) => {
  res.json(p2pserver.transactionPool.transactions);
})

p2pserver.listen();
