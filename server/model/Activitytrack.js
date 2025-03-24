// import mongoose from 'mongoose';

// const activitySchema = new mongoose.Schema({
//     // userId: String,
//     userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
//     sessionId: { type: String },
//     events: [
//         {
//             type: String,
//             // url: String,
//             // element: String,
//             timestamp: { type: Date, default: Date.now },
//         },
//     ],
//     // device: {
//     //     os: String,
//     //     browser: String,
//     //     ip: String,
//     // },
//     sessionStart: { type: Date, default: Date.now },
//     sessionEnd: Date,
// });

// export default mongoose.model("Activity", activitySchema);




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
