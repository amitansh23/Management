import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { DateTime } from 'luxon';


const userSchema = new Schema({
    fname:{
        type:String,
        required :true,
    },
    lname:{
        type:String,
        required :true,
    },
    email:{
        type:String,
        required :true,
    },
    password:{
        type:String,
        required :true,
    },
    status:{
        type: Number,
        default :1,

    },
    address:{
        type: String,
        // required: true,
    },
    phone:{
        type: String,
        // required: true
    },
    role:{
        type: Number,
        required : true,
        default: 2
    },
    Created_at: {
        type: String
    },
    Updated_at: {
        type: String
    },
    CreatedBy:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    }

})

userSchema.pre("save", function setDatetime(next){
    this.Created_at = DateTime.now().toUTC().toISO()
    this.Updated_at = DateTime.now().toUTC().toISO()
    next()
    
})

export default mongoose.model("user", userSchema);// Database crud mai User table bnegi usmai ye userSchema store hoga
