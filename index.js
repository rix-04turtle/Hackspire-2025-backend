import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express'; // import express framework
import getAllCrops from "./functions/crops/view-all.js";
import getAllUsers from "./functions/getAllUsers.js";
import updateCropForAState from "./functions/indian-states/update-crops.js";
import { signup, login } from "./functions/users/auth.js";
import addNewCrop from './functions/crops/create-new.js';
import getAllIndianStates from './functions/indian-states/view-all.js';
import updateAStateName from './functions/indian-states/update-name.js';
import getStateFromCoordinates from './functions/apis/getState.js';
import getCropsForAState from './functions/indian-states/get-crops.js';
import elevenLabsTextToSpeech from './functions/apis/elevenlabs-tts.js';
import jwtVerify from './middlewares/JWT.js';
import sendLoginOtp from './functions/auth/send-otp.js';
import verifyOtp from './functions/auth/verify-otp.js';
import me from './functions/auth/me.js';

dotenv.config(); // Load environment variables from .env file

const app = express()
const port = process.env.PORT || 4000
// For parsing application/js
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Enable Cors for all routes
app.use(cors());

app.get('/', (req, res) => {
  res.send('Sap da is Cool!')
})

// Public routes
app.get('/users', getAllUsers);

// Authentication Routes (Public)
app.post('/api/auth/send-otp', sendLoginOtp);
app.post('/api/auth/verify-otp', verifyOtp);
app.get('/api/auth/me', me); // Can also add jwtVerify middleware if you want it protected

// User Authentication (Legacy - if still needed)
app.post('/api/users/signup', signup);
app.post('/api/users/login', login);

// Protected Crops Routes (require authentication)
app.get('/crops/get-all', getAllCrops);
app.post('/crops/create-new', addNewCrop);

// Protected Indian States Routes
app.get('/indian-states/get-all', jwtVerify, getAllIndianStates);
app.post('/indian-states/update-name', jwtVerify, updateAStateName);
app.post('/indian-states/update-crops', jwtVerify, updateCropForAState);
app.post('/indian-states/get-crops', jwtVerify, getCropsForAState);

// Protected API Routes
app.post('/apis/get-state-from-coordinates', jwtVerify, getStateFromCoordinates);

// Text to Speech
app.post('/apis/text-to-speech', jwtVerify, elevenLabsTextToSpeech);

app.listen(port, () => {
  console.clear();
  console.log(`Example app listening http://localhost:${port}`)
})
