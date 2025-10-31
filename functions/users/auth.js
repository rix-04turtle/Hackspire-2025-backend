import { connectDB } from '../../utils/DB.js';

export async function signup(req, res) {
    try {
        const db = await connectDB();
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const result = await db.collection('users').insertOne({
            name,
            email,
            password, // In a real app, make sure to hash the password
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertedId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req, res) {
    try {
        const db = await connectDB();
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password (in a real app, compare hashed passwords)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create session token (in a real app, use JWT or other secure token method)
        const token = Buffer.from(user._id.toString()).toString('base64');

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}