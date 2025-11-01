import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import connectDB from './DB.js';

async function jwtVerify(req, res, next) {

    const authHeader = req.header('Authorization') || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authorization header is missing or invalid', error: "auth-error" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token not found', error: "auth-error" });
    }

    let userPayload = {};
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload) {
            return res.status(401).json({ status: "error", message: 'Invalid token', error: "auth-error" });
        }

        // Check if payload contains necessary user info id & email
        if (!payload.id || !payload.email) {
            return res.status(401).json({ status: "error", message: 'Invalid token payload', error: "auth-error" });
        }

        userPayload = { id: payload.id, email: payload.email.trim().toLowerCase() };

    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Token verification failed', error: "auth-error" });
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
    try {
        // Convert string ID to ObjectId if it's a valid ObjectId format
        const queryId = ObjectId.isValid(userPayload.id) ? new ObjectId(userPayload.id) : userPayload.id;

        // First check in users collection with status = 'active'
        let userDetails = await db.collection('users').findOne({ 
            _id: queryId, 
            email: userPayload.email,
            status: 'active'
        });

        if (userDetails) {
            const user = {
                id: userDetails._id.toString(),
                email: userDetails.email,
                name: userDetails.name,
                chapter_id: userDetails.chapter_id,
                role: userDetails.role
            };

            // Set the full user object in the request
            req.user = user;
        } else {
            // Check in participants collection
            userDetails = await db.collection('participants').findOne({ 
                _id: queryId, 
                email: userPayload.email 
            });

            if (userDetails) {
                const user = {
                    id: userDetails._id.toString(),
                    email: userDetails.email,
                    name: userDetails.name,
                    chapter_id: userDetails.chapter_id,
                    role: 'participant'
                };

                // Set the full user object in the request
                req.user = user;
            } else {
                // User from token not found in the database
                return res.status(404).json({ status: "error", message: "User not found", type: "no-user" });
            }
        }

    } catch (error) {
        console.error("Error fetching user details from database:", error);
        return res.status(500).json({ status: "error", message: "Error fetching user details" });
    }

    // Proceed to the next middleware/handler
    next();
}

export default jwtVerify;