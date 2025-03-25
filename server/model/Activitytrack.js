import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    sessionId: { type: String, required: true },
    events: [
        {
            type: { type: String, required: true }, // Store event type as string
            timestamp: { type: Date, default: Date.now }, // Store event time as Date
        },
    ],
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
