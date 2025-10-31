async function getStateFromCoordinates(req, res) {
    try {
        const { latitude, longitude } = req.body;

        // Validate input
        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Latitude and longitude are required'
            });
        }

        // Get API key from environment variables
        const KEY = process.env.LOCATION_API_KEY;
        
        if (!KEY) {
            return res.status(500).json({
                error: 'API key not configured'
            });
        }

        // Call OpenCage API
        const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${KEY}&language=en`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Extract state information
        if (data.results && data.results.length > 0) {
            const components = data.results[0].components;
            const state = components.state || components.state_district || null;
            
            return res.status(200).json({
                success: true,
                state: state,
                country: components.country,
                fullData: data.results[0]
            });
        } else {
            return res.status(404).json({
                error: 'No results found for the provided coordinates'
            });
        }

    } catch (error) {
        console.error('Error in getStateFromCoordinates:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

export default getStateFromCoordinates;