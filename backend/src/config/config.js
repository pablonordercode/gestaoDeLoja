require("dotenv").config();

const config = {
    // Servidor
    port: process.env.PORT || 7001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Banco de dados
    db: {
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        cluster: process.env.DB_CLUSTER || 'cluster0.v21wi.mongodb.net',
        name: process.env.DB_NAME || 'crud2025',
        getUri() {
            return `mongodb+srv://${this.user}:${this.password}@${this.cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
        }
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    // Bcrypt
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
    },
    
    // Upload
    upload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        allowedFormats: ['png', 'jpg', 'jpeg'],
        uploadDir: 'uploads/'
    },
    
    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    
    // Paginação padrão
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100
    }
};

module.exports = config;

