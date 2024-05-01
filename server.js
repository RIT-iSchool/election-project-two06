const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const { getSocietyDetailsBySocietyName, 
    saveBallotVote,
    getElectionsBySocietyId, 
    connectToDatabase, 
    getMembersPerSociety,
    getAverageMembersVotingPerElection,
    createUser, 
    getBallotsPerSociety,
    getUsersByElection,
    getUserByEmail, 
    getBallotDetailsBySocId, 
    getUsersForAdmin, 
    getBallotInitBySocietyId, 
    getSocietyDetailsByUserId, 
    getVotedUsersByElection,
    getSocietiesForAdmin, 
    getSocietyOfficesBySocId, 
    getCandidatesForOffice, 
    updateUser, 
    getUserDetailsByUserId,
    createVote,
    createWriteInVote,
} = require('./dataAccess');

const { loginUser, countVotes } = require('./businessLogic');

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

    const moment = require('moment');

    app.get('/soc_assigned/:name', isAuthenticated, async (req, res) => {
        try {
            const societyName = req.params.name;
            const societyDetails = await getSocietyDetailsBySocietyName(societyName);
    
            const associatedElections = await getElectionsBySocietyId(societyDetails.societyid);
            const today = moment();
            const pastElections = associatedElections.pastElections.filter(election => moment(election.startdate).isBefore(today));
            const presentElections = associatedElections.presentElections.filter(election => moment(election.startdate).isSameOrBefore(today));
            const futureElections = associatedElections.futureElections.filter(election => moment(election.startdate).isAfter(today));
            res.render('society', {
                societyDetails: societyDetails,
                pastElections: pastElections,
                presentElections: presentElections,
                futureElections: futureElections
            });
        } catch (error) {
            console.error("Error fetching society data:", error);
            res.status(500).send('Internal Server Error');
        }
    });
    
    // server.js

// Add a new route to handle the request for displaying users associated with the selected election
app.get('/soc_assigned/:society/:election/users', isAuthenticated, async (req, res) => {
    try {
        const societyName = req.params.society;
        const electionName = req.params.election;

        console.log("Fetching users for election:", electionName);

        // Fetch users associated with the selected election
        const users = await getUsersByElection(societyName, electionName);
        console.log("Users:", users);

        // Fetch users who have voted in the selected election
        const votedUsers = await getVotedUsersByElection(societyName, electionName);
        console.log("Voted Users:", votedUsers);

        // Render the 'election_users.ejs' template with the retrieved user data
        res.render('election', { users: users, votedUsers: votedUsers });
    } catch (error) {
        console.error("Error fetching users for election:", error);
        res.status(500).send('Internal Server Error');
    }
});


    app.get('/welcome', isAuthenticated, async function(request, response) {
        const userId = request.session.userId;
        const socId = request.session.socId;
        const ballotDetails = await getBallotDetailsBySocId(socId);
        const societyDetails = await getSocietyDetailsByUserId(userId);

        response.render('welcome', { name: societyDetails[0].societyname, ballotName: ballotDetails[0].ballotName });
    });

    app.get('/soc_assigned/socId=:id/ballot_info', isAuthenticated, async function(req, res) {
        const soc = req.params.id;
        res.render('combined_ballot', {socid: soc});
    });

//    app.post('/submit-ballot', isAuthenticated, async (req, res) => {
//        try {
            // Extract data from the request body
//            const { ballotName, startDate, endDate, offices } = req.body;
//            console.log(offices);
            // Process and save the data to the database
            // Example: Save ballot details, office details, candidate details, etc.
    
//            res.status(200).json({ message: 'Ballot submitted successfully' });
//        } catch (error) {
//            console.error("Error submitting ballot:", error);
//            res.status(500).json({ error: 'Internal Server Error' });
//        }
//    });
    
    app.get('/ballot_initiatives', isAuthenticated, async (req, res) => {
        try {
            const societyId = req.session.socId;
            const userId = req.session.userId; // Get user ID from session
            const initDetails = await getBallotInitBySocietyId(societyId, userId);
            res.render('ballot_initiatives', { initiatives: initDetails });
        } catch (error) {
            console.error("Error fetching ballot initiatives:", error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/submit-ballot-votes', isAuthenticated, async (req, res) => {
        const userId = req.session.userId;
        try {
            // Iterate through the initiatives
            Object.keys(req.body).forEach(async key => {
                if (key.startsWith('choice_')) {
                    const ballotInitId = key.split('_')[1];
                    const choice = req.body[key] === 'true';
                    const suggestion = req.body['suggestion'].trim();
    
                    // Call function to save vote
                    await saveBallotVote(ballotInitId, userId, choice, suggestion);
                }
            });
            res.redirect('/welcome'); // Redirect to a success page or back to the list
        } catch (error) {
            console.error("Error submitting ballot votes:", error);
            res.status(500).send('Internal Server Error');
        }
    });    
    app.get('/ballots-per-society', async (req, res) => {
        try {
            const ballotCounts = await getBallotsPerSociety();
            res.json(ballotCounts);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    app.get('/members-per-society', async (req, res) => {
        try {
            const memberCounts = await getMembersPerSociety();
            res.json(memberCounts);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    app.get('/average-members-voting-per-election', async (req, res) => {
        try {
            const averageVotingCounts = await getAverageMembersVotingPerElection();
            res.json(averageVotingCounts);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/voting', isAuthenticated, async function(request, response) {
        const userId = request.session.userId;
        const socId = request.session.socId;
    
        try {
            const ballotDetails = await getBallotDetailsBySocId(socId);
            const societyDetails = await getSocietyDetailsByUserId(userId);
            const officeDetails = await getSocietyOfficesBySocId(socId);
            const officesData = await Promise.all(officeDetails.map(async office => {
                const candidates = await getCandidatesForOffice(socId, office.officeId);
                return { ...office, candidates };
            }));
    
            // Pass BallotID to the template
            response.render('votes', {
                name: societyDetails[0].societyname,
                officesData: officesData,
                ballotId: ballotDetails[0].ballotId, 
                ballotName: ballotDetails[0].ballotName
            });
        } catch (error) {
            console.error("Error on voting route:", error);
            response.status(500).send('Internal Server Error');
        }
    });
    

    app.post('/submit-vote', isAuthenticated, async function(request, response) {
        const userId = request.session.userId;
        const { ballotId, formData } = request.body;
        
        console.log("User ID:", userId);
        console.log("Ballot ID:", ballotId);
        console.log("Form Data:", formData);
    
        try {
            for (const key in formData) {
                const value = formData[key];
    
                if (key.includes('_writein')) {
                    const officeId = key.split('_')[0];
                    const firstName = formData[key].first.trim();
                    const lastName = formData[key].last.trim();
    
                    if (firstName && lastName) { // Check that both names are not empty
                        await createWriteInVote(userId, firstName, lastName, officeId);
                    }
                } else if (value && value !== 'NO_VOTE' && key !== 'ballotId') {
                    // Check if there is a value and it's not a no-vote placeholder
                    await createVote(userId, ballotId, key, value);
                }
            }
            response.send('Vote submitted successfully!');
        } catch (error) {
            console.error("Error submitting vote:", error);
            response.status(500).send('Internal Server Error');
        }
    });
    
    

    app.get('/', function(request, response) {
        response.render('login'); // Render 'login.ejs' from the views folder
    });
 
    app.get('/soc_assigned/:society/:election', isAuthenticated, async (req, res) => {
        const societyName = req.params.society;
        const electionName = req.params.election;
        const usersElec = await getUsersByElection(societyName);
        const votedUsers = await getVotedUsersByElection(societyName, electionName);
        const perc = await countVotes(societyName, electionName);
        res.render('election_users', { users: usersElec, votedUsers: votedUsers, percentage: perc });
    });

    app.get('/admin_page', isAuthenticated, async function(request, response) {
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
    app.get('/admin_page/users', isAuthenticated, async function(request, response) {
        try {
            const userId = request.session.userId;
            // Get the society names based on the user's ID
            const societyNames = await getSocietiesForAdmin(userId);
            // Get the user details based on the user's ID
            const userDetails = await getUsersForAdmin(userId);
            // Render the 'soc_assigned.ejs' template with the society names
            response.render('users', { users: userDetails, societynames: societyNames });
        } catch (error) {
            console.error("Error on users route:", error);
            response.status(500).send('Internal Server Error');
        }
    });
    // Route for fetching user details via AJAX
    app.get('/admin_page/user_details/:id', isAuthenticated, async (req, res) => {
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
            const { fname, lname, email, usertype, password, society } = req.body; // Assuming these are the fields being updated
            // Implement logic to create user details in the database
            await createUser( {fname, lname, email, usertype, password, society} );
            // Encrypt the added user password
            await encryptPasswords();
            res.status(200).json({ message: 'User created successfully' });
        } catch (error) {
            console.error("Error updating user details:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
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

    app.get('/ballotinit/:socid', isAuthenticated, async function(request, response) {
        try {
            const userId = request.session.userId;
            const ballotinitDetails = await getBallotInitBySocietyId(societyId, userId);

            response.render('create_ballotinit', { users: userDetails, societynames: societyNames });
        } catch (error) {
            console.error("Error on users route:", error);
            response.status(500).send('Internal Server Error');
        }
    });

    // // Route for fetching ballot initiative details via AJAX
    // app.get('/ballotinit/:id', isAuthenticated, async (req, res) => {
    //     try {
    //         const id = req.params.id;
    //         // Fetch user details from the database based on email
    //         const userDetails = await getUserDetailsByUserId(id);
    //         // Send JSON response with user details
    //         res.json(userDetails);
    //     } catch (error) {
    //         console.error("Error fetching user details:", error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    // // Route for updating user details via AJAX
    // app.post('/admin_page/update_user', async (req, res) => {
    //     try {
    //         const { userid, fname, lname, email, usertype } = req.body; // Assuming these are the fields being updated
    //         // Implement logic to update user details in the database
    //         await updateUser(userid, { fname, lname, email, usertype });
    //         res.status(200).json({ message: 'User details updated successfully' });
    //     } catch (error) {
    //         console.error("Error updating user details:", error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    // // Route for creating user details via AJAX
    // app.post('/admin_page/create_user', async (req, res) => {
    //     try {
    //         const { fname, lname, email, usertype, password, society } = req.body; // Assuming these are the fields being updated
    //         // Implement logic to create user details in the database
    //         await createUser( {fname, lname, email, usertype, password, society} );
    //         // Encrypt the added user password
    //         await encryptPasswords();
    //         res.status(200).json({ message: 'User created successfully' });
    //     } catch (error) {
    //         console.error("Error updating user details:", error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    app.post('/', async function(request, response) {
        const { email, password } = request.body;

        try {
            const loginResult = await loginUser(email, password);
            const userData = await getUserByEmail(email);
            if (loginResult.success) {
                request.session.userId = userData.userid; // Set user ID in session
                const userId = request.session.userId;
                if (userData.usertype !== 'admin') {
                    const socDetails = await getSocietyDetailsByUserId(userId);
                    request.session.socId = socDetails[0].societyid;
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
