import mongoose from 'mongoose';

const hotel= new mongoose.Schema({
    hotelname:{
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
    password:{
        type:String,
        required:true,
    },
    status:{
        type: Number,
        deafult: 0
    }
},{timestamps: true});

export default mongoose.model("HotelRegistration", hotel)