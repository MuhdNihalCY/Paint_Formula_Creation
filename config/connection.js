const { MongoClient } = require('mongodb');

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Access the DATABASE_URL variable
const databaseURL = process.env.DATABASE_URL;

// Now you can use the databaseURL in your MongoDB connection code


const state = {
  db: null
};

//'mongodb+srv://mnihalcy:vKaTfgWPmMhHSVTA@paintclustor1.8yqlast.mongodb.net/?retryWrites=true&w=majority'
module.exports.connect = async function () {
  const uri = databaseURL;
  const dbName = 'Paint';

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // return client.connect()
  //   .then(() => {
  //     state.db = client.db(dbName);
  //     console.log('MongoDB connected!');
  //   })
  //   .catch((err) => {
  //     console.error('MongoDB connection error:', err);
  //     throw err;
  //   });

  try {
    await client.connect();
    state.db = client.db(dbName);
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports.get = function () {
  return state.db;
};
