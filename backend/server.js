require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FocusNest backend is running!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
  }).then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
  
// Routes
app.use('/api/auth', authRoutes);

// connect Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
