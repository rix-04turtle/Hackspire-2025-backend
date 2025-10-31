import dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // A default voice ID, e.g., "Rachel"

const elevenLabsTextToSpeech = async (req, res) => {
    const { text } = req.body;

    if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key not configured on the server.' });
    }

    if (!text) {
        return res.status(400).json({ error: 'Text is required.' });
    }

    const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;

    try {
        const response = await fetch(elevenLabsApiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('ElevenLabs API Error:', errorData);
            return res.status(response.status).json({ error: 'Failed to generate speech from ElevenLabs.', details: errorData });
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        response.body.pipe(res);

    } catch (error) {
        console.error('Error calling ElevenLabs API:', error);
        res.status(500).json({ error: 'Internal server error while processing text-to-speech.' });
    }
};

export default elevenLabsTextToSpeech;
