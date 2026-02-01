const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
          .then(() => console.log('Connected to MongoDB'))
          .catch((err) => console.error('MongoDB connection error:', err));

        // Routes
        app.use('/api/forms', require('./routes/forms'));

        // Health check
        app.get('/api/health', (req, res) => {
          res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
          console.error(err.stack);
          res.status(500).json({ message: 'Something went wrong!' });
        });

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
