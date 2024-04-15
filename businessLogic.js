const bcrypt = require('bcrypt');
const { getUserByEmail, getUserRole } = require('./dataAccess');

async function verifyUser(email, password) {
    const user = await getUserByEmail(email);
    if (!user) {
        return { valid: false, message: 'User not found' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        // Retrieve user role
        const role = await getUserRole(email);

        // Determine redirection based on role
        let redirectUrl = '/';
        switch (role) {
            case 'member':
            case 'officer':
                redirectUrl = '/voting-page';
                break;
            case 'employee':
                redirectUrl = '/employee-page';
                break;
            case 'admin':
                redirectUrl = '/admin-page';
                break;
        }

        return { valid: true, message: 'Valid credentials', redirect: redirectUrl };
    } else {
        return { valid: false, message: 'Invalid credentials' };
    }
}

module.exports = { verifyUser };