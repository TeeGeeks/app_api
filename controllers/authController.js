const authService = require("./authService");

async function loginWithGoogle(req, res) {
  const { token } = req.body;
  console.log(token);

  try {
    const jwtToken = await authService.loginWithGoogle(token);
    res.status(200).json({ token: jwtToken });
  } catch (err) {
    console.error("Error during Google Sign-In:", err);
    res.status(400).json({ error: "Google Sign-In failed" });
  }
}

module.exports = {
  loginWithGoogle,
};
