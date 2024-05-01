const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Import the cors package

const app = express();
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const fileSchema = new mongoose.Schema({
  name: String,
  path: String,
  type: String,
});

const File = mongoose.model('File', fileSchema);

app.use(cors()); // Enable CORS for all routes

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path, mimetype } = req.file;
    const file = new File({
      name: originalname,
      path: path,
      type: mimetype,
    });
    await file.save();
    res.send('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Failed to upload file');
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Failed to fetch files');
  }
});
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
