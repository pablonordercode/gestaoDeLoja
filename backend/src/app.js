const express = require("express");
const cors = require("cors");
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const produtoRoute = require("./routes/produtoRout");
const colaboradorRoute = require("./routes/colaboradorRout");

require("dotenv").config();

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir arquivos estáticos da pasta uploads (caminho absoluto)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors());

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'API está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rotas da API
app.use("/api/produtos", produtoRoute);
app.use("/api/colaborador", colaboradorRoute);

// Middlewares de erro (sempre no final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

