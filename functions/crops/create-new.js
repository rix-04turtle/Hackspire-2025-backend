import connectDB from "../../utils/DB.js";

async function addNewCrop(req, res) {
    try {
        const user = req?.user;
        console.log("Adding new crop for user:", user);


        // Get Crop Name from request body
        let { cropName } = req.body;

        // Check if it is not empty or null
        if (!cropName || cropName.trim() === '') {
            return res.status(400).json({ status: "error", message: "Crop name is required" });
        }

        cropName = cropName.trim();

        // Connect to db
        console.log("Attempting to connect to database...");
        const db = await connectDB();

        if (!db) {
            console.error("Database connection returned null/undefined");
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        // add new crop entry in the MongoDB 'crops' collection`
        const result = await db.collection('crops').insertOne({ name: cropName });

        console.log("New crop added with ID:", result.insertedId);

        return res.status(200).json({ status: "success", data: result.insertedId, messsage: "New Crop Added" });

    } catch (err) {
        console.error("Error in addNewCrop:");
        console.log(err)

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch crops",
            error: err.message,
            errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}

export default addNewCrop;