import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    sessionId: { type: String, required: true },
    events: [
        {
            type: { type: String, required: true }, // ismai event store
            timestamp: { type: Date, default: Date.now }, 
        },
    ],
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
