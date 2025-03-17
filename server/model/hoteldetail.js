import mongoose from 'mongoose';

const hoteldetail= new mongoose.Schema({
    hotelname:{
        type:String,
        required:true,
    },
    ownername:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    contact:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    room:{
        type: Number,
        required:true,

    },
    price:{
        type:Number,
        required:true,
    },
    about:{
        type:String,
        required:true,
    },
    features:{
        type: String,
        required:true,
    },
    status:{
        type: Number,
        deafult: 0
    }
},{timestamps: true});

export default mongoose.model("Hoteldetailschema", hoteldetail)