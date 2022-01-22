const mongoose = require('mongoose');

const plm  = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/social');

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
});

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema);