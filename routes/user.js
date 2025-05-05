const express = require("express");
const router = express.Router();

const {login, signup,verifyOtp,googleLogin,facebookLogin} = require("../controllers/auth");

router.post("/login", login);
router.post("/signup", signup);

///////////
router.post("/verify-otp", verifyOtp);

// router.get("/auth/google/callback", async (req, res) => {
//     const code = req.query.code;
  
//     if (!code) {
//       return res.status(400).json({ success: false, message: "Authorization code not provided" });
//     }
  
//     try {
//       const response = await axios.post("https://oauth2.googleapis.com/token", {
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//         grant_type: "authorization_code",
//       });
  
//       const { id_token } = response.data;
  
//       const decoded = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
//       const email = decoded.email;
//       const name = decoded.name;
  
//       let user = await User.findOne({ email });
//       if (!user) {
//         user = await User.create({ name, email, password: "", role: "Visitor" });
//       }
  
//       const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET, {
//         expiresIn: "2h",
//       });
  
//       return res.status(200).json({ success: true, token, user, message: "Google login successful" });
  
//     } catch (error) {
//       console.error("Google login failed:", error.response?.data || error.message);
//       return res.status(500).json({ success: false, message: "Google login failed" });
//     }
//   });
  
router.post("/auth/google", googleLogin);
router.get("/auth/facebook", facebookLogin);
module.exports = router ;