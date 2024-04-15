const express = require('express');
const { verifyUser } = require('./businessLogic');

const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', './views');

// Serve the login page using EJS
app.get('/', function(request, response, next) {
    response.render('login');
});

// POST endpoint to handle login
app.post('/', async function(request, response, next) {
    const { email, password } = request.body;

    try {
        const result = await verifyUser(email, password);
        response.json({ message: result.message });
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(2000, () => {
    console.log('Server is running on http://localhost:2000/');
});