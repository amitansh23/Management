import route from './routes/Route.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;
const MONGO_URI = process.env.MONGO_URI;


app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(session({
  name: "sessionId",
  secret: "Amitansh",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: "sessions" }),
  cookie: { maxAge: 1000 * 60 * 60 * 1, secure: false, httpOnly: true },
}));


app.use('/api', route);


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


 