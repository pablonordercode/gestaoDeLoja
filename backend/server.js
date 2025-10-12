const express = require("express");
const produtoRoute = require("./routes/produtoRout");
const colaboradorRoute = require("./routes/colaboradorRout");
const conectarDB = require("./db/condb");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7001;

conectarDB();

app.use(express.json());
app.use('/uploads', express.static('uploads'))
app.use(cors());

app.use("/produtos", produtoRoute);
app.use("/colaborador", colaboradorRoute);

// Middlewares de erro (depois das rotas)
app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`rodando na port: ${PORT}`);
});
 