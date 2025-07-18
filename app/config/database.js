const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const INIT_DATABASE = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            //   useNewUrlParser: true,
            //   useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully...');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

module.exports = INIT_DATABASE;