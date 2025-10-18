const mongoose = require("mongoose");

const colaboradorSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  imagem: { type: String }, // link do Cloudinary ou path local
  ativo: { type: Boolean, default: true },
  cargo: { type: String, default: "Colaborador" }
}, { timestamps: true });  

module.exports = mongoose.model("UsuarioColaborador", colaboradorSchema);
