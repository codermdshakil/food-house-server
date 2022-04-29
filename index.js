const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();




// middlewares 
app.use(cors());
app.use(express.json());



app.get('/', async(req, res) => {
    res.send('yah! my server is running');
})


app.listen(port, () => {
    console.log('Listening to port', port)
})
