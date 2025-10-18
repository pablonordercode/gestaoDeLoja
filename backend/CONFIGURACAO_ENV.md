# ⚙️ Configuração de Variáveis de Ambiente

## 📝 Variáveis Necessárias para Refresh Token

Adicione as seguintes variáveis no seu arquivo `.env` na pasta `backend`:

```env
# Configurações JWT para Refresh Token
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=7d
```

---

## 🔑 Descrição das Variáveis

### JWT_SECRET
- **Descrição:** Chave secreta para assinar os tokens JWT
- **Tipo:** String
- **Exemplo:** `minha_chave_super_secreta_123456`
- **⚠️ Importante:** Use uma chave longa e aleatória em produção

### JWT_ACCESS_EXP
- **Descrição:** Tempo de expiração do Access Token
- **Tipo:** String no formato: `número` + `unidade`
- **Unidades:** `s` (segundos), `m` (minutos), `h` (horas), `d` (dias)
- **Padrão:** `15m` (15 minutos)
- **Exemplos:**
  - `30s` - 30 segundos
  - `15m` - 15 minutos
  - `1h` - 1 hora
  - `24h` - 24 horas

### JWT_REFRESH_EXP
- **Descrição:** Tempo de expiração do Refresh Token
- **Tipo:** String no formato: `número` + `unidade`
- **Padrão:** `7d` (7 dias)
- **Exemplos:**
  - `12h` - 12 horas
  - `1d` - 1 dia
  - `7d` - 7 dias
  - `30d` - 30 dias

---

## 📋 Exemplo Completo de .env

```env
# Servidor
PORT=7001
NODE_ENV=development

# Banco de dados MongoDB
DBUSER=seu_usuario_mongodb
DBPASS=sua_senha_mongodb
DB_CLUSTER=cluster0.v21wi.mongodb.net
DB_NAME=crud2025

# JWT - Configurações de Autenticação
JWT_SECRET=minha_chave_super_secreta_para_jwt_123456789
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Upload
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=*
```

---

## 🔒 Recomendações de Segurança

### JWT_SECRET em Produção

1. **Use um gerador de chaves aleatórias:**
```bash
# Linux/Mac
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

2. **Nunca commite o .env no Git:**
   - Certifique-se que `.env` está no `.gitignore`

3. **Use variáveis de ambiente do servidor:**
   - Em produção, configure as variáveis diretamente no servidor/cloud

---

## ⏱️ Recomendações de Tempo de Expiração

### Desenvolvimento
```env
JWT_ACCESS_EXP=1h    # Facilita testes
JWT_REFRESH_EXP=30d  # Evita relogins constantes
```

### Produção - Alta Segurança
```env
JWT_ACCESS_EXP=5m    # Muito curto, máxima segurança
JWT_REFRESH_EXP=1d   # Requer login diário
```

### Produção - Balanceado (Recomendado)
```env
JWT_ACCESS_EXP=15m   # Bom equilíbrio
JWT_REFRESH_EXP=7d   # Login semanal
```

### Produção - Conveniência
```env
JWT_ACCESS_EXP=1h    # Menos renovações
JWT_REFRESH_EXP=30d  # Login mensal
```

---

## ✅ Checklist de Configuração

- [ ] Criar arquivo `.env` na pasta `backend`
- [ ] Adicionar `JWT_SECRET` com chave segura
- [ ] Configurar `JWT_ACCESS_EXP` (recomendado: `15m`)
- [ ] Configurar `JWT_REFRESH_EXP` (recomendado: `7d`)
- [ ] Verificar que `.env` está no `.gitignore`
- [ ] Testar login e verificar retorno dos tokens
- [ ] Testar renovação de token
- [ ] Testar logout

---

## 🧪 Testando a Configuração

### 1. Verificar se as variáveis foram carregadas

Adicione um log temporário no `config.js`:

```javascript
console.log({
    accessExp: process.env.JWT_ACCESS_EXP,
    refreshExp: process.env.JWT_REFRESH_EXP,
    secretConfigured: !!process.env.JWT_SECRET
});
```

### 2. Testar o Login

```bash
curl -X POST http://localhost:7001/colaborador/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@exemplo.com",
    "password": "sua_senha"
  }'
```

Verifique se a resposta contém:
- ✅ `accessToken`
- ✅ `refreshToken`

### 3. Verificar Expiração do Access Token

Aguarde o tempo configurado em `JWT_ACCESS_EXP` e tente acessar um recurso protegido.

Deve retornar:
```json
{
  "success": false,
  "msg": "Access token expirado. Use o refresh token para renovar.",
  "error": "TOKEN_EXPIRED"
}
```

### 4. Testar Renovação

```bash
curl -X POST http://localhost:7001/colaborador/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
  }'
```

Deve retornar novos tokens.

---

## 🚨 Problemas Comuns

### 1. "JWT_SECRET não configurado"
- **Causa:** Variável `JWT_SECRET` não está no `.env`
- **Solução:** Adicione `JWT_SECRET=sua_chave` no `.env`

### 2. Tokens não expiram no tempo esperado
- **Causa:** Variáveis `JWT_ACCESS_EXP` ou `JWT_REFRESH_EXP` não carregadas
- **Solução:** Verifique se o formato está correto (`15m`, `7d`, etc.)

### 3. "Token inválido" logo após login
- **Causa:** `JWT_SECRET` diferente entre geração e validação
- **Solução:** Reinicie o servidor após alterar o `.env`

### 4. Refresh token não funciona
- **Causa:** MongoDB não está salvando o token
- **Solução:** Verifique conexão com o banco e modelo atualizado

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Teste com Postman ou Insomnia
3. Consulte `REFRESH_TOKEN_DOCS.md` para mais detalhes
4. Verifique se o MongoDB está conectado

---

**Última atualização:** Outubro 2025

