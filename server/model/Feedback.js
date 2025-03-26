import mongoose from 'mongoose';


const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    // required: true,
  },
  experience: {
    type: String,
    // required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",

  },
  hotelname:{
    type: String,
    // ref: "Hoteldetailschema",
  },
  visibility:{
    type: Number,
    enum: [0,1], // 0: Not visible, 1: Visible
    default: 0
  }
});



export default mongoose.model("Feedback", feedbackSchema);