const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./dataAccess');

async function verifyUser(email, password) {
    const user = await getUserByEmail(email);
    if (!user) {
        return { valid: false, message: 'User not found' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        return { valid: true, message: 'Valid credentials' };
    } else {
        return { valid: false, message: 'Invalid credentials' };
    }
}

module.exports = { verifyUser };