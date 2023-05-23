const { MongoClient } = require('mongodb');

const state = {
  db: null
};

module.exports.connect = function() {
  const uri = 'mongodb+srv://mnihalcy:vKaTfgWPmMhHSVTA@paintclustor1.8yqlast.mongodb.net/?retryWrites=true&w=majority';
  const dbName = 'Paint';

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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
