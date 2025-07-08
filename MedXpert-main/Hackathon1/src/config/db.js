import mongoose from "mongoose";

const database = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(
      "mongodb+srv://harshnesari:2iKWlggObvJVlSDy@tinderbackend.m90xz.mongodb.net/minor_proj",
      options
    );

    console.log('Successfully connected to MongoDB database!');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default database;
