const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dataAccess');
const { loginUser } = require('./businessLogic');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/society', function(request, response) {
    response.sendFile(path.join(__dirname, 'html_files/society.html'));
});

app.get('/', function(request, response) {
    response.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Page</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                h1 {
                    text-align: center;
                    color: #333;
                }
                form {
                    max-width: 300px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                label {
                    display: block;
                    margin-bottom: 12px;
                    color: #555;
                }
                input[type="email"], input[type="password"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    width: 100%;
                    background-color: #4CAF50;
                    color: white;
                    padding: 14px 20px;
                    margin: 8px 0;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h1>Login Page</h1>
            <form id="loginForm">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="button" onclick="loginUser()">Login</button>
            </form>
            <script>
                function loginUser() {
                    var email = document.getElementById('email').value;
                    var password = document.getElementById('password').value;

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', '/', true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var response = JSON.parse(xhr.responseText);
                            if (response.redirectUrl) {
                                window.location.href = response.redirectUrl;
                            } else {
                                alert(response.message);
                            }
                        }
                    };
                    xhr.send('email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password));
                }
            </script>
        </body>
        </html>
    `);
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
