# 🏪 Sistema de Configuração da Loja - Documentação Completa

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

O sistema de **Configuração da Loja** foi implementado com sucesso, permitindo que usuários com cargo de **Gerente** ou **Administrador** configurem os dados da loja.

---

## 📋 Funcionalidades Implementadas

### ✅ Backend

| Componente | Status | Descrição |
|-----------|--------|-----------|
| **Modelo Loja** | ✅ | Schema MongoDB com validações |
| **Repository** | ✅ | Acesso ao banco de dados |
| **Service** | ✅ | Lógica de negócio |
| **Controller** | ✅ | Tratamento de requisições |
| **Rotas** | ✅ | Endpoints REST API |

### ✅ Frontend

| Componente | Status | Descrição |
|-----------|--------|-----------|
| **Página ConfiguracaoLoja** | ✅ | Interface completa |
| **Formulário** | ✅ | Todos os campos + upload |
| **Validações** | ✅ | Máscaras e validações |
| **Rota** | ✅ | `/configuracao-loja` |
| **Link no Menu** | ✅ | Botão na página Gestão |

---

## 🗄️ Estrutura do Banco de Dados

### Modelo: Loja

```javascript
{
  nome: String,              // Nome da loja
  cnpj: String,              // CNPJ (único)
  endereco: String,          // Endereço completo
  telefone: String,          // Telefone
  email: String,             // E-mail de contato
  logoUrl: String,           // Nome do arquivo da logo
  criadoPor: ObjectId,       // Ref: UsuarioColaborador
  criadoEm: Date,           // Data de criação
  atualizadoEm: Date        // Data de atualização
}
```

**Exemplo:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nome": "Loja do João",
  "cnpj": "12345678000190",
  "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP",
  "telefone": "11987654321",
  "email": "contato@lojadojoao.com",
  "logoUrl": "1760759016597.jpg",
  "criadoPor": "507f191e810c19729de860ea",
  "criadoEm": "2025-10-18T12:30:00.000Z",
  "atualizadoEm": "2025-10-18T15:45:00.000Z"
}
```

---

## 🚀 Rotas da API

### **POST** `/api/loja`
Cria uma nova loja (apenas uma loja é permitida)

**Autenticação:** Requerida  
**Permissão:** Gerente ou Administrador

**Request:**
```javascript
// FormData
{
  nome: "Loja do João",
  cnpj: "12345678000190",
  endereco: "Rua das Flores, 123 - Centro - São Paulo/SP",
  telefone: "11987654321",
  email: "contato@lojadojoao.com",
  logo: File // (opcional)
}
```

**Response (201):**
```json
{
  "success": true,
  "msg": "Loja criada com sucesso!",
  "data": {
    "_id": "...",
    "nome": "Loja do João",
    "cnpj": "12345678000190",
    "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP",
    "telefone": "11987654321",
    "email": "contato@lojadojoao.com",
    "logoUrl": "1760759016597.jpg",
    "criadoPor": {...},
    "criadoEm": "2025-10-18T12:30:00.000Z",
    "atualizadoEm": "2025-10-18T12:30:00.000Z"
  }
}
```

**Erros:**
- `409`: "Já existe uma loja cadastrada"
- `409`: "CNPJ já está cadastrado"
- `400`: "Todos os campos são obrigatórios"

---

### **GET** `/api/loja`
Retorna os dados da loja

**Autenticação:** Requerida  
**Permissão:** Qualquer usuário autenticado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "nome": "Loja do João",
    "cnpj": "12345678000190",
    "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP",
    "telefone": "11987654321",
    "email": "contato@lojadojoao.com",
    "logoUrl": "1760759016597.jpg",
    "criadoPor": {
      "_id": "...",
      "nome": "Admin User",
      "email": "admin@exemplo.com",
      "cargo": "Administrador"
    },
    "criadoEm": "2025-10-18T12:30:00.000Z",
    "atualizadoEm": "2025-10-18T15:45:00.000Z"
  }
}
```

**Erros:**
- `404`: "Nenhuma loja cadastrada"

---

### **PUT** `/api/loja/:id`
Atualiza os dados da loja

**Autenticação:** Requerida  
**Permissão:** Gerente ou Administrador

**Request:**
```javascript
// FormData
{
  nome: "Nova Loja do João",           // opcional
  cnpj: "98765432000100",              // opcional
  endereco: "Rua Nova, 456",           // opcional
  telefone: "11912345678",             // opcional
  email: "novo@email.com",             // opcional
  logo: File                           // opcional
}
```

**Response (200):**
```json
{
  "success": true,
  "msg": "Loja atualizada com sucesso",
  "data": {
    "_id": "...",
    "nome": "Nova Loja do João",
    // ... dados atualizados
  }
}
```

**Erros:**
- `404`: "Loja não encontrada"
- `400`: "ID da loja inválido"
- `409`: "CNPJ já está em uso"

---

### **DELETE** `/api/loja/:id`
Deleta a loja

**Autenticação:** Requerida  
**Permissão:** Gerente ou Administrador

**Response (200):**
```json
{
  "success": true,
  "msg": "Loja deletada com sucesso",
  "data": {
    "id": "...",
    "nome": "Loja do João"
  }
}
```

---

## 🎨 Interface Frontend

### Página: `/configuracao-loja`

**Características:**

✅ **Formulário Completo:**
- Nome da loja
- CNPJ (com máscara: `00.000.000/0000-00`)
- Endereço
- Telefone (com máscara: `(00) 00000-0000`)
- E-mail
- Upload de logo com preview

✅ **Funcionalidades:**
- Detecta automaticamente se já existe loja cadastrada
- Se existe: modo de edição
- Se não existe: modo de criação
- Preview da logo atual
- Preview da nova logo antes de salvar
- Validação de tamanho (máx 5MB)
- Validação de tipo de arquivo (imagens)

✅ **Botões:**
- **Salvar Alterações**: Cria ou atualiza a loja
- **Cancelar**: Recarrega dados originais ou limpa formulário

✅ **Notificações:**
- Sucesso ao salvar
- Erros detalhados
- Loading states

---

## 📱 Acesso à Funcionalidade

### Através do Menu Gestão

Na página **Gestão** (`/gestao`), foi adicionada uma seção de **Ações Rápidas** com dois botões:

1. **⚙️ Configurações da Loja**
   - Abre `/configuracao-loja`
   - Permite configurar dados da loja

2. **👤 Cadastrar Colaborador**
   - Abre `/registrar`
   - Permite adicionar novos colaboradores

---

## 🔐 Controle de Acesso

### Permissões por Rota:

| Rota | Método | Permissão |
|------|--------|-----------|
| `/api/loja` | GET | Qualquer usuário autenticado |
| `/api/loja` | POST | Gerente ou Administrador |
| `/api/loja/:id` | PUT | Gerente ou Administrador |
| `/api/loja/:id` | DELETE | Gerente ou Administrador |

### Verificação no Backend:

```javascript
// Rota protegida - exemplo
router.post("/", verificarAuth, verificarAdmin, imageUpload.single("logo"), criarLoja);
```

**Middlewares:**
- `verificarAuth`: Verifica se o usuário está autenticado
- `verificarAdmin`: Verifica se o cargo é "Gerente" ou "Administrador"

---

## 🧪 Como Testar

### 1️⃣ Criar Loja (Primeira vez)

1. Faça login como **Gerente** ou **Administrador**
2. Acesse **Gestão** → **Configurações da Loja**
3. Preencha todos os campos:
   - Nome: `Minha Loja`
   - CNPJ: `12.345.678/0001-90`
   - Endereço: `Rua Exemplo, 123`
   - Telefone: `(11) 98765-4321`
   - E-mail: `contato@minhaloja.com`
4. (Opcional) Selecione uma logo
5. Clique em **Salvar Alterações**
6. ✅ Deve aparecer: "Loja criada com sucesso!"

### 2️⃣ Visualizar Loja

1. Recarregue a página `/configuracao-loja`
2. ✅ Campos devem estar preenchidos com os dados salvos
3. ✅ Logo deve aparecer (se foi enviada)

### 3️⃣ Editar Loja

1. Altere qualquer campo (ex: nome)
2. Clique em **Salvar Alterações**
3. ✅ Deve aparecer: "Loja atualizada com sucesso"
4. Recarregue a página
5. ✅ Alterações devem estar salvas

### 4️⃣ Testar Upload de Logo

1. Clique em **Escolher arquivo**
2. Selecione uma imagem (PNG, JPG ou JPEG)
3. ✅ Preview deve aparecer imediatamente
4. Clique em **Salvar Alterações**
5. Recarregue a página
6. ✅ Nova logo deve estar visível

### 5️⃣ Testar Permissões

1. Faça login como **Colaborador** (não admin/gerente)
2. Tente acessar `/configuracao-loja`
3. ✅ Deve conseguir VER os dados
4. Tente salvar alterações
5. ✅ Deve retornar erro 403 (Acesso negado)

---

## 🐛 Validações Implementadas

### Backend

✅ **Campos obrigatórios:**
- Nome, CNPJ, endereço, telefone, e-mail

✅ **CNPJ único:**
- Não permite duplicação
- Valida ao criar e editar

✅ **Apenas uma loja:**
- Não permite criar segunda loja
- Use PUT para atualizar

✅ **Upload de imagem:**
- Validação de tipo (imagens)
- Validação de tamanho (5MB)

### Frontend

✅ **Máscaras:**
- CNPJ: `00.000.000/0000-00`
- Telefone: `(00) 00000-0000`

✅ **Validação de arquivo:**
- Tipo: apenas imagens
- Tamanho: máximo 5MB
- Preview antes de enviar

✅ **Campos obrigatórios:**
- HTML5 validation (required)

✅ **Loading states:**
- Botão desabilitado durante salvamento
- Texto "Salvando..."

---

## 📂 Estrutura de Arquivos

### Backend

```
backend/src/
├── models/
│   └── lojaModels.js              ← Modelo Mongoose
├── repositories/
│   └── lojaRepository.js          ← Acesso ao banco
├── services/
│   └── lojaService.js             ← Lógica de negócio
├── controllers/
│   └── lojaControl.js             ← Controllers
├── routes/
│   └── lojaRout.js                ← Rotas da API
└── app.js                         ← Registro de rotas
```

### Frontend

```
frontend/src/
├── pages/
│   ├── ConfiguracaoLoja.jsx       ← Página de configuração
│   └── Gestao.jsx                 ← Link adicionado
└── routes/
    └── AppRoutes.jsx              ← Rota registrada
```

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────┐
│  Usuário acessa /gestao         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Clica em "Configurações da     │
│  Loja"                          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Frontend busca dados:          │
│  GET /api/loja                  │
└──────────────┬──────────────────┘
               │
               ├──> Loja existe?
               │    ├─> SIM: Preenche formulário
               │    └─> NÃO: Formulário vazio
               │
               ▼
┌─────────────────────────────────┐
│  Usuário preenche/edita campos  │
│  e seleciona logo (opcional)    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Clica em "Salvar Alterações"   │
└──────────────┬──────────────────┘
               │
               ├──> Loja existe?
               │    ├─> SIM: PUT /api/loja/:id
               │    └─> NÃO: POST /api/loja
               │
               ▼
┌─────────────────────────────────┐
│  Backend valida e salva         │
│  - Validações de campos         │
│  - Upload de logo (se houver)   │
│  - Salva no MongoDB             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Retorna sucesso                │
│  Frontend mostra notificação    │
└─────────────────────────────────┘
```

---

## ✅ Checklist de Implementação

### Backend
- [x] Modelo Loja criado
- [x] Repository com métodos CRUD
- [x] Service com validações
- [x] Controllers implementados
- [x] Rotas registradas
- [x] Upload de imagem configurado
- [x] Middlewares de autenticação
- [x] Sem erros de lint

### Frontend
- [x] Página ConfiguracaoLoja criada
- [x] Formulário completo
- [x] Upload de imagem com preview
- [x] Máscaras de CNPJ e telefone
- [x] Validações client-side
- [x] Notificações de sucesso/erro
- [x] Rota registrada
- [x] Link na página Gestão
- [x] Sem erros de lint

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Exibir dados da loja no rodapé**
   - Mostrar nome, telefone e endereço em todas as páginas

2. **Usar logo no Navbar**
   - Substituir texto "GESTÃO DE LOJA" pela logo

3. **Validação de CNPJ**
   - Validar dígitos verificadores

4. **Múltiplas lojas (futuro)**
   - Permitir cadastro de filiais
   - Seleção de loja ativa

5. **Histórico de alterações**
   - Registrar quem alterou e quando

---

## 📖 Exemplo de Uso

### Criar Loja via API (Postman/cURL)

```bash
curl -X POST http://localhost:7001/api/loja \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -F "nome=Loja do João" \
  -F "cnpj=12345678000190" \
  -F "endereco=Rua das Flores, 123" \
  -F "telefone=11987654321" \
  -F "email=contato@loja.com" \
  -F "logo=@/caminho/para/logo.jpg"
```

### Buscar Loja via API

```bash
curl http://localhost:7001/api/loja \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## ✅ Conclusão

O sistema de **Configuração da Loja** está **100% implementado e funcional**!

**Recursos principais:**
- ✅ CRUD completo de loja
- ✅ Upload de logo
- ✅ Controle de acesso (Gerente/Admin)
- ✅ Interface intuitiva
- ✅ Validações robustas
- ✅ Notificações de sucesso/erro

**Pronto para uso em produção!**

---

**Data de implementação:** 18 de Outubro de 2025  
**Status:** ✅ Completo


