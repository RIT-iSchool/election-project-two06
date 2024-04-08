// const bcrypt = require('bcrypt');
// const express = require('express');
// const { Client } = require('pg');

// const app = express();
// app.use(express.urlencoded());

// const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "student",
//     database: "voting"
// });

// client.connect();

// // HTML, CSS, and JavaScript for the login page
// app.get('/', function(request, response, next) {
//     response.send(`
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Login Page</title>
//             <style>
//             body {
//                 font-family: 'Arial', sans-serif;
//                 background-color: #f4f4f4;
//                 margin: 0;
//                 padding: 0;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: center;
//                 align-items: center;
//                 height: 100vh;
//             }

//             h1 {
//                 text-align: center;
//                 color: #333;
//                 margin-top: 0;
//             }

//             form {
//                 max-width: 300px;
//                 margin: 20px auto;
//                 padding: 20px;
//                 background-color: #fff;
//                 border-radius: 8px;
//                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             }

//             label {
//                 display: block;
//                 margin-bottom: 12px;
//                 color: #555;
//             }

//             input {
//                 width: 100%;
//                 padding: 10px;
//                 margin-bottom: 20px;
//                 box-sizing: border-box;
//                 border: 1px solid #ccc;
//                 border-radius: 4px;
//             }

//             button {
//                 background-color: #4caf50;
//                 color: white;
//                 padding: 12px 18px;
//                 border: none;
//                 border-radius: 4px;
//                 cursor: pointer;
//             }

//             button:hover {
//                 background-color: #45a049;
//             }                                   
                
//             </style>
//             <script>
//                 function loginUser() {
//                     var email = document.getElementById('email').value;
//                     var password = document.getElementById('password').value;

//                     var xhr = new XMLHttpRequest();
//                     xhr.open('POST', '/', true);
//                     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//                     xhr.onreadystatechange = function() {
//                         if (xhr.readyState === 4 && xhr.status === 200) {
//                             var response = JSON.parse(xhr.responseText);
//                             console.log(response);
//                             alert(response.message); // Display message from server
//                         }
//                     };
//                     xhr.send('email=' + email + '&password=' + password);
//                 }

//                 function togglePasswordVisibility() {
//                     var passwordInput = document.getElementById('password');
//                     var checkbox = document.getElementById('showPassword');
//                     passwordInput.type = checkbox.checked ? 'text' : 'password';
//                 }
//             </script>
//         </head>
//         <body>
//             <h1>Login Page</h1>
//             <form>
//                 <label for="email">Email:</label>
//                 <input type="email" id="email" name="email" required>
//                 <br>
//                 <label for="password">Password:</label>
//                 <input type="password" id="password" name="password" required>
//                 <input type="checkbox" id="showPassword" onchange="togglePasswordVisibility()">
//                 <label for="showPassword">Show Password</label>
//                 <br>
//                 <button type="button" onclick="loginUser()">Login</button>
//             </form>
//         </body>
//         </html>
//     `);
// });

// // POST endpoint to handle login
// app.post('/', async function(request, response, next) {
//     const { email, password } = request.body;

//     try {
//         // Retrieve hashed password from the database using the email
//         const result = await client.query('SELECT "User_Password" FROM public."Users" WHERE "Email" = $1', [email]);

//         if (result.rows.length === 0) {
//             // User not found
//             response.json({ message: 'Invalid credentials' });
//             return;
//         }

//         const hashedPassword = result.rows[0].User_Password;

//         // Compare hashed password with plaintextPassword using bcrypt
//         bcrypt.compare(password, hashedPassword, function(err, result) {
//             if (result) {
//                 // Passwords match, login successful
//                 response.json({ message: 'Valid credentials' });
//             } else {
//                 // Passwords don't match
//                 response.json({ message: 'Invalid credentials' });
//             }
//         });
//     } catch (err) {
//         // Handle database error
//         console.error("Error retrieving user:", err);
//         response.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.listen(2000, () => {
//     console.log('Server is running on http://localhost:2000/');
// });

const bcrypt = require('bcrypt');
const express = require('express');
const { Client } = require('pg');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "student",
    database: "voting"
});

client.connect();

// Serve static files directly from the current directory
app.use(express.static(__dirname));

// Serve society.html on a specific route
app.get('/society', function(request, response) {
    response.sendFile(path.join(__dirname, 'society.html'));
});

// HTML, CSS, and JavaScript for the login page
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

// POST endpoint to handle login
app.post('/', async function(request, response) {
    const { email, password } = request.body;

    try {
        const result = await client.query('SELECT "User_Password", "UserType" FROM public."Users" WHERE "Email" = $1', [email]);
        if (result.rows.length === 0) {
            response.json({ message: 'Invalid credentials' });
            return;
        }
        const userData = result.rows[0];
        const hashedPassword = userData.User_Password;
        const userType = userData.UserType;
        bcrypt.compare(password, hashedPassword, function(err, result) {
            if (err) {
                response.status(500).json({ message: 'An error occurred while comparing passwords.' });
                return;
            }
            if (result) {
                // Redirect based on user type
                let redirectUrl = userType === 'Society_Officer' || userType === 'Society_Member' ? '/society' : '/';
                response.json({ message: 'Login successful', redirectUrl: redirectUrl });
            } else {
                response.json({ message: 'Invalid credentials' });
            }
        });
    } catch (err) {
        console.error("Error retrieving user:", err);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(2000, () => {
    console.log('Server is running on http://localhost:2000/');
});