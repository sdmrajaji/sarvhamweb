const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      console.error('⚠️ MONGO_URI is not set. Database features disabled.');
      return;
    }

    // Ensure the database name 'sarvham' is specified in the URI.
    // Without it, Mongoose defaults to the 'test' database which causes
    // all collections to be created in the wrong database.
    try {
      const url = new URL(uri);
      // pathname is '/' when no DB name is given, or '/somedb' when specified
      if (!url.pathname || url.pathname === '/') {
        url.pathname = '/sarvham';
        uri = url.toString();
        console.log('ℹ️  No database name in MONGO_URI — defaulting to /sarvham');
      }
    } catch (parseErr) {
      // URL parsing failed for non-standard URIs — proceed with original URI
      console.warn('⚠️  Could not parse MONGO_URI to validate database name:', parseErr.message);
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} → DB: ${conn.connection.name}`);
  } catch (err) {
    console.error('⚠️ MongoDB connection error (database features disabled):', err.message);
    // Do not call process.exit(1) so the static Express hosting continues running
  }
};

module.exports = connectDB;
