const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const objectId = require('mongodb').ObjectId;


// middlewares 
app.use(cors());
app.use(express.json());


function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            res.status(403, ({ message: 'Forbidden access' }))
        }
        req.decoded = decoded;
        console.log('decoded', decoded);
        next();
    })

}


async function main() {

    const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.aknpz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    try {

        await client.connect();
        const productCollection = await client.db('storedProducts').collection('products');
        const newsCollection = await client.db('allNews').collection('news');
        const clientCollection = await client.db('allClients').collection('clients')

        // user token 
        app.post('/gettoken', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ token });
        })

        // get products 
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray()
            res.send(products);
        })

        // get one product 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        // decremnet quantity number 
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const newQuantity = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: newQuantity.result
                }
            };

            const result = await productCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })

        // increment quantity number 
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updated = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updated.inputValue
                }
            };
            const result = await productCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })

        // items delete method 
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // use post method create a item 
        app.post('/products', async (req, res) => {
            const item = req.body;
            const addeditem = await productCollection.insertOne(item);
            res.send(addeditem);
        })

        // get login user items 
        app.get('/myitems', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const myItems = await cursor.toArray()
                res.send(myItems);
            }
            else {
                res.status(403).send({ message: "forbidden access" })
            }

        })

        // delete my item
        app.delete('/myitem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // news data get 
        app.get('/news', async (req, res) => {
            const query = {};
            const cursor = newsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // clients data get 
        app.get('/clients', async (req, res) => {
            const query = {};
            const cursor = clientCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
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
