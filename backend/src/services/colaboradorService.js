const colaboradorRepository = require("../repositories/colaboradorRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/error");
const { validarEmail, validarSenha, validarObjectId } = require("../utils/validators");
const { generateTokens, generateAccessToken, verifyToken, calculateExpiryDate } = require("../utils/tokenUtils");

class ColaboradorService {
    /**
     * Cria um novo colaborador
     */
    async criarColaborador(dados, arquivo) {
        const { nome, email, password, cargo } = dados;

        // Validações
        if (!nome || !email || !password) {
            throw new AppError("Nome, email e senha são obrigatórios!", 400);
        }

        if (!validarEmail(email)) {
            throw new AppError("Email inválido", 400);
        }

        if (!validarSenha(password)) {
            throw new AppError("Senha deve ter pelo menos 6 caracteres", 400);
        }

        // Verificar se email já existe
        const emailExiste = await colaboradorRepository.emailExists(email);
        if (emailExiste) {
            throw new AppError("Email já está em uso", 409);
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Preparar dados
        const dadosColaborador = {
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            cargo: cargo || "Colaborador"
        };

        // Adicionar imagem se fornecida
        if (arquivo && arquivo.filename) {
            dadosColaborador.imagem = arquivo.filename;
        }

        // Criar colaborador
        const novoColaborador = await colaboradorRepository.create(dadosColaborador);

        // Retornar sem a senha
        return {
            id: novoColaborador._id,
            nome: novoColaborador.nome,
            email: novoColaborador.email,
            cargo: novoColaborador.cargo,
            ativo: novoColaborador.ativo,
            imagem: novoColaborador.imagem
        };
    }

    /**
     * Busca todos os colaboradores com filtros e paginação
     */
    async buscarColaboradores(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        // Construir filtros
        const filtros = this._construirFiltros(query);

        // Buscar colaboradores
        const { colaboradores, total } = await colaboradorRepository.findAll(
            filtros,
            { skip, limit }
        );

        const totalPages = Math.ceil(total / limit);

        return {
            data: colaboradores,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                ativo: query.ativo,
                cargo: query.cargo,
                busca: query.busca
            }
        };
    }

    /**
     * Busca colaborador por ID
     */
    async buscarColaboradorPorId(id) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do colaborador inválido', 400);
        }

        const colaborador = await colaboradorRepository.findById(id);
        
        if (!colaborador) {
            throw new AppError('Colaborador não encontrado', 404);
        }

        return colaborador;
    }

    /**
     * Atualiza colaborador
     */
    async atualizarColaborador(id, dados, arquivo) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do colaborador inválido', 400);
        }

        // Verificar se colaborador existe
        const colaboradorExiste = await colaboradorRepository.findById(id);
        if (!colaboradorExiste) {
            throw new AppError('Colaborador não encontrado', 404);
        }

        const { nome, email, password, ativo, cargo } = dados;
        const dadosAtualizacao = {};

        // Nome
        if (nome !== undefined) {
            dadosAtualizacao.nome = String(nome).trim();
        }

        // Email
        if (email !== undefined) {
            const emailNormalizado = String(email).toLowerCase().trim();
            
            if (!validarEmail(emailNormalizado)) {
                throw new AppError('Email inválido', 400);
            }

            // Verificar se email já está em uso por outro usuário
            if (emailNormalizado !== colaboradorExiste.email) {
                const emailEmUso = await colaboradorRepository.emailExists(emailNormalizado);
                if (emailEmUso) {
                    throw new AppError('Email já está em uso', 409);
                }
            }

            dadosAtualizacao.email = emailNormalizado;
        }

        // Senha
        if (password && password.trim() !== '') {
            if (!validarSenha(password)) {
                throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
            }
            dadosAtualizacao.password = await bcrypt.hash(password, 12);
        }

        // Status ativo
        if (ativo !== undefined) {
            dadosAtualizacao.ativo = typeof ativo === 'string' ? ativo === 'true' : Boolean(ativo);
        }

        // Cargo
        if (cargo !== undefined) {
            dadosAtualizacao.cargo = String(cargo).trim();
        }

        // Imagem
        if (arquivo && arquivo.filename) {
            dadosAtualizacao.imagem = arquivo.filename;
        }

        // Verificar se há dados para atualizar
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new AppError('Nenhum dado válido fornecido para atualização', 400);
        }

        // Atualizar
        const colaboradorAtualizado = await colaboradorRepository.update(id, dadosAtualizacao);

        return colaboradorAtualizado;
    }

    /**
     * Deleta colaborador
     */
    async deletarColaborador(id) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do colaborador inválido', 400);
        }

        const colaboradorExiste = await colaboradorRepository.findById(id);
        if (!colaboradorExiste) {
            throw new AppError('Colaborador não encontrado', 404);
        }

        const colaboradorDeletado = await colaboradorRepository.delete(id);

        return {
            id: colaboradorDeletado._id,
            nome: colaboradorDeletado.nome
        };
    }

    /**
     * Login de colaborador
     */
    async login(email, password) {
        // Validações básicas
        if (!email || !password) {
            throw new AppError("E-mail e senha são obrigatórios", 400);
        }

        // Buscar colaborador
        const colaborador = await colaboradorRepository.findByEmail(email);
        if (!colaborador) {
            throw new AppError("Colaborador não encontrado", 404);
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(password, colaborador.password);
        if (!senhaValida) {
            throw new AppError("Senha incorreta", 401);
        }

        // Verificar se está ativo
        if (!colaborador.ativo) {
            throw new AppError("Colaborador inativo. Contate o administrador.", 403);
        }

        // Gerar tokens (access e refresh)
        const { accessToken, refreshToken } = generateTokens(colaborador);

        // Calcular data de expiração do refresh token
        const refreshTokenExpiry = calculateExpiryDate(
            process.env.JWT_REFRESH_EXP || "7d"
        );

        // Salvar refresh token no banco de dados
        await colaboradorRepository.update(colaborador._id, {
            refreshToken,
            refreshTokenExpiry
        });

        // Retornar dados
        return {
            id: colaborador._id,
            nome: colaborador.nome,
            email: colaborador.email,
            imagem: colaborador.imagem,
            cargo: colaborador.cargo,
            accessToken,
            refreshToken
        };
    }

    /**
     * Renova o access token usando o refresh token
     */
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new AppError("Refresh token não fornecido", 400);
        }

        try {
            // Verificar e decodificar o refresh token
            const decoded = verifyToken(refreshToken);

            // Verificar se é um refresh token
            if (decoded.type !== "refresh") {
                throw new AppError("Token inválido", 401);
            }

            // Buscar colaborador no banco
            const colaborador = await colaboradorRepository.findById(decoded.id);
            if (!colaborador) {
                throw new AppError("Colaborador não encontrado", 404);
            }

            // Verificar se o refresh token corresponde ao salvo no banco
            if (colaborador.refreshToken !== refreshToken) {
                throw new AppError("Refresh token inválido", 401);
            }

            // Verificar se o refresh token expirou no banco
            if (colaborador.refreshTokenExpiry && new Date() > colaborador.refreshTokenExpiry) {
                throw new AppError("Refresh token expirado. Faça login novamente.", 401);
            }

            // Verificar se está ativo
            if (!colaborador.ativo) {
                throw new AppError("Colaborador inativo. Contate o administrador.", 403);
            }

            // Gerar novos tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(colaborador);

            // Calcular nova data de expiração do refresh token
            const refreshTokenExpiry = calculateExpiryDate(
                process.env.JWT_REFRESH_EXP || "7d"
            );

            // Atualizar refresh token no banco
            await colaboradorRepository.update(colaborador._id, {
                refreshToken: newRefreshToken,
                refreshTokenExpiry
            });

            // Retornar novos tokens
            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                throw new AppError("Token inválido", 401);
            }
            if (error.name === "TokenExpiredError") {
                throw new AppError("Refresh token expirado. Faça login novamente.", 401);
            }
            throw error;
        }
    }

    /**
     * Logout - revoga o refresh token
     */
    async logout(userId) {
        if (!validarObjectId(userId)) {
            throw new AppError('ID do colaborador inválido', 400);
        }

        const colaborador = await colaboradorRepository.findById(userId);
        if (!colaborador) {
            throw new AppError('Colaborador não encontrado', 404);
        }

        // Remover refresh token do banco
        await colaboradorRepository.update(userId, {
            refreshToken: null,
            refreshTokenExpiry: null
        });

        return {
            msg: "Logout realizado com sucesso"
        };
    }

    /**
     * Método auxiliar para construir filtros
     */
    _construirFiltros(query) {
        const { ativo, cargo, busca } = query;
        const filtros = {};

        if (ativo !== undefined) {
            filtros.ativo = ativo === 'true';
        }

        if (cargo) {
            filtros.cargo = { $regex: cargo, $options: 'i' };
        }

        if (busca) {
            filtros.$or = [
                { nome: { $regex: busca, $options: 'i' } },
                { email: { $regex: busca, $options: 'i' } }
            ];
        }

        return filtros;
    }
}

module.exports = new ColaboradorService();

