// const bcrypt = require('bcrypt');
// const { getUserByEmail } = require('./dataAccess');

// async function verifyUser(email, password) {
//     const user = await getUserByEmail(email);
//     if (!user) {
//         return { valid: false, message: 'User not found' };
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (match) {
//         return { valid: true, message: 'Valid credentials' };
//     } else {
//         return { valid: false, message: 'Invalid credentials' };
//     }
// }

// module.exports = { verifyUser };

// businessLogic.js
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./dataAccess');

async function loginUser(email, password) {
    try {
        const userData = await getUserByEmail(email);
        if (!userData) {
            return { success: false, message: 'Invalid credentials' };
        }

        const hashedPassword = userData.password;
        const usertype = userData.usertype;

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashedPassword, function(err, result) {
                if (err) {
                    reject('An error occurred while comparing passwords.');
                }
                if (result) {
                    // Redirect based on user type
                    let redirectUrl = usertype === 'officer' || usertype === 'member' ? '/society' : '/';
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

module.exports = { loginUser };
