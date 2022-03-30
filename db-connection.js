//Require mongoose
const mongoose = require('mongoose');
const db = mongoose.connect(process.env.MONGO_URL);

module.exports = db;
