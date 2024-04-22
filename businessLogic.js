// const bcrypt = require('bcrypt');
// const { getUserByEmail } = require('./dataAccess');

// async function loginUser(email, password) {
//     try {
//         const userData = await getUserByEmail(email);
//         if (!userData) {
//             return { success: false, message: 'Invalid credentials' };
//         }

//         const hashedPassword = userData.password;
//         const usertype = userData.usertype;

//         return new Promise((resolve, reject) => {
//             bcrypt.compare(password, hashedPassword, function(err, result) {
//                 if (err) {
//                     reject('An error occurred while comparing passwords.');
//                 }
//                 if (result) {
//                     // Redirect based on user type
//                     let redirectUrl = usertype === 'officer' || usertype === 'member' ? '/society' : '/';
//                     resolve({ success: true, message: 'Login successful', redirectUrl: redirectUrl });
//                 } else {
//                     resolve({ success: false, message: 'Invalid credentials' });
//                 }
//             });
//         });
//     } catch (error) {
//         throw error;
//     }
// }

// module.exports = { loginUser };

const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./dataAccess');

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
                        redirectUrl = '/society'; // Redirect officer or member to society page
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

module.exports = { loginUser };
