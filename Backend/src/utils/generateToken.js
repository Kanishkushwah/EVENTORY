import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role = 'user') => {
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
        expiresIn: '30d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

export default generateToken;
