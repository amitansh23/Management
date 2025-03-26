import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, 
      secure: false, 
      auth: {
        user: "officialcheck1234@gmail.com", 
        pass: "keer gpjv fdqg kujx", 
      },
    });

    const info = await transporter.sendMail(mailOptions);
    // console.log(" Email Sent:", info.response);
    return info;
  } catch (error) {
    console.error(" Error Sending Email:", error);
    return { success: false, error };
  }
};
