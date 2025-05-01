module.exports = (err, req, res, next) => {
    console.error('Global Error Handler:', err.message);

    // Customize the response based on the error
    res.status(err.status || 500).json({
        isSuccess: false,
        message: err.message || 'Internl Server Error',
        code: err.code || 'INTERNAL_SERVER_ERROR',
    });
};