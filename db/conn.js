const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/personData').then(()=>{
    console.log("connected successfully");
}).catch((e)=>{
    console.log("no connection");
})