const mongoose = require("mongoose");
const config = require("../config");

const conectarDataBase = async () => {
    try {
        const MONGO_URI = config.db.getUri();
        
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("✅ MongoDB conectado com sucesso!");
        
        // Event listeners para conexão
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro no MongoDB:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB desconectado');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconectado');
        });
        
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        throw error;
    }
};

module.exports = conectarDataBase;

