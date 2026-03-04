import nodemailer from "nodemailer";

export const sendOtpMail = async (userEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "viky00650@gmail.com",
      pass: "xrbgatzwsjmixnsf"
    }
  });

  await transporter.sendMail({
    from: `"Auth App" <viky00650@gmail.com>`,
    to: userEmail,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`
  });

  console.log("📩 OTP sent to:", userEmail);
};
