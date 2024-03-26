const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.urlencoded());

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "student",
    database: "postgres"
});

client.connect();

// HTML, CSS, and JavaScript for the login page
app.get('/', function(request, response, next) {
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
                margin-top: 0;
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

            input {
                width: 100%;
                padding: 10px;
                margin-bottom: 20px;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 4px;
            }

            button {
                background-color: #4caf50;
                color: white;
                padding: 12px 18px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            button:hover {
                background-color: #45a049;
            }                                   
                
            </style>
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
                            console.log(response);
                            alert(response.message); // Display message from server
                        }
                    };
                    xhr.send('email=' + email + '&password=' + password);
                }

                function togglePasswordVisibility() {
                    var passwordInput = document.getElementById('password');
                    var checkbox = document.getElementById('showPassword');
                    passwordInput.type = checkbox.checked ? 'text' : 'password';
                }
            </script>
        </head>
        <body>
            <h1>Login Page</h1>
            <form>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <input type="checkbox" id="showPassword" onchange="togglePasswordVisibility()">
                <label for="showPassword">Show Password</label>
                <br>
                <button type="button" onclick="loginUser()">Login</button>
            </form>
        </body>
        </html>
    `);
});

// POST endpoint to handle login
app.post('/', function(request, response, next) {
    const { email, password } = request.body; // Assuming the keys are 'email' and 'password' in the request body

    client.query('SELECT * FROM public."users" WHERE "email" = $1 AND "password" = $2', [email, password], (err, res) => {
        if (!err) {
            if (res.rows.length > 0) {
                // User found, respond with valid credentials
                response.json({ message: 'Valid credentials' });
            } else {
                // User not found or incorrect credentials
                response.json({ message: 'Invalid credentials' });
            }
        } else {
            console.log(err.message);
            response.status(500).json({ error: 'Internal Server Error' });
        }
    });
});


app.listen(2000, () => {
    console.log('Server is running on http://localhost:2000/');
});
