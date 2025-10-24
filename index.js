const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Sap da is Cool!')
})

app.listen(port, () => {
  console.log(`Example app listening http://localhost:${port}`)
})
