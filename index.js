const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const {ObjectId}= require('mongodb')
const cors = require('cors');

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017';
const dbName = 'userDB';
const collectionName = 'delayData';
app.use(cors()); //cors() middleware
app.use(bodyParser.json()); //parse the JSON

//show all delayes at /delayData
app.post('/delayData', async (req, res) => {
  try {
    const {
      year,
      month,
      carrier,
      carrier_name,
      airport,
      airport_name,
      arr_flights,
      arr_del15,
      carrier_ct,
      weather_ct,
      nas_ct,
      security_ct,
      late_aircraft_ct,
      arr_cancelled,
      arr_diverted,
      arr_delay,
      carrier_delay,
      weather_delay,
      nas_delay,
      security_delay,
      late_aircraft_delay
    } = req.body;

    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    //new dalay info
    const newData = {
      year,
      month,
      carrier,
      carrier_name,
      airport,
      airport_name,
      arr_flights,
      arr_del15,
      carrier_ct,
      weather_ct,
      nas_ct,
      security_ct,
      late_aircraft_ct,
      arr_cancelled,
      arr_diverted,
      arr_delay,
      carrier_delay,
      weather_delay,
      nas_delay,
      security_delay,
      late_aircraft_delay
    };
    //add new delay to collection
    const result = await collection.insertOne(newData);

    if (!result) {
      console.error('Error inserting data:', result);
      return res.status(500).json({ message: 'Error inserting data' });
    }

    client.close();

    res.status(201).json({message:'object inserted successfully'});
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ message: error.message });
  }
});

//get all delayData records
app.get('/delayData', async (req, res) => {
  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const allData = await collection.find().limit(50).toArray();

    client.close();

    res.json(allData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//filter delayData records by carrier and airport
app.get('/delayData/filter', async (req, res) => {
  try {
    const { carrier, airport } = req.query;
    console.log(carrier,airport)
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const filter = {};
    if (carrier) {
      filter.carrier = carrier;
    }
    if (airport) {
      filter.airport = airport;
    }

    const filteredData = await collection.find(filter).limit(50).toArray();

    client.close();

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete a record
app.delete('/delayData/:id', async (req, res) => {
  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });

    client.close();

    if (!result.value) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

