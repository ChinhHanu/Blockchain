const WebSocket = require("ws");

const axios = require('axios');

const fs = require('fs');

// const UserWalletController = require('./controller/UserWalletController');

const Blockchain = require('../blockchain/blockchain');
const TransactionPool = require('../Server/models/TransactionPoolModel');

const blockchain = new Blockchain();

var transactionPool = new TransactionPool();

//declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT || 5000;

// list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

const MESSAGE_TYPE = {
    chain: "CHAIN",
    transaction: "TRANSACTION",
    clear_transactions: "CLEAR_TRANSACTIONS"
};

// get transaction to send to peers
function getTransaction() {
    return axios.get('http://localhost:3000/user_wallet/getTransaction').then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    })
}

class P2pserver {
    constructor() {
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
    }

    // create a new p2p server and connections
    listen() {
        // create the p2p server with port as argument
        const server = new WebSocket.Server({ port: P2P_PORT });

        // event listener and a callback function for any new connection
        // on any new connection the current instance will send the current chain
        // to the newly connected peer
        server.on('connection', socket => this.connectSocket(socket));

        // to connect to the peers that we have specified
        this.connectToPeers();

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);

    }

    // create path, write to file
    toFile() {
        // create file path for storing chain
        let filePathChain = './logFile/chain' + P2P_PORT + '.txt';
        // write chain to file chain5000.txt
        fs.writeFile(filePathChain, JSON.stringify(this.blockchain.chain), function (err) {
            if (err) throw err;
            console.log('store chain successfully!!!')
        })

        // array to store transaction in chain
        let storedTransactions = [];
        for (let i = 0; i < this.blockchain.chain.length - 1; i++) {
            storedTransactions.push(this.blockchain.chain[i].transaction);
        }

        // write transaction to file Transactions.txt
        fs.writeFile('./logFile/Transactions.txt', JSON.stringify(storedTransactions), function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("store transaction successfully");
        })
    }

    // after making connection to a socket
    connectSocket(socket) {

        // push the socket to the socket array
        this.sockets.push(socket);
        console.log("New one connected!");

        // register a message event listener to the socket
        this.messageHandler(socket);

        getTransaction().then(data => {
            // on new connection send the transactions to the peer
            console.log(79, data);
            // transactionPool = data;
            // console.log(81, transactionPool);
            // const validTransacts = transactionPool.printSmt();
            // console.log(83, validTransacts);
            this.sendTransaction(socket, data);
        });

    }

    connectToPeers() {

        //connect to each peer
        peers.forEach(peer => {

            // create a socket for each peer
            const socket = new WebSocket(peer);

            // open event listner is emitted when a connection is established
            // saving the socket in the array
            socket.on('open', () => this.connectSocket(socket));

        });
    }

    messageHandler(socket) {
        //on recieving a message execute a callback function
        socket.on('message', message => {
            const data = JSON.parse(message);

            // console.log(89, data.chain)

            switch (data.type) {
                case MESSAGE_TYPE.chain:
                    /** replace chain if new one is longer 
                     * or timestamp is shorter */
                    if (data.chain === undefined) {
                        console.log("no new chain");
                    } else {
                        this.blockchain.replaceChain(data.chain);
                        // write chain to txt
                        this.toFile();
                    }
                    break;
                case MESSAGE_TYPE.transaction:
                    /**
                     * add transaction to the transaction
                     * pool or replace with existing one
                     */
                    this.transactionPool.addTransaction(data.transaction);
                    break;
                case MESSAGE_TYPE.clear_transactions:
                    /**
                     * clear the transactionpool
                     */
                    transactionPool.clear();
                    break;
            }

        });
    }

    /**
     * sends users blockchain to every peer
     * it will send individual transactions
     * not the entire pool
     */
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction);
        });
    }

    /**
     * function to send transaction as a message
     * to a socket
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
        })
        );
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({
                type: MESSAGE_TYPE.clear_transactions
            }))
        })
    }

}

module.exports = P2pserver;
