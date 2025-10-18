const mongoose = require("mongoose");

const lojaSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true, 
    trim: true 
  },
  cnpj: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  endereco: { 
    type: String, 
    required: true,
    trim: true 
  },
  telefone: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  logoUrl: { 
    type: String,
    default: null
  },
  criadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UsuarioColaborador',
    required: true 
  }
}, { 
  timestamps: { 
    createdAt: 'criadoEm', 
    updatedAt: 'atualizadoEm' 
  } 
});

module.exports = mongoose.model("Loja", lojaSchema);


