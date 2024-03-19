const express = require('express');
const app = express();
var jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// middleware
// app.use(cors({
//   origin: ['http://localhost:5173/'],
//   credentials: true
// }));
// app.use(express.json());

 console.log(process.env.DB_PASS)
console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xq1u8gq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// const express = require('express');
// const cors = require('cors');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const port = process.env.PORT || 5000;

// const app = express();

// // middleware
// app.use(cors());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xq1u8gq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('zurichCarService').collection('services');
    const bookingCollection = client.db('zurichCarService').collection('bookings');

//auth related api
// app.post('/jwt', async(req, res) =>{
//   const user = req.body;
//   console.log('user for token', user);
//    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

//   res.cookie('token', token, {
//     httpOnly: true,
//     secure: false,
//     sameSite: 'none'
// })
//     .send({success: true});
// })


//services related api
// app.get("/services", async (req, res) => {
//   const result = await serviceCollection.find().toArray();
//   res.send(result);
//   console.log(result)
// });

    app.get('/services', async(req, res) =>{
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      console.log(result, 'my service data')
    })


     app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {               
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })


          // bookings 
          app.get('/bookings',  async (req, res) => {
            const  booking =  req.body;
            console.log('booking')
            
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        //bookings api
        app.post('/bookings', async(req, res) => {
          const booking = req.body;
          console.log(booking);
          const result = await bookingCollection.insertOne(booking);
          res.send(result);
        })


       app.patch('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedBooking = req.body;
        console.log(updatedBooking);
        const updateDoc = {
          $set: {
              status: updatedBooking.status
          },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
       })



        app.delete('/bookings/:id', async(req, res) =>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id)}
          const result = await bookingCollection.deleteOne(query);
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


app.get('/', (req, res) => {
  res.send('car service is running on port ')
})

app.listen(port, () => {
  console.log(`Zurich car services is sitting on port ${port}`);
})
