const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dataAccess');
const { loginUser } = require('./businessLogic');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/society', function(request, response) {
    response.render('society');
});

app.get('/', function(request, response) {
    response.render('login'); // Render 'login.ejs' from the views folder
});

app.post('/', async function(request, response) {
    const { email, password } = request.body;

    try {
        const loginResult = await loginUser(email, password);
        response.json(loginResult);
    } catch (error) {
        console.error("Login error:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

connectToDatabase().then(() => {
    app.listen(2000, () => {
        console.log('Server is running on http://localhost:2000/');
    });
}).catch(error => {
    console.error("Database connection error:", error);
});
