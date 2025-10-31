import { ObjectId } from "mongodb";
import { connectDB } from "../../utils/DB.js";

async function updateCropForAState(req, res) {
    try {
        const user = req?.user;
        console.log("Fetching all Indian states for user:", user);

        // Get the state ID and crop Ids from request body
        const { stateId, cropIds } = req.body;
        console.log(`Updating crops for state ID: ${stateId} with crop IDs: ${cropIds}`);

        // Chekc if stateId and cropIds are provided
        if (!stateId || !Array.isArray(cropIds)) {
            console.error("Invalid input: stateId or cropIds missing/invalid");
            return res.status(400).json({ status: "error", message: "Invalid input: stateId and cropIds are required" });
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

        // Convert the cropIds to ObjectId array
        const cropObjectIds = cropIds.map(id => new ObjectId(id));

        // Update the crops for the state
        const updateResult = await db.collection('indian_states').updateOne(
            { _id: new ObjectId(stateId) },
            { $set: { crops: cropObjectIds } }
        );
        console.log(`Update result:`, updateResult);

        // IMPORTANT: Refined logic for handling updateResult
        if (updateResult.matchedCount === 0) {
            // This case should ideally be caught by the earlier findOne check,
            // but it's good for robustness if the document was deleted concurrently.
            console.error(`State with ID ${stateId} not found for update.`);
            return res.status(404).json({ status: "error", message: "State not found for update." });
        }

        return res.status(200).json({ status: "success", message: "Crops updated successfully" });

    } catch (err) {
        console.error("Error in updateCropForAState:");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        return res.status(500).json({
            status: "error",
            message: "Failed to update crops",
            error: err.message,
            errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

}

export default updateCropForAState;