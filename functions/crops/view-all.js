import connectDB from "../../utils/DB.js";

async function getAllCrops(req, res) {
    try {
        const user = req?.user;
        console.log("Fetching all crops for user:", user);

        // Connect to db
        console.log("Attempting to connect to database...");
        const db = await connectDB();

        if (!db) {
            console.error("Database connection returned null/undefined");
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }


        // Fetch crops from the database
        console.log("Fetching crops from 'crops' collection...");
        const crops = await db.collection('crops').find().toArray();
        console.log(`Successfully fetched ${crops.length} crops`);

        return res.status(200).json({ status: "success", data: crops, length: crops.length });

    } catch (err) {
        console.error("Error in getAllCrops:");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch crops",
            error: err.message,
            errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}

export default getAllCrops;