const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const { getSocietyDetailsBySocietyName, getElectionsBySocietyId, connectToDatabase, createUser, getUserByEmail, getBallotNameBySocId, getUsersForAdmin, getBallotInitBySocietyId, getSocietyDetailsByUserId, getSocietiesForAdmin, getSocietyOfficesBySocId, getCandidatesForOffice, updateUser, getUserDetailsByUserId } = require('./dataAccess');
const { loginUser } = require('./businessLogic');

const { encryptPasswords } = require('./encrypt');
const { uploadImage } = require('./image');

// Create a function to perform setup tasks asynchronously
async function setup() {
    try {
        // Encrypt passwords
        await encryptPasswords();
        // Directory containing the images
        const imagesDir = path.join(__dirname, 'candidate_photos');
        // Automatically upload all images
        await new Promise((resolve, reject) => {
            fs.readdir(imagesDir, (err, files) => {
                if (err) {
                    reject('Failed to list images directory:' + err);
                }

                const promises = files.map(file => {
                    const candidateId = parseInt(file.split('.')[0], 10);
                    const imagePath = path.join(imagesDir, file);
                    return uploadImage(candidateId, imagePath);
                });

                Promise.all(promises)
                    .then(() => resolve())
                    .catch(error => reject(error));
            });
        });

        // Start the server after completing setup tasks
        startServer();
    } catch (error) {
        console.error('Setup error:', error);
    }
}

// Define a function to start the server
function startServer() {
    const app = express();

    //Parse JSON bodies
    app.use(bodyParser.json());

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

    // Function to parse PSV files
    function parsePsv(filename) {
        const data = fs.readFileSync(filename, 'utf8');
        const lines = data.trim().split('\n');
        const headers = lines[0].split('|');
        const records = lines.slice(1).map(line => {
            const fields = line.split('|');
            return headers.reduce((record, header, index) => {
                record[header.trim()] = fields[index].trim();
                return record;
            }, {});
        });
        return records;
    }

    const moment = require('moment');

    app.get('/soc_assigned/:name', async (req, res) => {
        try {
            const societyName = req.params.name;
            console.log("Requested Society Name:", societyName); // Debugging
            const societyDetails = await getSocietyDetailsBySocietyName(societyName);
            console.log("Society Details:", societyDetails); // Debugging
            const selectedSociety = societyDetails.societyname;
            console.log(selectedSociety)
            if (!selectedSociety) {
                console.log("Society not found!"); // Debugging
                return res.status(404).send('Society not found');
            }
    
            const associatedElections = await getElectionsBySocietyId(societyDetails.societyid);
            console.log(associatedElections)
            const today = moment();
            const pastElections = associatedElections.filter(election => moment(election.creationdate).isBefore(today));
            const presentElections = associatedElections.filter(election => moment(election.creationdate).isSameOrBefore(today));
            const futureElections = associatedElections.filter(election => moment(election.creationdate).isAfter(today));
   
            res.render('society', {
                societyName: selectedSociety,
                pastElections: pastElections,
                presentElections: presentElections,
                futureElections: futureElections
            });
        } catch (error) {
            console.error("Error fetching society data:", error);
            res.status(500).send('Internal Server Error');
        }
    });
    // app.get('/soc_assigned/:name', async (req, res) => {
    //     try {
    //         const societyName = req.params.name;
    //         const societyDetails = await getSocietyDetailsBySocietyName(societyName); // Function to retrieve society details by name
    //         console.log(societyDetails)
    //         if (!societyDetails) {
    //             return res.status(404).send('Society not found');
    //         }
    
    //         // Fetch elections associated with the society ID
    //         const elections = await getElectionsBySocietyId(societyDetails.societyid);
    //         console.log(elections)
    
    //         res.render('society', {
    //             societyName: societyName,
    //             elections: elections // Pass election data to the template
    //         });
    //     } catch (error) {
    //         console.error("Error fetching society data:", error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // });
    
    app.get('/welcome', isAuthenticated, async function(request, response) {
        const userId = request.session.userId;
        const socId = request.session.socId;
        const ballotName = await getBallotNameBySocId(socId);
        const societyDetails = await getSocietyDetailsByUserId(userId);

        response.render('welcome', { name: societyDetails.societyname, ballotName: ballotName });
    });

    // In your Express server setup

    app.get('/ballot_initiatives', isAuthenticated, async (req, res) => {
        try {
            const societyId = req.session.socId;
            const initDetails = await getBallotInitBySocietyId(societyId);
            // Render the 'ballot_initiatives.ejs' template with the fetched initiatives
            res.render('ballot_initiatives', { initiatives: initDetails });
        } catch (error) {
            console.error("Error fetching ballot initiatives:", error);
            res.status(500).send('Internal Server Error');
        }
    });
    app.get('/voting', isAuthenticated, async function(request, response) {
        try {
            const userId = request.session.userId;
            const socId = request.session.socId;
            // Get the society name based on the user's ID
            const societyDetails = await getSocietyDetailsByUserId(userId);
            // Get the office names associated with the user's society
            const offices = await getSocietyOfficesBySocId(socId);

            if (offices.length === 0) {
                // No valid ballots are found, so render a different page or pass a message
                response.render('noRunningBallots', { name: societyDetails.societyname }); // You need to create this EJS template
            } else {
                // Retrieve the candidates for each office
                const officeData = {};
                for (const office of offices) {
                    const candidates = await getCandidatesForOffice(socId, office);
                    officeData[office] = candidates;
                }
                // Render the 'voting.ejs' template with the society name and offices data
                response.render('voting', { name: societyDetails.societyname, officesData: officeData });
            }
        } catch (error) {
            console.error("Error on voting route:", error);
            response.status(500).send('Internal Server Error');
        }
    });

    app.get('/', function(request, response) {
        response.render('login'); // Render 'login.ejs' from the views folder
    });

    app.get('/soc_assigned', isAuthenticated, async function(request, response) {
        try {
            const userId = request.session.userId;
            // Get the society names based on the user's ID
            const societyDetails = await getSocietyDetailsByUserId(userId);
            // Render the 'soc_assigned.ejs' template with the society names
            response.render('soc_assigned', { societies: societyDetails });
        } catch (error) {
            console.error("Error on society route:", error);
            response.status(500).send('Internal Server Error');
        }
    });

    app.get('/soc_assigned/:name', (req, res) => {
        const societyName = req.params.name;
        res.render('society', { societyName: societyName });
    });
    app.get('/soc_assigned/:society/:election', (req, res) => {
        const societyName = req.params.society;
        const electionName = req.params.election;
        res.render('election', { society: societyName, election: electionName });
    });

    app.get('/admin_page', async function(request, response) {
        try {
            const userId = request.session.userId;
            // Get the society names based on the user's ID
            const societyNames = await getSocietiesForAdmin(userId);
            // Render the 'soc_assigned.ejs' template with the society names
            response.render('admin_page', { soc_names: societyNames });
        } catch (error) {
            console.error("Error on society route:", error);
            response.status(500).send('Internal Server Error');
        }
    });
    app.get('/admin_page/users', async function(request, response) {
        try {
            const userId = request.session.userId;
            // Get the society names based on the user's ID
            const userDetails = await getUsersForAdmin(userId);
            // Render the 'soc_assigned.ejs' template with the society names
            response.render('users', { users: userDetails });
        } catch (error) {
            console.error("Error on users route:", error);
            response.status(500).send('Internal Server Error');
        }
    });
    // Route for fetching user details via AJAX
    app.get('/admin_page/user_details/:id', async (req, res) => {
        try {
            const id = req.params.id;
            // Fetch user details from the database based on email
            const userDetails = await getUserDetailsByUserId(id);
            // Send JSON response with user details
            res.json(userDetails);
        } catch (error) {
            console.error("Error fetching user details:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    // Route for updating user details via AJAX
    app.post('/admin_page/update_user', async (req, res) => {
        try {
            const { userid, fname, lname, email, usertype } = req.body; // Assuming these are the fields being updated
            // Implement logic to update user details in the database
            await updateUser(userid, { fname, lname, email, usertype });
            res.status(200).json({ message: 'User details updated successfully' });
        } catch (error) {
            console.error("Error updating user details:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    // Route for creating user details via AJAX
    app.post('/admin_page/create_user', async (req, res) => {
        try {
            const { fname, lname, email, usertype, password } = req.body; // Assuming these are the fields being updated
            // Implement logic to create user details in the database
            await createUser( {fname, lname, email, usertype, password} );
            res.status(200).json({ message: 'User created successfully' });
        } catch (error) {
            console.error("Error updating user details:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    app.post('/', async function(request, response) {
        const { email, password } = request.body;

        try {
            const loginResult = await loginUser(email, password);
            const userData = await getUserByEmail(email);
            if (loginResult.success) {
                request.session.userId = userData.userid; // Set user ID in session
                const userId = request.session.userId;
                if (!userData.usertype == 'admin') {
                    const socDetails = await getSocietyDetailsByUserId(userId);
                    console.log(socDetails);
                    console.log(socDetails.societyid);
                    request.session.socId = socDetails.societyid;
                }
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
}
// Call the setup function to run setup tasks and start the server
setup();
