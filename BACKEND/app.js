const express = require('express')
const app = express()
const port_no = 5555

app.get('/' , (req,res) => {
    res.send('N!')
})

app.listen(port_no, () => {
    console.log('port running atport number : 5555')
})