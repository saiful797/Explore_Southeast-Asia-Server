const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a3qxp45.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // for spot
    const tourismSpotCollection = client.db('tourismSpotDB').collection('tourismSpot');

    // for countries
    const countriesCollection = client.db('tourismSpotDB').collection('countries');

    //Get from spots DB
    app.get('/touristSpot', async(req, res) => {
        const cursor = tourismSpotCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/touristSpot/:userEmail', async(req, res) => {
        const allSpots = tourismSpotCollection.find();
        const result = await allSpots.toArray();
        res.send(result);
    })

    app.get('/singleSpot/:id', async(req, res)=>{
        const result = await tourismSpotCollection.findOne({_id: new ObjectId(req.params.id)})
        res.send(result)
        console.log(result);

    })

    // Update information spot
    app.put('/updateSpot/:id', async(req, res) =>{
        //console.log(req.params.id);
        const query = {_id: new ObjectId(req.params.id)};
        const options = { upsert: true };
        const data ={
            $set:{
                spot: req.body.spot,
                photo: req.body.photo,
                cost: req.body.cost,
                country: req.body.country,
                location: req.body.location,
                time: req.body.time,
                seasonality: req.body.seasonality,
                visitors: req.body.visitors,
                description: req.body.description
            }
        }

        const result = await tourismSpotCollection.updateOne(query, data, options);
        console.log(result);
        res.send(result);
    })

    //Get from country DB
    app.get('/addCountry', async(req, res) => {
        const allCountry = countriesCollection.find();
        const result = await allCountry.toArray();
        res.send(result);
    })

    // Post data in touristSpotDB
    app.post('/touristSpot', async(req, res) => {

        const newTouristSpot = req.body;
        const result = await tourismSpotCollection.insertOne(newTouristSpot);
        res.send(result);
    })

    app.post('/addCountry', async(req, res) => {
        const newCountry = req.body;
        const result = await countriesCollection.insertOne(newCountry);
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res) => {
    res.send('Explore Southeast Asia Server is running...');
})

app.listen(port, ()=>{
    console.log(`Explore Southeast Asia Server is running on port: ${port}`);
})