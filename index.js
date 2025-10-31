import getAllUsers from "./functions/getAllUsers.js";
import dotenv from 'dotenv';
import express from 'express';  // import express framework
import getAllCrops from "./functions/crops/view-all.js";
import getAllIndianStates from "./functions/indian-states/view-all.js";
import updateAStateName from "./functions/indian-states/update-name.js";
import updateCropForAState from "./functions/indian-states/update-crops.js";

dotenv.config(); // Load environment variables from .env file

const app = express()
const port = process.env.PORT || 4000
// For parsing application/js
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Sap da is Cool!')
})

app.get('/users', getAllUsers);

// Crops
app.get('/crops/get-all', getAllCrops);

// Indian States
app.get('/indian-states/get-all', getAllIndianStates);
app.post('/indian-states/update-name', updateAStateName);
app.post('/indian-states/update-crops', updateCropForAState);

app.listen(port, () => {
  console.clear();
  console.log(`Example app listening http://localhost:${port}`)
})
