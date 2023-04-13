const mongoose = require("mongoose");
const listDataSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true,
       
    },
    des:{
        type:String,
        required:true,
        trim:true
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    username:{
        type:String,
        required:true,
        trim:true
    }

})
const listData = new mongoose.model("listData", listDataSchema)
module.exports = listData;