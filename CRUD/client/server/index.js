const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/contractDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Contract Schema
const contractSchema = new mongoose.Schema({
  clientName: String,
  startDate: Date,
  endDate: Date,
  contractValue: Number,
  deliveryManager: String,
  attachment: String // stores file path here
});

const Contract = mongoose.model('Contract', contractSchema);

// Routes
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/contracts', upload.single('attachment'), async (req, res) => {
  try {
    const contractData = {
      ...req.body,
      attachment: req.file ? `/uploads/${req.file.filename}` : ''
    };
    const contract = new Contract(contractData);
    const savedContract = await contract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/contracts/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (contract && contract.attachment) {
      const filePath = path.join(__dirname, contract.attachment);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/contracts/:id', upload.single('attachment'), async (req, res) => {
  try {
    const contractData = {
      ...req.body
    };
    if (req.file) {
      contractData.attachment = `/uploads/${req.file.filename}`;
      // Delete old file if exists
      const oldContract = await Contract.findById(req.params.id);
      if (oldContract && oldContract.attachment) {
        const filePath = path.join(__dirname, oldContract.attachment);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      contractData,
      { new: true }
    );
    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});