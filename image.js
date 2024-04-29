const { Pool } = require('pg');
const fs = require('fs');

// Create a new pool instance to manage your PostgreSQL connections
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "sass",
    database: "postgres"
});

// Function to upload an image to the database
async function uploadImage(candidateId, imagePath) {
  try {
    const imgData = fs.readFileSync(imagePath);
    const query = 'UPDATE candidate SET photo = $1 WHERE candidateid = $2';
    const values = [imgData, candidateId];

    const client = await pool.connect();
    await client.query(query, values);
    client.release();
  } catch (err) {
    console.error('Error uploading image for candidate:', candidateId, err);
  }
}

module.exports = { uploadImage };