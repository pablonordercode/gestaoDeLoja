const app = require("./app");
const conectarDB = require("./db/condb");

require("dotenv").config();

const PORT = process.env.PORT || 7001;

// Função para iniciar o servidor
const startServer = async () => {
    try {
        // Conectar ao banco de dados
        await conectarDB();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`╔════════════════════════════════════════╗`);
            console.log(`║  🚀 Servidor rodando na porta ${PORT}   ║`);
            console.log(`║  📊 MongoDB conectado com sucesso      ║`);
            console.log(`║  🌐 Ambiente: ${process.env.NODE_ENV || 'development'}             ║`);
            console.log(`╚════════════════════════════════════════╝`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Iniciar o servidor
startServer();
