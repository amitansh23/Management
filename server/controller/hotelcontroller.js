import HotelRegistration from "../model/hotelschema.js";
import bcrypt from "bcrypt";
import Booking from "../model/Hbooking.js";
// import user from "../model/user.js";
import User from "../model/user.js";
import hoteldetail from "../model/hoteldetail.js";
import OTP from "../model/otpModel.js";
import { sendEmail } from "../utils/emailService.js";
import {fileURLToPath} from "url";
import path from "path";
import ejs from "ejs";
// import nodemailer from "nodemailer";
import Feedback from "../model/Feedback.js";
import Activity from "../model/Activitytrack.js";
import { setUser } from "../middleware/token.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registration = async (req, res) => {
  try {
    const { ownername, address, contact, email, password } = req.body;
    //   const superAdminEmail = "amitanshchaurasiya@gmail.com"; // Change this to actual SuperAdmin Email

    if (!ownername || !address || !contact || !email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user already exists
    const existingUser = await HotelRegistration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Register",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const savedData = await HotelRegistration.create({
      ownername,
      address,
      contact,
      email,
      password: hashpassword,
    });

    return res.status(200).json({ msg: "Registration Successful", savedData });
  } catch (error) {
    console.log(error);
  }
};




export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await HotelRegistration.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid Login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Incorrect password" });
    }

    const token = setUser(user);

    req.session.user = {
      _id: user._id, 
      email: user.email,
      token: token,
      isLoggedIn: true,
    };

    try {
      await req.session.save();
      console.log("Session saved successfully");
    } catch (error) {
      console.error("Error setting session:", error);
      return next(new Error("Error creating user session"));
    }
    

    return res.status(200).json({
      success: true,
      msg: "Login Successful",
      user,
    
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
};

export const book = async (req, res) => {
  try {
    const { hotel, date, timeSlot, userId } = req.body;

    // **Check if the slot is already booked**
    const existingBooking = await Booking.findOne({ hotel, date, timeSlot });

    if (existingBooking) {
      return res.status(400).json({ message: "This slot is already booked!" });
    }

    // **Book the slot**
    const newBooking = await Booking.create({
      hotel,
      date,
      timeSlot,
      bookedBy: userId,
    });

    res
      .status(201)
      .json({ message: "Booking successful!", booking: newBooking });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const available_slots = async (req, res) => {
  try {
    const { hotel, date } = req.query;

    const bookedSlots = await Booking.find({ hotel, date }).select("timeSlot");

    // const allSlots = ["1-3 pm", "4-6 pm", "6-9 pm"];
    const allSlots = ["Morning", "Evening"];
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.some((b) => b.timeSlot === slot)
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHotelDashboard = async (req, res) => {
  try {
    
    const storedUser = req.headers.hotelname;

    if (!storedUser) {
      return res.status(401).json({ msg: "Unauthorized: No hotel found" });
    }

    // console.log("Fetching data for hotel:", storedUser);

    const bookedSlots = await Booking.find({ hotel: storedUser }).populate(
      "bookedBy",
      "fname lname email phone"
    );


    const allSlots = ["Morning","Evening"];
    // const allSlots = ["1-3 PM", "4-6 PM", "6-9 PM"];

    const bookedTimeSlots = bookedSlots.map((b) => b.timeSlot);

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimeSlots.includes(slot)
    );

    res.status(200).json({ bookedSlots, availableSlots });
  } catch (error) {
    console.error("Error fetching hotel dashboard:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const forgotpassword = async (req, res) => {
  const { email } = req.body;
  const { otp } = req.body;
  const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
  if (response.length === 0 || otp !== response[0].otp) {
    return res.status(400).json({
      success: false,
      message: "The OTP is not valid",
    });
  }
  return res.status(200).json({ msg: "OTP verified", email });
};

export const updatepassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.updateOne(
      { email }, // Find user by email
      { $set: { password: hashPassword } } // Update only password
    );

    if (updatedUser.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or password already updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
      error: error.message,
    });
  }
};

export const hoteldetaill = async (req, res) => {
  try {
    const {
      ownername,
      hotelname,
      address,
      contact,
      email,
      room,
      about,
      features,
      price,
    } = req.body;
    //   const superAdminEmail = "amitanshchaurasiya@gmail.com"; // Change this to actual SuperAdmin Email

    if (
      !ownername ||
      !hotelname ||
      !address ||
      !contact ||
      !email ||
      !room ||
      !about ||
      !features ||
      !price
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // // Check if user already exists
    // const existingUser = await HotelRegistration.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'User already Register',
    //   });
    // }

    const savedData = await hoteldetail.create({
      ownername,
      hotelname,
      address,
      contact,
      email,
      features,
      room,
      price,
      about,
    });

    return res.status(200).json({ msg: "Registration Successful", savedData });
  } catch (error) {
    console.log(error);
  }
};


export const pendingbooking = async(req,res)=>{
  try {

    await Booking.findByIdAndUpdate(req.params.id, { status: 0 });
    res.status(200).json({ msg: "Booking Pending"});
    
  } catch (error) {
    res.status(500).json(error);
  
  }
}

export const confirmbooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 1 }, 
      { new: true }
    ).populate("bookedBy"); 

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const user = booking.bookedBy; // Get user details
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const confirmBookingPath = path.join(__dirname, "../views/confirmBooking.ejs");

    // Render the EJS Template
    ejs.renderFile(
      confirmBookingPath,
      {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        hotelname: booking.hotel,
        bookingDate: booking.date,
        timeSlot: booking.timeSlot,
      },
      async (err, emailHtml) => {
        if (err) {
          console.error("Error rendering email template:", err);
          return res.status(500).json({ msg: "Error generating email template" });
        }

        const mailOptions = {
          from: '"Hotel Booking" <yourhotel@example.com>',
          to: user.email,
          subject: "Your Hotel Booking is Confirmed!",
          html: emailHtml, 
        };

        await sendEmail(mailOptions);
        return res.status(200).json({ msg: "Booking Confirmed & Email Sent!" });
      }
    );
  } catch (error) {
    console.error("Error confirming booking:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};




export const cancelbooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 2 }, { new: true })
      .populate("bookedBy", "fname lname email")
      .populate("hotel", "hotel");

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const { fname, lname, email } = booking.bookedBy;
    const hotelname = booking.hotel;
    const bookingDate = booking.date;
    const timeSlot = booking.timeSlot;

    const cancelBookingPath = path.join(__dirname, "../views/cancelBooking.ejs");

    ejs.renderFile(cancelBookingPath, { fname, lname, email, hotelname, bookingDate, timeSlot }, async (err, emailHtml) => {
      if (err) {
        console.error("Error rendering cancellation email:", err);
        return res.status(500).json({ msg: "Error generating email template" });
      }

      const mailOptions = {
        from: '"Hotel Booking" <yourhotel@gmail.com>',
        to: email,
        subject: "Booking Cancellation - " + hotelname,
        html: emailHtml,
      };

      await sendEmail(mailOptions);
      return res.status(200).json({ msg: "Booking Cancelled and Email Sent" });
    });
  } catch (error) {
    console.error("Error in cancelBooking API:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const completebooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 3 }, { new: true })
      .populate("bookedBy", "fname lname email _id")
      .populate("hotel", "name " );

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const { fname, lname, email , _id } = booking.bookedBy;
    const hotelname = booking.hotel;
    const bookingDate = booking.date;
    const timeSlot = booking.timeSlot;

    const feedbackLink = `http://localhost:3000/feedback?userId=${_id}&hotelname=${booking.hotel}`;

    const completeBookingPath = path.join(__dirname, "../views/completeBooking.ejs");

    ejs.renderFile(completeBookingPath, { fname, lname, email, hotelname, bookingDate, timeSlot, feedbackLink }, async (err, emailHtml) => {
      if (err) {
        console.error("Error rendering cancellation email:", err);
        return res.status(500).json({ msg: "Error generating email template" });
      }

      const mailOptions = {
        from: '"Event Complete" <yourhotel@gmail.com>',
        to: email,
        subject: "Booking complete - " + hotelname,
        html: emailHtml,
      };

      await sendEmail(mailOptions);
      return res.status(200).json({ msg: "Booking Cancelled and Email Sent" });
    });
  } catch (error) {
    console.error("Error in cancelBooking API:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const submitFeedback = async (req, res) => {
  try {
    const {userId , hotelname, rating, experience } = req.body;
    if(!userId || !hotelname ||  !experience) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const feedback = await Feedback.create({ userId, hotelname, rating, experience });
    res.status(201).json({ msg: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    
  }
}


export const getHotelFeedback = async (req, res) => {
  try {
    const { hotelname } = req.params;
    if (!hotelname) {
      return res.status(400).json({ msg: "Hotel ID is required" });
    }
    const feedbacks = await Feedback.find({ hotelname }).populate("userId", "fname lname email");
    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    
  }
}





















//  USER API

export const userregistration = async (req, res) => {
  try {
    const { fname, lname, email, password, address, phone } = req.body;
    //   const superAdminEmail = "amitanshchaurasiya@gmail.com"; // Change this to actual SuperAdmin Email

    if (!fname || !lname || !address || !phone || !email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Register",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const savedData = await User.create({
      fname,
      lname,
      address,
      phone,
      email,
      password: hashpassword,
    });

    return res.status(200).json({ msg: "Registration Successful", savedData });
  } catch (error) {
    console.log(error);
  }
};



// REGISTRATION WITH WELCOME AND SUPERADMIN MAIL


export const userlogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid Login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Incorrect password" });
    }

    const token = setUser(user);

    req.session.user = {
      _id: user._id, 
      email: user.email,
      token: token,
      isLoggedIn: true,
    };

    try {
      await req.session.save();
      console.log("Session saved successfully");
    } catch (error) {
      console.error("Error setting session:", error);
      return next(new Error("Error creating user session"));
    }
    

    return res.status(200).json({
      success: true,
      msg: "Login Successful",
      user,
    
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
};


export const finalregistration = async (req, res) => {
  try {
    const { fname, lname, email, password, address, phone } = req.body;
    const superAdminEmail = "amitanshchaurasiya@gmail.com"; //   SuperAdmin Email

    if (!fname || !lname || !email || !password || !address || !phone) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Register",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const savedData = await User.create({
      fname,
      lname,
      email,
      password: hashpassword,
      address,
      phone,
    });

    // **Path for Welcome Email Template**
    const welcomeTemplatePath = path.join(
      __dirname,
      "../views/Welcomeuser.ejs"
    );

    // **Path for SuperAdmin Notification Email Template**
    const adminTemplatePath = path.join(
      __dirname,
      "../views/AdminNotification.ejs"
    );

    // **Render Welcome Email for User**
    ejs.renderFile(
      welcomeTemplatePath,
      { name: fname },
      async (err, userHtml) => {
        if (err) {
          console.error("Error rendering User Welcome Email:", err);
          return res
            .status(500)
            .json({ msg: "Error generating user email template" });
        }

        // **Email Configuration for User**
        const userMailOptions = {
          from: '"Welcome Team" <officialcheck1234@gmail.com>',
          to: email,
          subject: "Welcome to Our Platform!",
          html: userHtml,
        };

        // **Render Admin Notification Email**
        ejs.renderFile(
          adminTemplatePath,
          {
            fname,
            lname,
            email,
            phone,
            address,
            createdAt: new Date().toLocaleString(),
          },
          async (err, adminHtml) => {
            if (err) {
              console.error("Error rendering Admin Email:", err);
              return res
                .status(500)
                .json({ msg: "Error generating admin email template" });
            }

            // **Email Configuration for SuperAdmin**
            const adminMailOptions = {
              from: '"New User Notification" <officialcheck1234@gmail.com>',
              to: superAdminEmail,
              subject: "New User Registered on the Platform",
              html: adminHtml,
            };

            try {
             
              await sendWelcomeEmail(userMailOptions); // Send User Welcome Email
              await sendWelcomeEmail(adminMailOptions); // Send SuperAdmin Notification Email

              return res
                .status(200)
                .json({ msg: "User Registered & Emails Sent", savedData });
            } catch (emailError) {
              console.error("Error sending emails:", emailError);
              return res
                .status(500)
                .json({ msg: "User registered, but emails not sent" });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};



// export const trackEvent = async (req, res) => {
//   console.log(req.body,"gwd");
//   try {
//     const { userId, event } = req.body;

//     const sessionId = req.sessionID.toString(); // Get session ID from session automatically
//     console.log(sessionId,"sid");

//     let activity = await Activity.findOne({ sessionId });

//     if (!activity) {
//         activity = new Activity({ userId, sessionId, events: [] });
//     }

//     activity.events.push(event);
//     // activity.device = device;
//     await activity.save();

//     res.status(200).json({ success: true, msg: "Event tracked successfully" });
// } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, msg: "Error tracking event" });
// }
// };


export const trackEvent = async (req, res) => {
 
  try {
      const { userId, event } = req.body;
      const sessionId = req.sessionID.toString(); 

      let activity = await Activity.findOne({ sessionId });

      if (!activity) {
          activity = new Activity({ userId, sessionId, events: [] });
      }

      activity.events.push({
          type: event.type, 
          timestamp: event.timestamp || new Date(), 
      });

      await activity.save();

      res.status(200).json({ success: true, msg: "Event tracked successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: "Error tracking event" });
  }
};



export const logout = async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, msg: "Logout failed" });
      }
      res.clearCookie("example"); // Ensure the session cookie is cleared
      return res.status(200).json({ success: true, msg: "Logout successful" });
    });
  } else {
    return res.status(400).json({ success: false, msg: "No active session" });
  }
};


