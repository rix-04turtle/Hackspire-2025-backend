import crypto from 'crypto';
import connectDB from '../../utils/DB.js';

async function sendLoginOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: "error", message: 'Email is required.' });
        }

        const emailLower = email.toLowerCase();

        // Now connect to database
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

        // Check if user exists in users or participants collection
        const userExists = await db.collection('users').findOne({ email: emailLower });
        const participantExists = await db.collection('participants').findOne({ email: emailLower });

        // If user does not exist, return error
        if (!userExists && !participantExists) {
            return res.status(404).json({ status: "error", type: "no-user", message: "No user found with this email." });
        }

        // Generate 5 digit OTP 
        let otp = Math.floor(10000 + Math.random() * 90000).toString();

        // Current Timestamp with timezone consideration
        const currentTimestamp = new Date().toISOString();
        // 10 minutes later timestamp with timezone consideration
        const otpExpiryTimestamp = new Date(Date.now() + 10 * 60000).toISOString();

        // Secure hash of email+otp can be stored instead of plain OTP for better security using Node.js crypto
        const hash = crypto
            .createHash('sha256')
            .update(`${emailLower}${otp}`)
            .digest('hex');

        // Save the email, OTP and current timestamp to the database
        try {
            await db.collection('auth_otps').insertOne({
                email: emailLower,
                otp_code: hash,
                generated_at: currentTimestamp,
                expires_at: otpExpiryTimestamp,
                used: false
            });

            console.log("OTP saved to database successfully.");
        } catch (error) {
            console.error("Error saving OTP to database:", error);
            return res.status(500).json({ status: "error", message: "Failed to save OTP to database." });
        }


        // Now make a API call to send OTP to user's email
        const EMAIL_OTP_API = process.env.EMAIL_OTP_SENDER_API;
        if (!EMAIL_OTP_API) {
            return res.status(500).json({ status: "error", message: "Email OTP API is not configured." });
        }

        try {
            const response = await fetch(EMAIL_OTP_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailLower, otp }),
            });

            if (!response.ok) {
                throw new Error("Failed to send OTP");
            }

            const result = await response.json();
            if (result.status !== "success") {
                throw new Error(result.message || "Failed to send OTP");
            }

            return res.status(200).json({ status: "success", message: "OTP sent successfully." });

        } catch (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ status: "error", message: "Failed to send OTP email." });
        }

    } catch (error) {
        console.error("Error in sendLoginOtp:", error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export default sendLoginOtp;