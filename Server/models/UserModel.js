var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = Schema({
    username: {
        type: String, 
        index: {
            unique: true
        },
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    walletId: String,
    createdTime: {
        type: Date,
        default: Date.now()
    }
});

var Account = module.exports = mongoose.model('user_account', accountSchema);
module.exports.get = function(callback, limit){
    Account.find(callback).limit(limit);
}
