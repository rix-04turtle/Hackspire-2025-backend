import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '../../utils/DB.js';

async function verifyOtp(req, res) {
    let body = null;

    try {
        body = req.body;
    } catch (err) {
        return res.status(400).json({ status: "error", message: "Invalid JSON body", error: "auth-error" });
    }

    const { email, otp } = body || {};
    const emailLower = email ? String(email).toLowerCase().trim() : "";
    const trimmedOtp = otp ? String(otp).trim() : "";

    if (!emailLower || !trimmedOtp) {
        return res.status(400).json({ status: "error", message: "Email and OTP are required", error: "auth-error" });
    }

    let db = null;
    try {
        console.log("Attempting to connect to database...");
        db = await connectDB();
        if (!db) {
            console.error("Database connection returned null/undefined");
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }
    } catch (error) {
        console.error("Error connecting to database:", error);
        return res.status(500).json({ status: "error", message: "Error connecting to database" });
    }

    try {
        const hashedOtp = crypto
            .createHash('sha256')
            .update(`${emailLower}${trimmedOtp}`)
            .digest('hex');

        // Find the OTP record
        const otpRecord = await db.collection('auth_otps').findOne(
            { otp_code: hashedOtp },
            { sort: { generated_at: -1 } }
        );

        if (!otpRecord || otpRecord.email !== emailLower) {
            return res.status(401).json({ status: "error", message: "Invalid OTP", error: "auth-error" });
        }

        if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
            return res.status(401).json({ status: "error", message: "OTP has expired", error: "auth-error" });
        }

        if (otpRecord.used) {
            return res.status(401).json({ status: "error", message: "This OTP has already been used", error: "already-used" });
        }

        // Mark the OTP as used
        const updateResult = await db.collection('auth_otps').updateOne(
            { otp_code: hashedOtp, email: emailLower, used: false },
            { $set: { used: true } }
        );

        if (!updateResult.modifiedCount) {
            return res.status(500).json({ status: "error", message: "Failed to process OTP", error: "server-error" });
        }

        // Fetch user details from users or participants collection
        let userRecord = await db.collection('users').findOne({ email: emailLower });
        
        if (!userRecord) {
            userRecord = await db.collection('participants').findOne({ email: emailLower });
        }

        if (!userRecord) {
            return res.status(404).json({ status: "error", message: "User not found", error: "auth-error" });
        }

        const userId = userRecord._id;
        const userEmail = userRecord.email?.trim().toLowerCase();

        if (!userId || !userEmail) {
            return res.status(500).json({ status: "error", message: "User record is incomplete", error: "auth-error" });
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ status: "error", message: "Server configuration error: JWT secret missing.", error: "server-error" });
        }

        const authToken = jwt.sign({ id: userId.toString(), email: userEmail }, jwtSecret);
        return res.status(200).json({ status: "success", message: "Login successful", authToken });

    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: "server-error" });
    }
}

export default verifyOtp;