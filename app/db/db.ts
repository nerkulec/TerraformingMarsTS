import mongoose from 'mongoose'

const dburl = process.env.MONGODB_URI || 'mongodb://localhost:27017/TerraformingMarsDB'

mongoose
    .connect(dburl, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('Connected to database'))
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    });

const db = mongoose.connection
export default db
