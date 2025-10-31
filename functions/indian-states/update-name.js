import { connectDB } from "../../utils/DB.js";
import { ObjectId } from "mongodb";

async function updateAStateName(req, res) {
    try {
        const user = req?.user;
        console.log("Fetching all Indian states for user:", user);

        // Get the state ID and name from request body
        const { stateId, name } = req.body;
        console.log(`Updating name for state ID: ${stateId} with name: ${name}`);

        // Check if stateId and name are provided
        if (!stateId || !name) {
            console.error("Invalid input: stateId or name missing/invalid");
            return res.status(400).json({ status: "error", message: "Invalid input: stateId and name are required" });
        }

        // Connect to db
        console.log("Attempting to connect to database...");
        const db = await connectDB();
        if (!db) {
            console.error("Database connection returned null/undefined");
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        // Check if the state exists
        const state = await db.collection('indian_states').findOne({ _id: new ObjectId(stateId) });
        if (!state) {
            console.error(`State with ID ${stateId} not found`);
            return res.status(404).json({ status: "error", message: "State not found" });
        }

        // Update the state name
        const updateResult = await db.collection('indian_states').updateOne(
            { _id: new ObjectId(stateId) },
            { $set: { name: name } }
        );
        console.log(`Update result:`, updateResult);

        // IMPORTANT: Refined logic for handling updateResult
        if (updateResult.matchedCount === 0) {
            // This case should ideally be caught by the earlier findOne check,
            // but it's good for robustness if the document was deleted concurrently.
            console.error(`State with ID ${stateId} not found for update.`);
            return res.status(404).json({ status: "error", message: "State not found for update." });
        }

        return res.status(200).json({ status: "success", message: "State name updated successfully" });

    } catch (err) {
        console.error("Error in updateAStateName:");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        return res.status(500).json({
            status: "error",
            message: "Failed to update state name",
            error: err.message,
            errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

}

export default updateAStateName;

