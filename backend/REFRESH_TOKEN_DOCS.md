# Sistema de Refresh Token e Expiração Automática

## 📋 Visão Geral

Sistema completo de autenticação com **Access Token** e **Refresh Token** implementado com JWT.

### Características:
- ✅ Access Token com expiração curta (15 minutos padrão)
- ✅ Refresh Token com expiração longa (7 dias padrão)
- ✅ Refresh Tokens armazenados no banco de dados MongoDB
- ✅ Renovação automática de tokens
- ✅ Revogação de tokens no logout
- ✅ Segurança aprimorada com validação de tipo de token

---

## 🔧 Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=7d
```

**Formatos aceitos:**
- `s` - segundos (ex: `30s`)
- `m` - minutos (ex: `15m`)
- `h` - horas (ex: `24h`)
- `d` - dias (ex: `7d`)

---

## 🚀 Como Usar

### 1. Login

**Endpoint:** `POST /colaborador/login`

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Login realizado com sucesso",
  "data": {
    "id": "63f8d9a1b2c3e4f5a6b7c8d9",
    "nome": "João Silva",
    "email": "usuario@exemplo.com",
    "imagem": "foto.jpg",
    "cargo": "Colaborador",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Importante:**
- Salve o `accessToken` para usar nas requisições autenticadas
- Salve o `refreshToken` para renovar o access token quando expirar

---

### 2. Acessar Recursos Protegidos

Use o `accessToken` no header `Authorization`:

**Endpoint:** `GET /colaborador/oneColaborador/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "63f8d9a1b2c3e4f5a6b7c8d9",
    "nome": "João Silva",
    "email": "usuario@exemplo.com",
    "cargo": "Colaborador"
  }
}
```

**Response (Token Expirado):**
```json
{
  "success": false,
  "msg": "Access token expirado. Use o refresh token para renovar.",
  "error": "TOKEN_EXPIRED"
}
```

---

### 3. Renovar Access Token

Quando o `accessToken` expirar, use o `refreshToken` para obter um novo par de tokens:

**Endpoint:** `POST /colaborador/refresh-token`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "msg": "Tokens renovados com sucesso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Refresh Token Inválido/Expirado):**
```json
{
  "success": false,
  "msg": "Refresh token expirado. Faça login novamente.",
  "statusCode": 401
}
```

---

### 4. Logout

Revoga o refresh token (invalida a sessão):

**Endpoint:** `POST /colaborador/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "msg": "Logout realizado com sucesso"
}
```

---

## 🔐 Segurança

### Validações Implementadas

1. **Tipo de Token:**
   - Access Tokens não podem ser usados como Refresh Tokens
   - Refresh Tokens não podem ser usados para acessar recursos protegidos

2. **Armazenamento no Banco:**
   - Refresh Tokens são salvos no MongoDB
   - Comparação entre o token enviado e o armazenado
   - Tokens são removidos no logout

3. **Verificação de Expiração:**
   - JWT verifica expiração automaticamente
   - Data de expiração também armazenada no banco para validação extra

4. **Usuário Inativo:**
   - Tokens não são renovados se o usuário estiver inativo

---

## 🌊 Fluxo Completo

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ├──> Gera accessToken (15m)
       ├──> Gera refreshToken (7d)
       └──> Salva refreshToken no banco
              │
              ▼
       ┌──────────────┐
       │ Requisições  │
       │  Protegidas  │
       └──────┬───────┘
              │
              ├──> accessToken válido? ✅ Permitir
              │
              └──> accessToken expirado? ❌
                      │
                      ▼
               ┌──────────────────┐
               │ Renovar Token    │
               │ (refresh-token)  │
               └────────┬─────────┘
                        │
                        ├──> refreshToken válido? ✅ Novos tokens
                        │
                        └──> refreshToken expirado? ❌ Fazer login
                                │
                                ▼
                         ┌──────────────┐
                         │    Logout    │
                         │   Forçado    │
                         └──────────────┘
```

---

## 📝 Códigos de Erro

| Código | Erro | Descrição |
|--------|------|-----------|
| `TOKEN_EXPIRED` | 401 | Access token expirado - use refresh token |
| `INVALID_TOKEN` | 401 | Token inválido ou malformado |
| `INVALID_TOKEN_TYPE` | 401 | Tentou usar refresh token onde access token é necessário |
| `AUTH_ERROR` | 500 | Erro genérico de autenticação |

---

## 🧪 Testando

### Exemplo de Teste Manual

1. **Fazer Login:**
```bash
curl -X POST http://localhost:7001/colaborador/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

2. **Acessar Recurso Protegido:**
```bash
curl -X GET http://localhost:7001/colaborador/oneColaborador/ID \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

3. **Renovar Token:**
```bash
curl -X POST http://localhost:7001/colaborador/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"SEU_REFRESH_TOKEN"}'
```

4. **Fazer Logout:**
```bash
curl -X POST http://localhost:7001/colaborador/logout \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## 🔄 Integração com Frontend

### Exemplo de Interceptor (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7001'
});

// Adiciona access token nas requisições
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Intercepta respostas para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o token expirou e não é uma tentativa de retry
    if (error.response?.data?.error === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        const { data } = await axios.post(
          'http://localhost:7001/colaborador/refresh-token',
          { refreshToken }
        );

        // Salvar novos tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Atualizar o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        // Repetir a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expirado - redirecionar para login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 📚 Arquivos Modificados/Criados

### Novos Arquivos:
- `backend/src/utils/tokenUtils.js` - Utilitários para geração e validação de tokens

### Arquivos Modificados:
- `backend/src/models/colaboradorModels.js` - Adicionado campos `refreshToken` e `refreshTokenExpiry`
- `backend/src/config/config.js` - Adicionado configurações de expiração
- `backend/src/services/colaboradorService.js` - Métodos `login()`, `refreshToken()`, `logout()`
- `backend/src/controllers/colaboradorControl.js` - Controllers `refreshToken` e `logoutColaborador`
- `backend/src/routes/colaboradorRout.js` - Rotas `/refresh-token` e `/logout`
- `backend/src/middlewares/authMiddleware.js` - Validação melhorada com códigos de erro

---

## ✅ Checklist de Implementação

- [x] Modelo atualizado com campos de refresh token
- [x] Função `generateTokens()` criada
- [x] Configuração de variáveis de ambiente
- [x] Método de login retorna ambos os tokens
- [x] Refresh tokens salvos no banco
- [x] Rota `/refresh-token` implementada
- [x] Rota `/logout` implementada
- [x] Middleware atualizado com validações
- [x] Tratamento de erros aprimorado
- [x] Documentação completa

---

## 🎯 Próximos Passos

1. Configure as variáveis de ambiente no `.env`
2. Teste o fluxo completo de autenticação
3. Implemente o interceptor no frontend
4. Ajuste os tempos de expiração conforme necessidade
5. Considere adicionar rate limiting para as rotas de autenticação

---

**Desenvolvido com ❤️ para CRUD2025**

