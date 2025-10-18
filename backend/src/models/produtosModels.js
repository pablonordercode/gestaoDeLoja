const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  preco: { type: Number, required: true },
  quantidade: { type: Number, required: true, default: 0 },
  categoria: { type: String, required: true },
  fornecedor: { type: String },
  imagem: { type: String }, // link do Cloudinary ou path local
}, { timestamps: true });

module.exports = mongoose.model("Produtonew", produtoSchema);
