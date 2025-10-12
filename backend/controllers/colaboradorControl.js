const UsuarioColaborador = require("../models/colaboradorModels");
const { asyncHandler, AppError } = require("../utils/error")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");



exports.adicionarColaborador = asyncHandler(async (req, res) => {
    const { nome, email, password, cargo } = req.body;

        // Verifica se todos os campos obrigatórios foram fornecidos
    if (!nome || !email || !password) {
        throw new AppError("Nome, email e senha são obrigatórios!", 400);
    }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError("Email inválido", 400);
    }

        // Validação de senha
    if (password.length < 6) {
        throw new AppError("Senha deve ter pelo menos 6 caracteres", 400);
    }

        // Verificar se o email já existe
        const colaboradorExistente = await UsuarioColaborador.findOne({ email });
    if (colaboradorExistente) {
        throw new AppError("Email já está em uso", 409);
    }

        // Hash da senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Preparar dados do colaborador
        const dadosColaborador = {
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            cargo: cargo || "Colaborador"
        };

        // Adicionar imagem se fornecida
        if (req.file && req.file.filename) {
            dadosColaborador.imagem = req.file.filename;
        }

        // Cria uma nova instância do Colaborador
        const criaColaborador = new UsuarioColaborador(dadosColaborador);

        // Salva o colaborador no banco de dados
    await criaColaborador.save();
    
    res.status(201).json({ 
            success: true,
            msg: "Colaborador criado com sucesso!",
            colaborador: {
                id: criaColaborador._id,
                nome: criaColaborador.nome,
                email: criaColaborador.email,
                cargo: criaColaborador.cargo,
                ativo: criaColaborador.ativo,
                imagem: criaColaborador.imagem
            }
        });
});

exports.buscarColaboradores = asyncHandler(async (req, res) => {
        // Parâmetros de paginação
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtros opcionais
        const { ativo, cargo, busca } = req.query;
        let filtros = {};

        // Filtro por status ativo
        if (ativo !== undefined) {
            filtros.ativo = ativo === 'true';
        }

        // Filtro por cargo
        if (cargo) {
            filtros.cargo = { $regex: cargo, $options: 'i' };
        }

        // Busca por nome ou email
        if (busca) {
            filtros.$or = [
                { nome: { $regex: busca, $options: 'i' } },
                { email: { $regex: busca, $options: 'i' } }
            ];
        }

        // Busca colaboradores com filtros e paginação
        const colaboradores = await UsuarioColaborador.find(filtros)
            .select('-password') // Excluir senha da resposta
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Conta o total de colaboradores para metadados
        const totalColaboradores = await UsuarioColaborador.countDocuments(filtros);
        const totalPages = Math.ceil(totalColaboradores / limit);

        res.status(200).json({
            success: true,
            data: colaboradores,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalColaboradores,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                ativo: ativo,
                cargo: cargo,
                busca: busca
            }
        });
});

exports.buscarColaboradorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

        // Validação do ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do colaborador inválido', 400);
    }

        const colaboradorGold = await UsuarioColaborador.findById(id);
        
    if (!colaboradorGold) {
        throw new AppError('Colaborador não encontrado', 404);
    }

    res.status(200).json({
        success: true,
        data: colaboradorGold 
    });
});

exports.editarColaborador = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do colaborador inválido', 400);
    }

    // Verificar se o colaborador existe
    const colaboradorExistente = await UsuarioColaborador.findById(id);
    if (!colaboradorExistente) {
        throw new AppError('Colaborador não encontrado', 404);
    }

    // Extrair campos possíveis
    const { nome, email, password, ativo, cargo } = updateData;

    // Objeto que conterá apenas campos válidos
    const dadosAtualizacao = {};

    if (nome !== undefined) {
        dadosAtualizacao.nome = String(nome).trim();
    }

    // Validação e atualização do e-mail
    if (email !== undefined) {
        const emailNormalizado = String(email).toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailNormalizado)) {
            throw new AppError('Email inválido', 400);
        }

        if (emailNormalizado !== colaboradorExistente.email) {
            const emailEmUso = await UsuarioColaborador.findOne({ email: emailNormalizado });
            if (emailEmUso) {
                throw new AppError('Email já está em uso', 409);
            }
        }

        dadosAtualizacao.email = emailNormalizado;
    }

    // Só atualiza a senha se foi enviada e não estiver vazia
    if (password && password.trim() !== '') {
        if (password.length < 6) {
            throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
        }
        const saltRounds = 12;
        dadosAtualizacao.password = await bcrypt.hash(password, saltRounds);
    }

    // Atualiza o status ativo se enviado
    if (ativo !== undefined) {
        dadosAtualizacao.ativo = typeof ativo === 'string' ? ativo === 'true' : Boolean(ativo);
    }

    // Atualiza cargo, se enviado
    if (cargo !== undefined) {
        dadosAtualizacao.cargo = String(cargo).trim();
    }

    // Atualiza imagem, se enviada
    if (req.file && req.file.filename) {
        dadosAtualizacao.imagem = req.file.filename;
    }

    // Verifica se há dados para atualizar
    if (Object.keys(dadosAtualizacao).length === 0) {
        throw new AppError('Nenhum dado válido fornecido para atualização', 400);
    }

    // Atualiza o colaborador
    const colaboradorAtualizado = await UsuarioColaborador.findByIdAndUpdate(
        id,
        dadosAtualizacao,
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    ).select('-password');

    res.status(200).json({
        success: true,
        msg: 'Colaborador atualizado com sucesso',
        data: colaboradorAtualizado
    });
});

exports.deletarColaborador = asyncHandler(async (req, res) => {
    const { id } = req.params;

        // Validação do ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do colaborador inválido', 400);
    }

        // Verificar se o colaborador existe antes de deletar
    const colaboradorExiste = await UsuarioColaborador.findById(id);
    if (!colaboradorExiste) {
        throw new AppError('Colaborador não encontrado', 404);
    }

        // Deletar o colaborador
    const colaboradorDeletado = await UsuarioColaborador.findByIdAndDelete(id);

    res.status(200).json({
            success: true,
            msg: 'Colaborador deletado com sucesso',
            data: {
                id: colaboradorDeletado._id,
                nome: colaboradorDeletado.nome
            }
        });
});

exports.loginColaborador = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // 1️⃣ Validação básica
  if (!email || !password) {
    throw new AppError("E-mail e senha são obrigatórios", 400)
  }

  // 2️⃣ Buscar colaborador pelo e-mail
  const colaborador = await UsuarioColaborador.findOne({ email })

  if (!colaborador) {
    throw new AppError("Colaborador não encontrado", 404)
  }

  // 3️⃣ Verificar se a senha está correta
  const senhaValida = await bcrypt.compare(password, colaborador.password)
  if (!senhaValida) {
    throw new AppError("Senha incorreta", 401)
  }

  // 4️⃣ Gerar token JWT
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET não configurado", 500)
  }
  
  const token = jwt.sign(
    { id: colaborador._id, email: colaborador.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  // 5️⃣ Retornar dados do colaborador logado
  res.status(200).json({
    success: true,
    msg: "Login realizado com sucesso",
    data: {
      id: colaborador._id,
      nome: colaborador.nome,
      email: colaborador.email,
      imagem: colaborador.imagem,
      cargo: colaborador.cargo,
      token,
    },
  })
})

