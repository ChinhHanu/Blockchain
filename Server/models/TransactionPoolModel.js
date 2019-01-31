const Transaction = require('./TransactionModel');

const transactionModel = new Transaction();

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    existingTransaction(address) {
        return this.transactions.find(transaction => transaction.input.address === address);
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    validTransactions() {
        /**
         * valid transactions are the one whose total output amounts to the input
         * and whose signatures are same
         */
        return this.transactions.filter((transaction) => {

            // reduce function adds up all the items and saves it in variable
            // passed in the arguments, second param is the initial value of the 
            // sum total

            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            if (transaction.input.amount !== outputTotal) {
                console.log(51, `Invalid transaction from ${transaction.input.address}`);
                return;
            }

            // if (!transactionModel.verifyTransaction(transaction)) {
            //     console.log(`Invalid signature from ${transaction.input.address}`);
            //     return;
            // }

            return transaction;
        });
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    clear() {
        this.transactions = [];
    }

    clearById(tranId) {
        let delTransaction = this.transactions.find(transaction => transaction.transactionId === tranId);
        // console.log(62, delTransaction)
        var idx = this.transactions.indexOf(delTransaction);

        // var removedTran = this.transactions.splice(idx, 1);
        this.transactions.splice(idx, 1);
        // console.log(70, removedTran);
        return this.transactions;
    }
}
module.exports = TransactionPool;