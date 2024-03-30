const express = require('express')
const app = express()
app.get('/', (req, res) => {
    res.send('Nissin boko waynot, bahog bilat')
})
app.listen(process.env.PORT || 3000)
