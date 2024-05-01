const bcrypt = require('bcrypt');
const { getUserByEmail, getUsersByElection, getVotedUsersByElection } = require('./dataAccess');

async function loginUser(email, password) {
    try {
        const userData = await getUserByEmail(email);
        if (!userData) {
            return { success: false, message: 'Invalid credentials' };
        }

        const hashedPassword = userData.password;
        const userType = userData.usertype;

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashedPassword, function(err, result) {
                if (err) {
                    reject('An error occurred while comparing passwords.');
                }
                if (result) {
                    // Redirect based on user type
                    let redirectUrl;
                    if (userType === 'admin') {
                        redirectUrl = '/admin_page'; // Redirect admin to admin_page
                    } else if (userType === 'officer' || userType === 'member') {
                        redirectUrl = '/welcome'; // Redirect officer or member to society page
                    } else if (userType === 'employee'){
                        redirectUrl = '/soc_assigned'; // Redirect other user types to default page
                    }
                    resolve({ success: true, message: 'Login successful', redirectUrl: redirectUrl });
                } else {
                    resolve({ success: false, message: 'Invalid credentials' });
                }
            });
        });
    } catch (error) {
        throw error;
    }
}
// Business logic function to count votes
async function countVotes(societyName, electionName) {
    try {
        // Fetch all users associated with the election
        const allUsers = await getUsersByElection(societyName);
        
        // Fetch users who have voted in the election
        const votedUsers = await getVotedUsersByElection(societyName, electionName);
        
        // Count the total number of votes and not voted members and officers
        const totalVotes = votedUsers.length;
        const notVotedUsers = allUsers.filter(user => !votedUsers.some(votedUser => votedUser.userid === user.userid));

        const notVotedMembers = notVotedUsers.filter(user => user.usertype === 'member').length;
        const notVotedOfficers = notVotedUsers.filter(user => user.usertype === 'officer').length;
        const perc = (totalVotes/allUsers.length)*100;

        // Return the counts
        return perc;
    } catch (error) {
        console.error("Error counting votes:", error);
        throw error;
    }
}

module.exports = { loginUser, countVotes };
