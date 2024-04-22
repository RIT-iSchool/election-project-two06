const express = require('express');
const session = require('express-session');
const path = require('path');
const { connectToDatabase, getUserByEmail, getSocietyNameByUserId, getSocietyOfficesByUserId } = require('./dataAccess');
const { loginUser } = require('./businessLogic');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
    secret: 'your_secret_key', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/');
    }
}

app.get('/society', isAuthenticated, async function(request, response) {
    try {
        const userId = request.session.userId;
        // Get the society name based on the user's ID
        const societyname = await getSocietyNameByUserId(userId);
        // Get the office names associated with the user's society
        const offices = await getSocietyOfficesByUserId(userId);
        // Render the 'society.ejs' template with the society name
        response.render('society', { name: societyname, offices: offices });
    } catch (error) {
        console.error("Error retrieving society name:", error);
        response.status(500).send('Internal Server Error');
    }
});

app.get('/', function(request, response) {
    response.render('login'); // Render 'login.ejs' from the views folder
});

app.post('/', async function(request, response) {
    const { email, password } = request.body;

    try {
        const loginResult = await loginUser(email, password);
        const userData = await getUserByEmail(email);
        if (loginResult.success) {
            request.session.userId = userData.userid; // Set user ID in session
        }
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
