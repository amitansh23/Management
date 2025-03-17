import HotelRegistration from "../model/hotelschema.js";
import bcrypt from "bcrypt";
import Booking from "../model/Hbooking.js";
import user from "../model/user.js";
import hoteldetail from "../model/hoteldetail.js";
import OTP from "../model/otpModel.js";

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

    // Find user by email
    const user = await HotelRegistration.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid Login" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Incorrect password" });
    }

    return res.status(200).json({
      success: true,
      msg: "Login Successful",
      user,
      // token,
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

    const allSlots = ["1-3 pm", "4-6 pm", "6-9 pm"];
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

    console.log("Fetching data for hotel:", storedUser);

    const bookedSlots = await Booking.find({ hotel: storedUser }).populate(
      "bookedBy",
      "fname lname email phone"
    );

    console.log("Fetched Bookings:", bookedSlots);

    const allSlots = ["1-3 PM", "4-6 PM", "6-9 PM"];

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
    const updatedUser = await user.updateOne(
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
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Register",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const savedData = await user.create({
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

export const userlogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userdata = await user.findOne({ email });
    if (!userdata) {
      return res.status(404).json({ success: false, msg: "Invalid Login" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, userdata.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Incorrect password" });
    }

    return res.status(200).json({
      success: true,
      msg: "Login Successful",
      userdata,
      // token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
};

// REGISTRATION WITH WELCOME AND SUPERADMIN MAIL

export const finalregistration = async (req, res) => {
  try {
    const { fname, lname, email, password, address, phone } = req.body;
    const superAdminEmail = "amitanshchaurasiya@gmail.com"; // Change this to actual SuperAdmin Email

    if (!fname || !lname || !email || !password || !address || !phone) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Register",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const savedData = await user.create({
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
