var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var walletSchema = Schema({
    walletId: {
        type: String, 
        required: true
    }, 
    publicKey: String,
    privateKey: String,
    balance: Number,
    createdTime: {
        type: Date,
        default: Date.now()
    }
});

var WalletAccount = module.exports = mongoose.model('wallet_account', walletSchema);
module.exports.get = function(callback, limit){
    WalletAccount.find(callback).limit(limit);
}
