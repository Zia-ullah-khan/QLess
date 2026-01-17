import mongoose from 'mongoose';

// Health check endpoint
export const healthCheck = async (req, res) => {
    try {
        // Check database connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                status: dbStatus,
                name: mongoose.connection.name,
            },
            memory: process.memoryUsage(),
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
        });
    }
};

// Get API version
export const getVersion = (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'QLess Backend API',
        description: 'Scan, shop, and skip the checkout line',
        environment: process.env.NODE_ENV || 'development',
    });
};
