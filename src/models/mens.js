const mongoose = require("mongoose");

const menSchema = new mongoose.Schema({
    password:{
        type:String,
        required:true,
       
    },
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    }
})


const MensRanking = new mongoose.model("userdata", menSchema)

module.exports = MensRanking;