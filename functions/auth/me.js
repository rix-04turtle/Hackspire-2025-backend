import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import connectDB from '../../utils/DB.js';

async function me(req, res) {
    const authHeader = req.header('Authorization') || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authorization header is missing or invalid', error: "auth-error" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token not found', error: "auth-error" });
    }

    let user = {}; // Placeholder for user data
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload) {
            return res.status(401).json({ status: "error", message: 'Invalid token', error: "auth-error" });
        }

        // if the token is valid, extract user info from payload
        // Check if payload contains necessary user info id & email
        if (!payload.id || !payload.email) {
            return res.status(401).json({ status: "error", message: 'Invalid token payload', error: "auth-error" });
        }

        user = { id: payload.id, email: payload.email.trim().toLowerCase() };
    } catch (err) {
        console.error("Error verifying token:", err);
        return res.status(401).json({ status: 'error', message: 'Token verification failed', error: "auth-error", sequence: 2 });
    }

    // Now connect with database to fetch more user details
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

    // Fetch user details from database
    // User may exist in users or participants collection
    // There is no role field for participants, so we set it as 'participant' by default
    try {
        // Convert string ID to ObjectId if it's a valid ObjectId format
        const queryId = ObjectId.isValid(user.id) ? new ObjectId(user.id) : user.id;

        let userDetails = await db.collection('users').findOne({ 
            _id: queryId, 
            email: user.email 
        });

        if (userDetails) {
            user = {
                id: userDetails._id.toString(),
                email: userDetails.email,
                name: userDetails.name,
                chapter_id: userDetails.chapter_id,
                role: userDetails.role
            };
        } else {
            // Check in participants collection
            userDetails = await db.collection('participants').findOne({ 
                _id: queryId, 
                email: user.email 
            });

            if (userDetails) {
                user = {
                    id: userDetails._id.toString(),
                    email: userDetails.email,
                    name: userDetails.name,
                    chapter_id: userDetails.chapter_id,
                    role: 'participant'
                };
            } else {
                return res.status(404).json({ status: "error", message: "User not found", type: "no-user" });
            }
        }

    } catch (error) {
        console.error("Error fetching user details from database:", error);
        return res.status(500).json({ status: "error", message: "Error fetching user details" });
    }

    return res.status(200).json({ status: "success", user: user, message: "User details fetched successfully" });
}

export default me;