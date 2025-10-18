const lojaRepository = require("../repositories/lojaRepository");
const { AppError } = require("../utils/error");
const { validarObjectId } = require("../utils/validators");

class LojaService {
    /**
     * Cria uma nova loja
     */
    async criarLoja(dados, arquivo, userId) {
        const { nome, cnpj, endereco, telefone, email } = dados;

        // Validações
        if (!nome || !cnpj || !endereco || !telefone || !email) {
            throw new AppError("Todos os campos são obrigatórios!", 400);
        }

        // Verificar se já existe uma loja cadastrada
        const lojaExistente = await lojaRepository.findFirst();
        if (lojaExistente) {
            throw new AppError("Já existe uma loja cadastrada. Use a rota de atualização.", 409);
        }

        // Verificar se CNPJ já existe
        const cnpjExiste = await lojaRepository.cnpjExists(cnpj);
        if (cnpjExiste) {
            throw new AppError("CNPJ já está cadastrado", 409);
        }

        // Preparar dados
        const dadosLoja = {
            nome: nome.trim(),
            cnpj: cnpj.trim(),
            endereco: endereco.trim(),
            telefone: telefone.trim(),
            email: email.toLowerCase().trim(),
            criadoPor: userId
        };

        // Adicionar logo se fornecida
        if (arquivo && arquivo.filename) {
            dadosLoja.logoUrl = arquivo.filename;
        }

        // Criar loja
        const novaLoja = await lojaRepository.create(dadosLoja);

        return novaLoja;
    }

    /**
     * Busca os dados da loja
     */
    async buscarLoja() {
        const loja = await lojaRepository.findFirst();
        
        if (!loja) {
            throw new AppError('Nenhuma loja cadastrada', 404);
        }

        return loja;
    }

    /**
     * Atualiza os dados da loja
     */
    async atualizarLoja(id, dados, arquivo) {
        if (!validarObjectId(id)) {
            throw new AppError('ID da loja inválido', 400);
        }

        // Verificar se loja existe
        const lojaExiste = await lojaRepository.findById(id);
        if (!lojaExiste) {
            throw new AppError('Loja não encontrada', 404);
        }

        const { nome, cnpj, endereco, telefone, email } = dados;
        const dadosAtualizacao = {};

        // Nome
        if (nome !== undefined) {
            dadosAtualizacao.nome = String(nome).trim();
        }

        // CNPJ
        if (cnpj !== undefined) {
            const cnpjNormalizado = String(cnpj).trim();
            
            // Verificar se CNPJ já está em uso por outra loja
            if (cnpjNormalizado !== lojaExiste.cnpj) {
                const cnpjEmUso = await lojaRepository.cnpjExistsExcept(cnpjNormalizado, id);
                if (cnpjEmUso) {
                    throw new AppError('CNPJ já está em uso', 409);
                }
            }

            dadosAtualizacao.cnpj = cnpjNormalizado;
        }

        // Endereço
        if (endereco !== undefined) {
            dadosAtualizacao.endereco = String(endereco).trim();
        }

        // Telefone
        if (telefone !== undefined) {
            dadosAtualizacao.telefone = String(telefone).trim();
        }

        // Email
        if (email !== undefined) {
            dadosAtualizacao.email = String(email).toLowerCase().trim();
        }

        // Logo
        if (arquivo && arquivo.filename) {
            dadosAtualizacao.logoUrl = arquivo.filename;
        }

        // Verificar se há dados para atualizar
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new AppError('Nenhum dado válido fornecido para atualização', 400);
        }

        // Atualizar
        const lojaAtualizada = await lojaRepository.update(id, dadosAtualizacao);

        return lojaAtualizada;
    }

    /**
     * Deleta a loja
     */
    async deletarLoja(id) {
        if (!validarObjectId(id)) {
            throw new AppError('ID da loja inválido', 400);
        }

        const lojaExiste = await lojaRepository.findById(id);
        if (!lojaExiste) {
            throw new AppError('Loja não encontrada', 404);
        }

        const lojaDeletada = await lojaRepository.delete(id);

        return {
            id: lojaDeletada._id,
            nome: lojaDeletada.nome
        };
    }
}

module.exports = new LojaService();


