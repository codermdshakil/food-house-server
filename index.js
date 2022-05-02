const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


// middlewares 
app.use(cors());
app.use(express.json());


async function main() {

    const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.aknpz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    try {

        await client.connect();
        const productCollection = await client.db('storedProducts').collection('products');

        // get products 
        app.get('/products', async(req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray()
            res.send(products);
        })

        

    }
    catch (e) {
        console.log(e)
    }
    finally {

        // await client.close() 
   
    }
}
main().catch(console.error);





app.get('/', async (req, res) => {
    res.send('yah!  my food house server is running');
})


app.listen(port, () => {
    console.log('Listening to port', port)
})
