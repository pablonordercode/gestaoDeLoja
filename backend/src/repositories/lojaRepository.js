const Loja = require("../models/lojaModels");

class LojaRepository {
    /**
     * Cria uma nova loja
     */
    async create(dados) {
        const loja = new Loja(dados);
        return await loja.save();
    }

    /**
     * Busca a primeira loja (assume que existe apenas uma)
     */
    async findFirst() {
        return await Loja.findOne().populate('criadoPor', 'nome email cargo');
    }

    /**
     * Busca loja por ID
     */
    async findById(id) {
        return await Loja.findById(id).populate('criadoPor', 'nome email cargo');
    }

    /**
     * Atualiza loja por ID
     */
    async update(id, dados) {
        return await Loja.findByIdAndUpdate(
            id,
            dados,
            { new: true, runValidators: true }
        ).populate('criadoPor', 'nome email cargo');
    }

    /**
     * Verifica se CNPJ já existe
     */
    async cnpjExists(cnpj) {
        const count = await Loja.countDocuments({ cnpj });
        return count > 0;
    }

    /**
     * Verifica se CNPJ já existe excluindo um ID específico
     */
    async cnpjExistsExcept(cnpj, excludeId) {
        const count = await Loja.countDocuments({ 
            cnpj, 
            _id: { $ne: excludeId } 
        });
        return count > 0;
    }

    /**
     * Conta o número de lojas cadastradas
     */
    async count() {
        return await Loja.countDocuments();
    }

    /**
     * Deleta loja por ID
     */
    async delete(id) {
        return await Loja.findByIdAndDelete(id);
    }
}

module.exports = new LojaRepository();


