const Produtonew = require("../models/produtosModels");

class ProdutoRepository {
    /**
     * Busca todos os produtos com paginação
     */
    async findAll(filtros = {}, opcoesPaginacao = {}) {
        const { skip = 0, limit = 10, sort = { createdAt: -1 } } = opcoesPaginacao;
        
        const produtos = await Produtonew.find(filtros)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await Produtonew.countDocuments(filtros);
        
        return { produtos, total };
    }

    /**
     * Busca produto por ID
     */
    async findById(id) {
        return await Produtonew.findById(id);
    }

    /**
     * Busca produto por nome
     */
    async findByNome(nome) {
        return await Produtonew.findOne({ 
            nome: { $regex: nome, $options: 'i' } 
        });
    }

    /**
     * Cria um novo produto
     */
    async create(dadosProduto) {
        const novoProduto = new Produtonew(dadosProduto);
        return await novoProduto.save();
    }

    /**
     * Atualiza produto por ID
     */
    async update(id, dadosAtualizacao) {
        return await Produtonew.findByIdAndUpdate(
            id,
            dadosAtualizacao,
            {
                new: true,
                runValidators: true
            }
        );
    }

    /**
     * Deleta produto por ID
     */
    async delete(id) {
        return await Produtonew.findByIdAndDelete(id);
    }

    /**
     * Conta produtos com filtros
     */
    async count(filtros = {}) {
        return await Produtonew.countDocuments(filtros);
    }

    /**
     * Busca produtos por categoria
     */
    async findByCategoria(categoria, opcoesPaginacao = {}) {
        return await this.findAll({ 
            categoria: { $regex: categoria, $options: 'i' } 
        }, opcoesPaginacao);
    }

    /**
     * Busca produtos por fornecedor
     */
    async findByFornecedor(fornecedor, opcoesPaginacao = {}) {
        return await this.findAll({ 
            fornecedor: { $regex: fornecedor, $options: 'i' } 
        }, opcoesPaginacao);
    }

    /**
     * Busca produtos com quantidade baixa
     */
    async findComEstoqueBaixo(quantidadeMinima = 10, opcoesPaginacao = {}) {
        return await this.findAll({ 
            quantidade: { $lte: quantidadeMinima } 
        }, opcoesPaginacao);
    }

    /**
     * Atualiza quantidade do produto
     */
    async atualizarQuantidade(id, novaQuantidade) {
        return await this.update(id, { quantidade: novaQuantidade });
    }

    /**
     * Busca produtos por faixa de preço
     */
    async findByFaixaPreco(precoMin, precoMax, opcoesPaginacao = {}) {
        return await this.findAll({ 
            preco: { $gte: precoMin, $lte: precoMax } 
        }, opcoesPaginacao);
    }
}

module.exports = new ProdutoRepository();

