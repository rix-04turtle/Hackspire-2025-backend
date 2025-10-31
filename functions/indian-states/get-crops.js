import connectDB from '../../utils/DB.js'; // Adjust path as needed

async function getCropsForAState(req, res) {
    try {
        const { stateName } = req.body;

        if (!stateName) {
            return res.status(400).json({ error: 'State name is required' });
        }

        // Connect to the Database
        console.log("Attempting to connect to database...");
        const db = await connectDB();
        if (!db) {
            console.error("Database connection returned null/undefined");
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        // Fetch the state from database
        const state = await db.collection('indian_states')
            .findOne({ name: stateName });

        if (!state) {
            return res.status(404).json({ error: 'State not found' });
        }
       

        return res.status(200).json({
            state: state.name,
            crops: state.crops || []
        });

    } catch (error) {
        console.error('Error fetching crops:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default getCropsForAState;