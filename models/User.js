const mongoose = require('mongoose');
const {isEmail} = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter A Valid Name"],
    unique: false,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Please enter an Email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please Enter a Valid Email Address.']
  },
  password: {
    type: String,
    required: [true, 'Please enter an Password'],
    minlength: [6, 'Minimum Password Length is 6 Characters Long.']

  } 
})

userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

const User = mongoose.model('user', userSchema);

module.exports = User;