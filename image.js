const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new pool instance to manage your PostgreSQL connections
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "sass",
    database: "postgres"
});

// Directory containing the images
const imagesDir = path.join(__dirname, 'candidate_photos');

// Function to upload an image to the database
async function uploadImage(candidateId, imagePath) {
  try {
    const imgData = fs.readFileSync(imagePath);
    const query = 'UPDATE candidate SET photo = $1 WHERE candidateid = $2';
    const values = [imgData, candidateId];

    const client = await pool.connect();
    await client.query(query, values);
    client.release();
    console.log('Image uploaded successfully for candidate:', candidateId);
  } catch (err) {
    console.error('Error uploading image for candidate:', candidateId, err);
  }
}

// Automatically upload all images
fs.readdir(imagesDir, (err, files) => {
  if (err) {
    return console.error('Failed to list images directory:', err);
  }

  files.forEach(file => {
    const candidateId = parseInt(file.split('.')[0], 10); // Assumes filename is like '123.jpg'
    const imagePath = path.join(imagesDir, file);
    uploadImage(candidateId, imagePath);
  });
});