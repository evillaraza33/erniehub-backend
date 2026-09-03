require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ✅ Import Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

// ✅ Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Mount Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Social App API running on port ${PORT}`));