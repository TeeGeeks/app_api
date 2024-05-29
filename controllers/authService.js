const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken"); // Assuming User model is defined
const User = require("../models/users");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "492660170770-53vpqo5uitttd2vkhh73uobdrec1b1lg.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload;
}

async function loginWithGoogle(token) {
  const payload = await verifyGoogleToken(token);

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = new User({
      email: payload.email,
      // Add other user data as needed
    });
    await user.save();
  }

  const jwtToken = jwt.sign({ userId: user._id }, "teegeekstoken", {
    expiresIn: "1h",
  });
  return jwtToken;
}

module.exports = {
  loginWithGoogle,
};
