//==== Global error handler middleware ====//

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let status = 500;
    let message = 'Serverfejl';

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        status = 403;
        message = 'Ugyldig token';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Token er udløbet';
    }

    res.status(status).send({ message });
};