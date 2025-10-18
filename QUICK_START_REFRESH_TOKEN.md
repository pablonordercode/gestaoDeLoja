# ⚡ Quick Start - Sistema de Refresh Token

## 🚀 Começar em 3 Passos

### 1️⃣ Configurar Backend (2 minutos)

```bash
# 1. Adicione no backend/.env
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=7d

# 2. Reinicie o servidor
cd backend
npm run dev
```

### 2️⃣ Atualizar Frontend (5 minutos)

```bash
# Substitua o arquivo frontend/src/services/api.js
# Use o código em: frontend/EXEMPLO_API_REFRESH_TOKEN.js
```

### 3️⃣ Testar

```bash
# 1. Faça login
# 2. Verifique no DevTools → Application → Local Storage:
#    - accessToken ✓
#    - refreshToken ✓
```

---

## 📚 Documentação Completa

### Backend
- **RESUMO_IMPLEMENTACAO_REFRESH_TOKEN.md** - Visão geral completa
- **REFRESH_TOKEN_DOCS.md** - Documentação detalhada da API
- **CONFIGURACAO_ENV.md** - Guia de variáveis de ambiente
- **POSTMAN_REFRESH_TOKEN.md** - Testes com Postman

### Frontend
- **FRONTEND_INTEGRATION.md** - Guia de integração frontend
- **EXEMPLO_API_REFRESH_TOKEN.js** - Código pronto do api.js

---

## 🎯 O Que Foi Implementado

✅ Access Token (15 min) + Refresh Token (7 dias)  
✅ Renovação automática de tokens  
✅ Logout com revogação de token  
✅ Armazenamento seguro no MongoDB  
✅ Middleware atualizado  
✅ Documentação completa  

---

## 🔐 Novas Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/colaborador/login` | POST | Login (retorna 2 tokens) |
| `/colaborador/refresh-token` | POST | Renovar tokens |
| `/colaborador/logout` | POST | Logout (revoga token) |

---

## 📊 Resposta do Login

```json
{
  "success": true,
  "data": {
    "id": "...",
    "nome": "...",
    "email": "...",
    "cargo": "...",
    "accessToken": "eyJhbGci...",  ← NOVO
    "refreshToken": "eyJhbGci..."  ← NOVO
  }
}
```

---

## ⚙️ Configurações Recomendadas

### Desenvolvimento
```env
JWT_ACCESS_EXP=1h
JWT_REFRESH_EXP=30d
```

### Produção
```env
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=7d
```

### Testes Rápidos
```env
JWT_ACCESS_EXP=30s
JWT_REFRESH_EXP=5m
```

---

## 🧪 Teste Rápido

```bash
# 1. Login
curl -X POST http://localhost:7001/colaborador/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}'

# Copie o refreshToken da resposta

# 2. Renovar Token
curl -X POST http://localhost:7001/colaborador/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"COLE_AQUI"}'
```

---

## ✅ Checklist Rápido

**Backend:**
- [ ] Adicionou variáveis no `.env`
- [ ] Reiniciou o servidor
- [ ] Testou login (retorna 2 tokens)

**Frontend:**
- [ ] Atualizou `api.js`
- [ ] Atualizou página de login
- [ ] Testou renovação automática

---

## 🐛 Problema?

1. Verifique se as variáveis estão no `.env`
2. Reinicie o servidor backend
3. Limpe o localStorage do navegador
4. Consulte `CONFIGURACAO_ENV.md` para troubleshooting

---

## 📞 Arquivos Importantes

```
backend/
  ├── RESUMO_IMPLEMENTACAO_REFRESH_TOKEN.md  ← Comece aqui
  ├── REFRESH_TOKEN_DOCS.md                 ← Documentação completa
  ├── CONFIGURACAO_ENV.md                    ← Guia de configuração
  └── POSTMAN_REFRESH_TOKEN.md              ← Testes

frontend/
  ├── FRONTEND_INTEGRATION.md                ← Integração frontend
  └── EXEMPLO_API_REFRESH_TOKEN.js          ← Código pronto
```

---

**Tudo pronto! 🎉**

Sistema de Refresh Token 100% funcional.

