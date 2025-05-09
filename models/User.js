const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["Admin", "Student", "Visitor"]
        },
//////////////////////////
        otp: {
            type: String,
        },

        otpExpiry: {
            type: Date,
        },

        isVerified: {
            type: Boolean,
            default: false,
        }
//////////////////////////
    });

module.exports = mongoose.model("user", userSchema);