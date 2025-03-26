import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    hotel: { type: String, required: true }, // "H1", "H2", "H3"
    date: { type: String, required: true }, // "YYYY-MM-DD"
    timeSlot: { type: String, required: true }, // "Morning", "4-6 pm", "6-9 pm"
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User ID
    status:{
      type: Number,
      enum: [0, 1, 2, 3], // 0: Pending, 1: Approved, 2: Rejected , 3: Completed
      default: 0,

    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
