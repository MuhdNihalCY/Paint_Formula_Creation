const { MongoClient } = require('mongodb');

const state = {
  db: null
};

module.exports.connect = function() {
  const uri = 'mongodb://0.0.0.0:27017';
  const dbName = 'Paint';

  
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // console.log("Code Reached Here at connection.js")
  return client.connect()
  .then(() => {
    state.db = client.db(dbName);
      console.log('MongoDB connected!');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
};

module.exports.get = function() {
  return state.db;
};
