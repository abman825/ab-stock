const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares Setup
app.use(cors());
// Express limit for Base64 photos & large JSON data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB በተካካ ሁኔታ ተገናኝቷል'))
  .catch((err) => console.error('❌ የ DB ስህተት:', err.message));

// 3. Centralized API Routes
const mainRoutes = require('./src/routes/mainRoutes');
app.use('/api', mainRoutes);

// 4. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ab Stock Server በ Port ${PORT} ላይ እየሰራ ይገኛል`));