const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    image: String,
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comment: [{
        comment:String,
        userId:String
    }]

});

module.exports = mongoose.model('post', postSchema);