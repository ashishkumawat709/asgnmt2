const mongoose = require("mongoose");
var validator = require('validator');
const personSchema = new mongoose.Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  phone_no: {
    type: Number,
  },
  email: {
    type: String,
     unique: true,
    lowercase:true,
    required: true
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  login_id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {         // print date in india standard time 
    type: String,
    default: Date
  }
})          
const personData = new mongoose.model("personData", personSchema);  //collection 
module.exports = personData;  