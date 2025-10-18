const UsuarioColaborador = require("../models/colaboradorModels");

class ColaboradorRepository {
    /**
     * Busca todos os colaboradores com filtros e paginação
     */
    async findAll(filtros = {}, opcoesPaginacao = {}) {
        const { skip = 0, limit = 10, sort = { createdAt: -1 } } = opcoesPaginacao;
        
        const colaboradores = await UsuarioColaborador.find(filtros)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await UsuarioColaborador.countDocuments(filtros);
        
        return { colaboradores, total };
    }

    /**
     * Busca colaborador por ID
     */
    async findById(id) {
        return await UsuarioColaborador.findById(id).select('-password');
    }

    /**
     * Busca colaborador por ID incluindo senha (para autenticação)
     */
    async findByIdWithPassword(id) {
        return await UsuarioColaborador.findById(id);
    }

    /**
     * Busca colaborador por email
     */
    async findByEmail(email) {
        return await UsuarioColaborador.findOne({ email: email.toLowerCase() });
    }

    /**
     * Verifica se email já existe
     */
    async emailExists(email) {
        const colaborador = await UsuarioColaborador.findOne({ 
            email: email.toLowerCase() 
        });
        return !!colaborador;
    }

    /**
     * Cria um novo colaborador
     */
    async create(dadosColaborador) {
        const novoColaborador = new UsuarioColaborador(dadosColaborador);
        return await novoColaborador.save();
    }

    /**
     * Atualiza colaborador por ID
     */
    async update(id, dadosAtualizacao) {
        return await UsuarioColaborador.findByIdAndUpdate(
            id,
            dadosAtualizacao,
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        ).select('-password');
    }

    /**
     * Deleta colaborador por ID
     */
    async delete(id) {
        return await UsuarioColaborador.findByIdAndDelete(id);
    }

    /**
     * Conta colaboradores com filtros
     */
    async count(filtros = {}) {
        return await UsuarioColaborador.countDocuments(filtros);
    }

    /**
     * Busca colaboradores ativos
     */
    async findAtivos(opcoesPaginacao = {}) {
        return await this.findAll({ ativo: true }, opcoesPaginacao);
    }

    /**
     * Busca colaboradores por cargo
     */
    async findByCargo(cargo, opcoesPaginacao = {}) {
        return await this.findAll({ 
            cargo: { $regex: cargo, $options: 'i' } 
        }, opcoesPaginacao);
    }
}

module.exports = new ColaboradorRepository();

