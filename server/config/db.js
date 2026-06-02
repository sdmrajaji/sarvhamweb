const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('⚠️ MongoDB connection error (database features disabled):', err.message);
    // Do not call process.exit(1) so the static Express hosting continues running perfectly
  }
};

module.exports = connectDB;
