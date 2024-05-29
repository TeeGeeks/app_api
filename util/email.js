const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: process.env.EMAIL_USER,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    // tls: {
    //   ciphers: "SSLv3",
    // },
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // your Gmail email address
      pass: process.env.GMAIL_PASS, // your Gmail password
    },
  });

  const emailOptions = {
    from: "Quotation App",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(emailOptions);
  //   try {
  //     const info = await transporter.sendMail(emailOptions);
  //     console.log("Email sent:", info);
  //   } catch (error) {
  //     console.error("Email sending failed:", error);
  //   }
};

module.exports = sendEmail;
