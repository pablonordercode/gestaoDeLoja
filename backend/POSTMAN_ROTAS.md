# 📮 Guia de Rotas - Postman API Testing

## 🌐 URL Base
```
http://localhost:7001
```

---

## 📋 Índice de Rotas

### ✅ Públicas (Sem Autenticação)
1. Health Check
2. Login de Colaborador
3. Cadastrar Colaborador

### 🔐 Protegidas (Requer Token)
4. Listar Todos os Colaboradores (Admin)
5. Buscar Colaborador por ID
6. Editar Colaborador (Admin)
7. Deletar Colaborador (Admin)
8. Criar Produto
9. Listar Todos os Produtos
10. Buscar Produto por ID
11. Editar Produto
12. Deletar Produto

---

# 🟢 ROTAS PÚBLICAS

## 1. Health Check - Verificar se API está online

```
GET http://localhost:7001/health
```

### Headers
```
Nenhum necessário
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "API está funcionando!",
  "timestamp": "2025-10-18T12:30:00.000Z"
}
```

---

## 2. Login de Colaborador

```
POST http://localhost:7001/api/colaborador/login
```

### Headers
```
Content-Type: application/json
```

### Body (raw - JSON)
```json
{
  "email": "admin@exemplo.com",
  "password": "123456"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "msg": "Login realizado com sucesso",
  "data": {
    "id": "67123abc456def789012",
    "nome": "Admin Sistema",
    "email": "admin@exemplo.com",
    "imagem": "1697654321123.jpg",
    "cargo": "Administrador",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Response (404 - Colaborador não encontrado)
```json
{
  "success": false,
  "msg": "Colaborador não encontrado"
}
```

### Response (401 - Senha incorreta)
```json
{
  "success": false,
  "msg": "Senha incorreta"
}
```

**💡 IMPORTANTE: Copie o `token` da resposta para usar nas rotas protegidas!**

---

## 3. Cadastrar Colaborador

```
POST http://localhost:7001/api/colaborador/addColaborador
```

### Headers
```
Content-Type: multipart/form-data
```

### Body (form-data)
```
nome: João Silva
email: joao@exemplo.com
password: 123456
cargo: Colaborador
imagem: [SELECIONAR ARQUIVO .jpg/.png]
```

### Response (201 Created)
```json
{
  "success": true,
  "msg": "Colaborador criado com sucesso!",
  "colaborador": {
    "id": "67123abc456def789013",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "cargo": "Colaborador",
    "ativo": true,
    "imagem": "1697654321456.jpg"
  }
}
```

### Response (409 - Email já existe)
```json
{
  "success": false,
  "msg": "Email já está em uso"
}
```

---

# 🔐 ROTAS PROTEGIDAS

**⚠️ ATENÇÃO: Todas as rotas abaixo requerem autenticação!**

## 🔑 Como Adicionar Token no Postman

### Método 1 - Authorization Tab
1. Clique na aba **Authorization**
2. Type: **Bearer Token**
3. Token: Cole o token recebido no login

### Método 2 - Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 4. Listar Todos os Colaboradores (ADMIN)

```
GET http://localhost:7001/api/colaborador/todosColaboradores
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Query Parameters (Opcionais)
```
page: 1
limit: 10
ativo: true
cargo: Administrador
busca: João
```

### Exemplos de URLs com Filtros
```
# Página 1 com 10 itens
GET http://localhost:7001/api/colaborador/todosColaboradores?page=1&limit=10

# Apenas colaboradores ativos
GET http://localhost:7001/api/colaborador/todosColaboradores?ativo=true

# Buscar por cargo
GET http://localhost:7001/api/colaborador/todosColaboradores?cargo=Gerente

# Buscar por nome/email
GET http://localhost:7001/api/colaborador/todosColaboradores?busca=João
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "67123abc456def789012",
      "nome": "Admin Sistema",
      "email": "admin@exemplo.com",
      "imagem": "1697654321123.jpg",
      "ativo": true,
      "cargo": "Administrador",
      "createdAt": "2025-10-15T10:30:00.000Z",
      "updatedAt": "2025-10-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "filters": {
    "ativo": "true",
    "cargo": null,
    "busca": null
  }
}
```

---

## 5. Buscar Colaborador por ID

```
GET http://localhost:7001/api/colaborador/oneColaborador/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Exemplo
```
GET http://localhost:7001/api/colaborador/oneColaborador/67123abc456def789012
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "67123abc456def789012",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "imagem": "1697654321456.jpg",
    "ativo": true,
    "cargo": "Colaborador",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  }
}
```

### Response (404 - Não encontrado)
```json
{
  "success": false,
  "msg": "Colaborador não encontrado"
}
```

---

## 6. Editar Colaborador (ADMIN)

```
PUT http://localhost:7001/api/colaborador/editarColaborador/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: multipart/form-data
```

### Body (form-data)
```
nome: João Silva Atualizado
email: joao.novo@exemplo.com
password: novaSenha123 (opcional)
ativo: true
cargo: Gerente
imagem: [SELECIONAR ARQUIVO .jpg/.png] (opcional)
```

### Exemplo
```
PUT http://localhost:7001/api/colaborador/editarColaborador/67123abc456def789012
```

### Response (200 OK)
```json
{
  "success": true,
  "msg": "Colaborador atualizado com sucesso",
  "data": {
    "_id": "67123abc456def789012",
    "nome": "João Silva Atualizado",
    "email": "joao.novo@exemplo.com",
    "cargo": "Gerente",
    "ativo": true,
    "imagem": "1697654399999.jpg",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-18T14:20:00.000Z"
  }
}
```

---

## 7. Deletar Colaborador (ADMIN)

```
DELETE http://localhost:7001/api/colaborador/deletarColaborador/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Exemplo
```
DELETE http://localhost:7001/api/colaborador/deletarColaborador/67123abc456def789012
```

### Response (200 OK)
```json
{
  "success": true,
  "msg": "Colaborador deletado com sucesso",
  "data": {
    "id": "67123abc456def789012",
    "nome": "João Silva"
  }
}
```

---

# 📦 ROTAS DE PRODUTOS

## 8. Criar Produto

```
POST http://localhost:7001/api/produtos/addProduto
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: multipart/form-data
```

### Body (form-data)
```
nome: Notebook Dell Inspiron
descricao: Notebook com 16GB RAM e 512GB SSD
preco: 3500.00
quantidade: 10
categoria: Eletrônicos
fornecedor: Dell Inc.
imagem: [SELECIONAR ARQUIVO .jpg/.png]
```

### Response (201 Created)
```json
{
  "success": true,
  "msg": "Produto criado com sucesso!",
  "produto": {
    "id": "67123abc456def789020",
    "nome": "Notebook Dell Inspiron",
    "preco": 3500,
    "quantidade": 10,
    "categoria": "Eletrônicos"
  }
}
```

---

## 9. Listar Todos os Produtos

```
GET http://localhost:7001/api/produtos/todosProdutos
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Query Parameters (Opcionais)
```
page: 1
limit: 10
categoria: Eletrônicos
fornecedor: Dell
precoMin: 1000
precoMax: 5000
```

### Exemplos de URLs com Filtros
```
# Página 1 com 20 itens
GET http://localhost:7001/api/produtos/todosProdutos?page=1&limit=20

# Filtrar por categoria
GET http://localhost:7001/api/produtos/todosProdutos?categoria=Eletrônicos

# Filtrar por faixa de preço
GET http://localhost:7001/api/produtos/todosProdutos?precoMin=1000&precoMax=5000

# Filtrar por fornecedor
GET http://localhost:7001/api/produtos/todosProdutos?fornecedor=Dell
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "67123abc456def789020",
      "nome": "Notebook Dell Inspiron",
      "descricao": "Notebook com 16GB RAM e 512GB SSD",
      "preco": 3500,
      "quantidade": 10,
      "categoria": "Eletrônicos",
      "fornecedor": "Dell Inc.",
      "imagem": "1697654400000.jpg",
      "createdAt": "2025-10-16T09:00:00.000Z",
      "updatedAt": "2025-10-16T09:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 10. Buscar Produto por ID

```
GET http://localhost:7001/api/produtos/produto/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Exemplo
```
GET http://localhost:7001/api/produtos/produto/67123abc456def789020
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "67123abc456def789020",
    "nome": "Notebook Dell Inspiron",
    "descricao": "Notebook com 16GB RAM e 512GB SSD",
    "preco": 3500,
    "quantidade": 10,
    "categoria": "Eletrônicos",
    "fornecedor": "Dell Inc.",
    "imagem": "1697654400000.jpg",
    "createdAt": "2025-10-16T09:00:00.000Z",
    "updatedAt": "2025-10-16T09:00:00.000Z"
  }
}
```

---

## 11. Editar Produto

```
PUT http://localhost:7001/api/produtos/editarProduto/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: multipart/form-data
```

### Body (form-data) - Todos os campos são opcionais
```
nome: Notebook Dell Inspiron 15
descricao: Notebook atualizado
preco: 3200.00
quantidade: 15
categoria: Eletrônicos
fornecedor: Dell Inc.
imagem: [SELECIONAR ARQUIVO .jpg/.png] (opcional)
```

### Exemplo
```
PUT http://localhost:7001/api/produtos/editarProduto/67123abc456def789020
```

### Response (200 OK)
```json
{
  "success": true,
  "msg": "Produto atualizado com sucesso",
  "data": {
    "_id": "67123abc456def789020",
    "nome": "Notebook Dell Inspiron 15",
    "descricao": "Notebook atualizado",
    "preco": 3200,
    "quantidade": 15,
    "categoria": "Eletrônicos",
    "fornecedor": "Dell Inc.",
    "imagem": "1697654500000.jpg",
    "createdAt": "2025-10-16T09:00:00.000Z",
    "updatedAt": "2025-10-18T15:30:00.000Z"
  }
}
```

---

## 12. Deletar Produto

```
DELETE http://localhost:7001/api/produtos/deletarProduto/:id
```

### Headers
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Exemplo
```
DELETE http://localhost:7001/api/produtos/deletarProduto/67123abc456def789020
```

### Response (200 OK)
```json
{
  "success": true,
  "msg": "Produto deletado com sucesso",
  "data": {
    "id": "67123abc456def789020",
    "nome": "Notebook Dell Inspiron 15"
  }
}
```

---

# 📝 RESUMO DE ROTAS

## Colaboradores

| Método | Rota | Auth | Admin | Descrição |
|--------|------|------|-------|-----------|
| POST | `/api/colaborador/login` | ❌ | ❌ | Login |
| POST | `/api/colaborador/addColaborador` | ❌ | ❌ | Cadastrar |
| GET | `/api/colaborador/todosColaboradores` | ✅ | ✅ | Listar todos |
| GET | `/api/colaborador/oneColaborador/:id` | ✅ | ❌ | Buscar por ID |
| PUT | `/api/colaborador/editarColaborador/:id` | ✅ | ✅ | Editar |
| DELETE | `/api/colaborador/deletarColaborador/:id` | ✅ | ✅ | Deletar |

## Produtos

| Método | Rota | Auth | Admin | Descrição |
|--------|------|------|-------|-----------|
| POST | `/api/produtos/addProduto` | ✅ | ❌ | Criar |
| GET | `/api/produtos/todosProdutos` | ✅ | ❌ | Listar todos |
| GET | `/api/produtos/produto/:id` | ✅ | ❌ | Buscar por ID |
| PUT | `/api/produtos/editarProduto/:id` | ✅ | ❌ | Editar |
| DELETE | `/api/produtos/deletarProduto/:id` | ✅ | ❌ | Deletar |

---

# 🔐 Níveis de Acesso

| Cargo | Descrição | Permissões |
|-------|-----------|------------|
| **Colaborador** | Usuário padrão | Gerenciar produtos |
| **Gerente** | Gerência | Gerenciar produtos + colaboradores |
| **Administrador** | Admin total | Acesso completo |

---

# ⚠️ Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 500 | Internal Server Error - Erro no servidor |

---

# 📥 Importar Collection para Postman

Você pode criar uma Collection no Postman com todas essas rotas. Aqui está um exemplo de estrutura:

```
📁 CRUD 2025 API
├── 📁 Health Check
│   └── ✅ Health Check
├── 📁 Autenticação
│   ├── 🔓 Login
│   └── 🔓 Cadastrar Colaborador
├── 📁 Colaboradores
│   ├── 🔐 Listar Todos (Admin)
│   ├── 🔐 Buscar por ID
│   ├── 🔐 Editar (Admin)
│   └── 🔐 Deletar (Admin)
└── 📁 Produtos
    ├── 🔐 Criar Produto
    ├── 🔐 Listar Todos
    ├── 🔐 Buscar por ID
    ├── 🔐 Editar Produto
    └── 🔐 Deletar Produto
```

---

# 💡 Dicas para Testar no Postman

## 1. Configurar Variável de Ambiente
```
{{BASE_URL}} = http://localhost:7001
{{TOKEN}} = [seu token aqui]
```

## 2. Usar Variáveis nas Rotas
```
GET {{BASE_URL}}/api/produtos/todosProdutos
Authorization: Bearer {{TOKEN}}
```

## 3. Salvar Token Automaticamente (Scripts)

No teste de **Login**, adicione no tab **Tests**:
```javascript
// Salvar token automaticamente
pm.test("Login bem-sucedido", function () {
    var jsonData = pm.response.json();
    pm.environment.set("TOKEN", jsonData.data.token);
});
```

## 4. Upload de Arquivos
- Use **form-data**
- Para o campo `imagem`, selecione **File** no dropdown
- Escolha uma imagem .jpg ou .png

---

# 🎯 Fluxo de Teste Recomendado

1. ✅ **Health Check** - Verificar se servidor está rodando
2. 🔓 **Login** - Obter token de autenticação
3. 🔐 **Listar Produtos** - Testar autenticação
4. 🔐 **Criar Produto** - Testar upload
5. 🔐 **Editar Produto** - Testar update
6. 🔐 **Deletar Produto** - Testar delete

---

**🚀 Bons testes! Se precisar de ajuda, consulte a documentação completa em `backend/README.md`**

