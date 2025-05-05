const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
////////////////////////////
const sendOtpMail = require("../utils/mailer");
///////////////////////////
// fdfdfsd//////
const axios = require("axios");
// dsfndsofidsofi/////
require("dotenv").config();

// exports.signup = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {

//             return res.status(400).json({
//                 success: false,
//                 message: 'User already Exists, please login',
//             });
//         }

//         //secure password

//         let hashedPassword;
//         try {
//             hashedPassword = await bcrypt.hash(password, 10);
//         }
//         catch (err) {
//             return res.status(500).json(
//                 {
//                     success: false,
//                     message: 'Error inn hashing password',

//                 });
//         }

//         ////////////////
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const hashedOtp = await bcrypt.hash(otp, 10);
//         //////////////////

//         // create entry for user
//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//             otp: hashedOtp,
//             otpExpiry: Date.now() + 10 * 60 * 1000,
//             isVerified: false,
//         }
//         )

//         return res.status(200).json({
//             success: true,
//             message: 'User Created Successfully',
//         });



//     }
//     catch (error) {
//         console.error(500).json(
//             {
//                 success: false,
//                 message: 'User cannot be registered, please try again later',
//             }
//         );
//     }

// }

exports.signup = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please login.",
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
  
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        otp: hashedOtp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        isVerified: false,
      });
  
      await sendOtpMail(email, otp);
  
      return res.status(200).json({
        success: true,
        message: "Signup successful. OTP sent to email.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Signup failed. Try again later.",
      });
    }
  };



  // OTP Verification Endpoint
  exports.verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
  
      if (!user || user.isVerified) {
        return res.status(400).json({ message: "Invalid request or already verified." });
      }
  
      const isOtpValid = await bcrypt.compare(otp, user.otp);
      const isOtpExpired = user.otpExpiry < Date.now();
  
      if (!isOtpValid || isOtpExpired) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }
  
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
  
      return res.status(200).json({ success: true, message: "Email verified successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "OTP verification failed." });
    }
  };
  




//login router 

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'please fill all the details carefully',
                });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User is not registered',
            })
        }

        const payload = {
            email: user.email,
            id: user._id,
            role: user.role,
        };


        if (await bcrypt.compare(password, user.password)) {
            let token = jwt.sign(payload, process.env.JWT_SECRET,
                {
                    expiresIn: "2h",
                });
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: ' User logged in successfully',
            });
        }
        else {
            // password do not match
            return res.status(403).json(
                {
                    success: false,
                    message: 'Password Incorrect',
                });


        }
    }


    catch (error) {
        console.log(error);

        return res.status(500).json(
            {
                success: false,
                message: 'Login Failure',
            });
    }

}



// if (!user.isVerified) {
//   return res.status(403).json({
//     success: false,
//     message: "Please verify your email first.",
//   });
// }



// // Facebook Login
// exports.facebookLogin = async (req, res) => {
//   try {
//     const { access_token } = req.body;

//     const fbRes = await axios.get(
//       `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
//     );

//     const { name, email } = fbRes.data;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({ name, email, password: "", role: "Visitor" });
//     }

//     const payload = { email: user.email, id: user._id, role: user.role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

//     return res.status(200).json({
//       success: true,
//       token,
//       user,
//       message: "Facebook login successful",
//     });
//   } catch (error) {
//     console.error("Facebook Login Error:", error.message);
//     return res.status(500).json({ success: false, message: "Facebook login failed" });
//   }
// };

exports.googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { id_token } = tokenRes.data;
    const decoded = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    );

    const email = decoded.email;
    const name = decoded.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, password: "", role: "Visitor", isVerified: true });
    }

    const payload = { email: user.email, id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "Google login successful",
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Google login failed" });
  }
};


// Facebook Login
exports.facebookLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
    );

    const { name, email } = fbResponse.data;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email permission not granted from Facebook" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "",
        role: "Visitor",
        isVerified: true,
      });
    }

    const payload = { email: user.email, id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "Facebook login successful",
    });
  } catch (error) {
    console.error("Facebook Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Facebook login failed" });
  }
};





