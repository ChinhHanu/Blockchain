const uuidv1 = require("uuid");
const Cryptography = require("../../common/cryptography");

class Transaction {
  constructor() {
    this.transactionId = uuidv1();
    this.input = null;
    this.outputs = [];
  }

  newTransaction(senderWallet, recipient, amount) {
    if (amount > senderWallet.balance) {
      return this.transactionWithOutputs(senderWallet, [
        { amount: "exceeds balance", address: "can not carry out" },
        { amount: senderWallet.balance, address: senderWallet.publicKey }
      ]);
    }
    return this.transactionWithOutputs(senderWallet, [
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount: amount, address: recipient }
    ]);
  }

  transactionWithOutputs(senderWallet, outputs) {
    console.log('--- outputs : '+ JSON.stringify(outputs))
    const transaction = new Transaction();
    transaction.outputs.push(...outputs);
    this.signTransaction(transaction, senderWallet);
    return transaction;
  }

  updateTransaction(senderWallet, recipient, amount) {
    const senderOutput = this.outputs.find(
      output => output.address === senderWallet.publicKey
    );
    if (amount > senderWallet.amount) {
      console.log("The amount " + amount + "exceeds the balance");
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;
    this.outputs.push({ amount: amount, address: recipient });
    this.signTransaction(this, senderWallet);

    return this;
  }

  signTransaction(transaction, senderWallet) {
    // console.log('--- senderWallet.keyPair : ' + JSON.stringify(senderWallet.keyPair));
    // console.log('-- senderWallet : ' + JSON.stringify(senderWallet));
    console.log('---transaction.outputs : ' + JSON.stringify(transaction.outputs));
    console.log('---signature : ' + JSON.stringify(senderWallet.sign(Cryptography.hash(transaction.outputs))));

    transaction.input = {
      timestamp: Date.now(),
      amount: Number(senderWallet.balance),
      address: senderWallet.publicKey,
      signature: senderWallet.sign(Cryptography.hash(transaction.outputs))
    };
  }

  verifyTransaction(transaction) {
    console.log('---transaction.outputs : ' + JSON.stringify(transaction.outputs));
    console.log('---transaction.input.signature : ' + JSON.stringify(transaction.input.signature));


    console.log(57, Cryptography.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      Cryptography.hash(transaction.outputs)))
    return Cryptography.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      Cryptography.hash(transaction.outputs)
    )
  }
}

module.exports = Transaction;
