# Backend - CRUD 2025

API REST construída com Node.js, Express e MongoDB seguindo os princípios de Clean Architecture.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas bem definida:

```
backend/src/
├── app.js              # Configuração do Express
├── server.js           # Inicialização do servidor
├── config/             # Configurações centralizadas
├── controllers/        # Controladores HTTP (orquestradores)
├── services/           # Lógica de negócio
├── repositories/       # Camada de acesso a dados
├── models/             # Schemas do MongoDB
├── routes/             # Definição de rotas
├── middlewares/        # Middlewares customizados
├── utils/              # Utilitários e helpers
├── modules/            # Módulos independentes (futuro)
└── db/                 # Conexão com banco de dados
```

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **CORS** - Requisições cross-origin

## ⚙️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais

5. Inicie o servidor:
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## 📚 Variáveis de Ambiente

Consulte o arquivo `.env.example` para ver todas as variáveis necessárias.

Principais variáveis:
- `PORT` - Porta do servidor (padrão: 7001)
- `DBUSER` - Usuário do MongoDB
- `DBPASS` - Senha do MongoDB
- `JWT_SECRET` - Chave secreta para JWT

## 🛣️ Rotas da API

### Colaboradores (`/api/colaborador`)

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| POST | `/login` | ❌ | Login de colaborador |
| POST | `/addColaborador` | ❌ | Cadastrar colaborador |
| GET | `/todosColaboradores` | ✅ Admin | Listar todos |
| GET | `/oneColaborador/:id` | ✅ | Buscar por ID |
| PUT | `/editarColaborador/:id` | ✅ Admin | Editar |
| DELETE | `/deletarColaborador/:id` | ✅ Admin | Deletar |

### Produtos (`/api/produtos`)

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| POST | `/addProduto` | ✅ | Criar produto |
| GET | `/todosProdutos` | ✅ | Listar todos |
| GET | `/produto/:id` | ✅ | Buscar por ID |
| PUT | `/editarProduto/:id` | ✅ | Editar |
| DELETE | `/deletarProduto/:id` | ✅ | Deletar |

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

1. Faça login em `/api/colaborador/login`
2. Receba o token JWT
3. Use o token no header de requisições protegidas:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 🧪 Níveis de Acesso

- **Colaborador** - Acesso básico
- **Gerente** - Acesso administrativo
- **Administrador** - Acesso total

## 📦 Estrutura de Dados

### Colaborador
```javascript
{
  nome: String,
  email: String (único),
  password: String (hasheada),
  imagem: String,
  ativo: Boolean,
  cargo: String,
  timestamps: true
}
```

### Produto
```javascript
{
  nome: String,
  descricao: String,
  preco: Number,
  quantidade: Number,
  categoria: String,
  fornecedor: String,
  imagem: String,
  timestamps: true
}
```

## 🎯 Princípios Arquiteturais

### Separação de Responsabilidades

- **Controllers**: Apenas recebem requisições e retornam respostas
- **Services**: Contém toda a lógica de negócio
- **Repositories**: Isolam o acesso ao banco de dados
- **Models**: Definem a estrutura dos dados

### Benefícios

✅ Código mais testável
✅ Manutenção facilitada
✅ Escalabilidade
✅ Reutilização de código
✅ Baixo acoplamento

## 🛡️ Segurança

- Senhas hasheadas com bcrypt (12 salt rounds)
- Tokens JWT com expiração
- Validação de dados em todas as camadas
- Proteção contra injeção NoSQL
- CORS configurável
- Tratamento centralizado de erros

## 📝 Padrões de Código

- Async/await para operações assíncronas
- Try/catch centralizado com asyncHandler
- Classes de erro customizadas
- Validações em múltiplas camadas
- Documentação inline (JSDoc)

## 🔄 Fluxo de Requisição

```
Request
  ↓
Route
  ↓
Middleware (Auth)
  ↓
Controller (orquestrador)
  ↓
Service (lógica de negócio)
  ↓
Repository (acesso a dados)
  ↓
Model (MongoDB)
  ↓
Response
```

## 🚧 Desenvolvimento Futuro

A estrutura está preparada para:
- [ ] Implementação de testes (Jest)
- [ ] Logs estruturados (Winston)
- [ ] Cache (Redis)
- [ ] Documentação API (Swagger)
- [ ] WebSockets (Socket.io)
- [ ] Notificações (Email/SMS)
- [ ] Relatórios em PDF
- [ ] Auditoria de ações

## 👨‍💻 Autor

Pablo Romulo

## 📄 Licença

ISC

