const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
// This code connects to a MongoDB database using Mongoose. It exports a function that attempts to connect to the database using the URI stored in the environment variable MONGO_URI. If the connection is successful, it logs the host of the connected database. If there is an error, it logs the error message and exits the process with a failure code.
