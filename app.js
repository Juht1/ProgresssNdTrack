// app.js

// Requiring express.js
const express = require('express')

// Changing the module to object to use its inbuilt functions
const app = express()

// Port number to run the port
const port_no = 5555

// Get request to send the data to the server
app.get('/' , (req,res) => {
    res.send('hey geeks!')
})

// Server Setup
app.listen(port_no, () => {
    console.log('port running atport number : 5555')
})