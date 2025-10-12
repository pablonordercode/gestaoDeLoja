const mongoose = require("mongoose");
const conectarDataBase = () => {
    require("dotenv").config();

    console.log("database conectado...");
    mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.v21wi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("mongoDB conectado show!!!!"))
    .catch((error)=> console.log(error));
}
module.exports = conectarDataBase;