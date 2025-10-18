# 🧪 Testes Postman - Sistema de Refresh Token

## 📦 Collection: Autenticação com Refresh Token

### Variáveis da Collection

Configure as seguintes variáveis na collection:

| Variável | Valor Inicial | Descrição |
|----------|---------------|-----------|
| `baseUrl` | `http://localhost:7001` | URL base da API |
| `accessToken` | - | Será preenchido automaticamente |
| `refreshToken` | - | Será preenchido automaticamente |
| `userId` | - | ID do usuário logado |

---

## 🔐 1. Login

### Request

```
POST {{baseUrl}}/colaborador/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@exemplo.com",
  "password": "senha123"
}
```

### Response Esperado (200 OK)

```json
{
  "success": true,
  "msg": "Login realizado com sucesso",
  "data": {
    "id": "63f8d9a1b2c3e4f5a6b7c8d9",
    "nome": "Admin User",
    "email": "admin@exemplo.com",
    "imagem": "foto.jpg",
    "cargo": "Administrador",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Scripts de Teste (Tests tab)

```javascript
// Salvar tokens nas variáveis da collection
if (pm.response.code === 200) {
    const responseData = pm.response.json();
    
    pm.collectionVariables.set("accessToken", responseData.data.accessToken);
    pm.collectionVariables.set("refreshToken", responseData.data.refreshToken);
    pm.collectionVariables.set("userId", responseData.data.id);
    
    pm.test("Status code is 200", () => {
        pm.response.to.have.status(200);
    });
    
    pm.test("Response has accessToken", () => {
        pm.expect(responseData.data.accessToken).to.exist;
    });
    
    pm.test("Response has refreshToken", () => {
        pm.expect(responseData.data.refreshToken).to.exist;
    });
    
    console.log("✅ Access Token salvo:", responseData.data.accessToken);
    console.log("✅ Refresh Token salvo:", responseData.data.refreshToken);
}
```

---

## 🔑 2. Acessar Recurso Protegido

### Request

```
GET {{baseUrl}}/colaborador/oneColaborador/{{userId}}
```

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

### Response Esperado (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "63f8d9a1b2c3e4f5a6b7c8d9",
    "nome": "Admin User",
    "email": "admin@exemplo.com",
    "cargo": "Administrador",
    "ativo": true
  }
}
```

### Response (Token Expirado - 401)

```json
{
  "success": false,
  "msg": "Access token expirado. Use o refresh token para renovar.",
  "error": "TOKEN_EXPIRED"
}
```

### Scripts de Teste

```javascript
pm.test("Status code is 200 or 401", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 401]);
});

if (pm.response.code === 401) {
    const responseData = pm.response.json();
    
    pm.test("Error is TOKEN_EXPIRED", () => {
        pm.expect(responseData.error).to.equal("TOKEN_EXPIRED");
    });
    
    console.log("⚠️ Access Token expirado! Use a requisição 'Renovar Token'");
}

if (pm.response.code === 200) {
    pm.test("Response has user data", () => {
        const data = pm.response.json().data;
        pm.expect(data).to.have.property("id");
        pm.expect(data).to.have.property("nome");
        pm.expect(data).to.have.property("email");
    });
}
```

---

## 🔄 3. Renovar Token (Refresh Token)

### Request

```
POST {{baseUrl}}/colaborador/refresh-token
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### Response Esperado (200 OK)

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

### Response (Refresh Token Inválido - 401)

```json
{
  "success": false,
  "msg": "Refresh token expirado. Faça login novamente.",
  "statusCode": 401
}
```

### Scripts de Teste

```javascript
if (pm.response.code === 200) {
    const responseData = pm.response.json();
    
    // Atualizar tokens salvos
    pm.collectionVariables.set("accessToken", responseData.data.accessToken);
    pm.collectionVariables.set("refreshToken", responseData.data.refreshToken);
    
    pm.test("Status code is 200", () => {
        pm.response.to.have.status(200);
    });
    
    pm.test("New accessToken received", () => {
        pm.expect(responseData.data.accessToken).to.exist;
    });
    
    pm.test("New refreshToken received", () => {
        pm.expect(responseData.data.refreshToken).to.exist;
    });
    
    console.log("✅ Tokens renovados com sucesso!");
    console.log("✅ Novo Access Token:", responseData.data.accessToken);
}

if (pm.response.code === 401) {
    console.log("❌ Refresh Token expirado! Faça login novamente.");
}
```

---

## 🚪 4. Logout

### Request

```
POST {{baseUrl}}/colaborador/logout
```

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

### Response Esperado (200 OK)

```json
{
  "success": true,
  "msg": "Logout realizado com sucesso"
}
```

### Scripts de Teste

```javascript
if (pm.response.code === 200) {
    // Limpar tokens salvos
    pm.collectionVariables.set("accessToken", "");
    pm.collectionVariables.set("refreshToken", "");
    pm.collectionVariables.set("userId", "");
    
    pm.test("Status code is 200", () => {
        pm.response.to.have.status(200);
    });
    
    pm.test("Logout successful", () => {
        const data = pm.response.json();
        pm.expect(data.msg).to.include("sucesso");
    });
    
    console.log("✅ Logout realizado! Tokens removidos.");
}
```

---

## 🧪 5. Testar Token Revogado (após Logout)

### Request

```
POST {{baseUrl}}/colaborador/refresh-token
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### Response Esperado (401 Unauthorized)

```json
{
  "success": false,
  "msg": "Refresh token inválido",
  "statusCode": 401
}
```

### Scripts de Teste

```javascript
pm.test("Status code is 401", () => {
    pm.response.to.have.status(401);
});

pm.test("Refresh token was revoked", () => {
    const data = pm.response.json();
    pm.expect(data.success).to.be.false;
});

console.log("✅ Token revogado corretamente!");
```

---

## 🔬 6. Testar Uso de Refresh Token em Rota Protegida

### Request

```
GET {{baseUrl}}/colaborador/oneColaborador/{{userId}}
```

**Headers:**
```
Authorization: Bearer {{refreshToken}}
```

### Response Esperado (401 Unauthorized)

```json
{
  "success": false,
  "msg": "Token inválido. Use o access token para acessar recursos protegidos.",
  "error": "INVALID_TOKEN_TYPE"
}
```

### Scripts de Teste

```javascript
pm.test("Status code is 401", () => {
    pm.response.to.have.status(401);
});

pm.test("Error is INVALID_TOKEN_TYPE", () => {
    const data = pm.response.json();
    pm.expect(data.error).to.equal("INVALID_TOKEN_TYPE");
});

console.log("✅ Validação de tipo de token funcionando!");
```

---

## 📊 Fluxo de Teste Completo

### Ordem Recomendada:

1. **Login** → Salva tokens
2. **Acessar Recurso Protegido** → Usa accessToken
3. **Aguardar Expiração** (ou usar token expirado manualmente)
4. **Renovar Token** → Obtém novos tokens
5. **Acessar Recurso Protegido** novamente → Com novo accessToken
6. **Logout** → Revoga refresh token
7. **Testar Token Revogado** → Deve falhar
8. **Testar Refresh Token em Rota Protegida** → Deve falhar

---

## ⏱️ Teste de Expiração Rápida (para desenvolvimento)

Para testar rapidamente a expiração, configure no `.env`:

```env
JWT_ACCESS_EXP=30s   # Expira em 30 segundos
JWT_REFRESH_EXP=5m   # Expira em 5 minutos
```

**Passos:**
1. Faça login
2. Aguarde 30 segundos
3. Tente acessar recurso protegido → deve retornar `TOKEN_EXPIRED`
4. Renove o token → deve funcionar
5. Aguarde 5 minutos
6. Tente renovar novamente → deve falhar

---

## 🎯 Cenários de Teste

### ✅ Cenário 1: Fluxo Normal
```
Login → Access → Expiração → Refresh → Access → Logout
```

### ✅ Cenário 2: Token Expirado
```
Login → Aguardar expiração → Access (falha) → Refresh → Access (sucesso)
```

### ✅ Cenário 3: Refresh Token Expirado
```
Login → Aguardar muito tempo → Refresh (falha) → Login novamente
```

### ✅ Cenário 4: Logout e Tentativa de Uso
```
Login → Logout → Refresh (falha) → Access (falha)
```

### ✅ Cenário 5: Tipo de Token Incorreto
```
Login → Usar refreshToken em rota protegida (falha)
```

---

## 📥 Importar para Postman

### JSON da Collection

```json
{
  "info": {
    "name": "Refresh Token - CRUD2025",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:7001"
    },
    {
      "key": "accessToken",
      "value": ""
    },
    {
      "key": "refreshToken",
      "value": ""
    },
    {
      "key": "userId",
      "value": ""
    }
  ]
}
```

1. Abra o Postman
2. Clique em "Import"
3. Cole o JSON acima
4. Configure as requisições conforme documentado

---

## 🐛 Debugging

### Ver payload do token (JWT.io)

Copie qualquer token e cole em https://jwt.io para ver:
- Payload (dados do usuário)
- Tempo de expiração (`exp`)
- Tipo de token (`type`)

### Console do Postman

Use `console.log()` nos scripts de teste para debug:

```javascript
console.log("Token:", pm.collectionVariables.get("accessToken"));
console.log("Response:", pm.response.json());
```

---

## ✅ Checklist de Validações

- [ ] Login retorna `accessToken` e `refreshToken`
- [ ] Access token funciona em rotas protegidas
- [ ] Access token expira no tempo configurado
- [ ] Refresh token renova os tokens
- [ ] Refresh token expira no tempo configurado
- [ ] Logout revoga o refresh token
- [ ] Refresh token revogado não funciona
- [ ] Não é possível usar refresh token em rotas protegidas
- [ ] Não é possível usar access token na rota de refresh
- [ ] Usuário inativo não consegue renovar token

---

**Happy Testing! 🚀**

