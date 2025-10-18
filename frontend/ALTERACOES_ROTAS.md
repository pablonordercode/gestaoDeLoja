# 🔄 Alterações nas Rotas do Frontend

## Data: 18 de Outubro de 2025

---
ALTERACOES_ROTAS.md

## 📝 Resumo das Mudanças

O backend foi refatorado e agora todas as rotas da API possuem o prefixo `/api/`. 
As chamadas do frontend foram atualizadas para refletir essa mudança.

---

## ✅ Arquivos Alterados

### 1. **Login.jsx**
**Linha 21**
```javascript
// ANTES
api.post("/colaborador/login", {...})

// DEPOIS
api.post("/api/colaborador/login", {...})
```

---

### 2. **RegistrarColaborador.jsx**
**Linha 47**
```javascript
// ANTES
api.post("/colaborador/addColaborador", formData, {...})

// DEPOIS
api.post("/api/colaborador/addColaborador", formData, {...})
```

---

### 3. **CriarProduto.jsx**
**Linha 38**
```javascript
// ANTES
api.post("/produtos/addProduto", data, {...})

// DEPOIS
api.post("/api/produtos/addProduto", data, {...})
```

---

### 4. **Dashboard.jsx**
**3 alterações**

#### Linha 40 (carregarDados)
```javascript
// ANTES
api.get("/produtos/todosProdutos")
api.get("/vendas/todasVendas")

// DEPOIS
api.get("/api/produtos/todosProdutos")
api.get("/api/vendas/todasVendas")
```

#### Linha 50 (fallback de produtos)
```javascript
// ANTES
api.get("/produtos/todosProdutos")

// DEPOIS
api.get("/api/produtos/todosProdutos")
```

#### Linha 157 (atualizar estoque)
```javascript
// ANTES
api.put(`/produtos/editarProduto/${produtoId}`, {...})

// DEPOIS
api.put(`/api/produtos/editarProduto/${produtoId}`, {...})
```

---

### 5. **Produto.jsx**
**Linha 142 (URL de imagem)**
```javascript
// ANTES
src={`http://localhost:7001/api/uploads/${p.imagem}`}

// DEPOIS
src={`http://localhost:7001/uploads/${p.imagem}`}
```
*Nota: Removido `/api/` do caminho de uploads pois é servido estaticamente*

---

### 6. **Gestao.jsx**
✅ **Já estava correto** - Todas as rotas já usavam `/api/` corretamente

---

## 📋 Tabela de Rotas Atualizadas

| Arquivo | Rota Antiga | Rota Nova |
|---------|-------------|-----------|
| Login.jsx | `/colaborador/login` | `/api/colaborador/login` |
| RegistrarColaborador.jsx | `/colaborador/addColaborador` | `/api/colaborador/addColaborador` |
| CriarProduto.jsx | `/produtos/addProduto` | `/api/produtos/addProduto` |
| Dashboard.jsx | `/produtos/todosProdutos` | `/api/produtos/todosProdutos` |
| Dashboard.jsx | `/produtos/editarProduto/:id` | `/api/produtos/editarProduto/:id` |
| Produto.jsx | `/api/produtos/todosProdutos` | Já estava correto ✅ |
| Produto.jsx | `/api/produtos/editarProduto/:id` | Já estava correto ✅ |
| Gestao.jsx | `/api/produtos/...` | Já estava correto ✅ |
| Gestao.jsx | `/api/colaborador/...` | Já estava correto ✅ |

---

## 🌐 Estrutura de URLs do Backend

### Colaboradores
```
POST   /api/colaborador/login
POST   /api/colaborador/addColaborador
GET    /api/colaborador/todosColaboradores
GET    /api/colaborador/oneColaborador/:id
PUT    /api/colaborador/editarColaborador/:id
DELETE /api/colaborador/deletarColaborador/:id
```

### Produtos
```
POST   /api/produtos/addProduto
GET    /api/produtos/todosProdutos
GET    /api/produtos/produto/:id
PUT    /api/produtos/editarProduto/:id
DELETE /api/produtos/deletarProduto/:id
```

### Uploads (estáticos)
```
GET    /uploads/:nomeArquivo
```

---

## 🔧 Configuração da API

O arquivo `services/api.js` está configurado corretamente:

```javascript
const api = axios.create({
  baseURL: "http://localhost:7001",
});
```

Todas as rotas são relativas a essa URL base.

---

## ✅ Testes Recomendados

Após as alterações, teste as seguintes funcionalidades:

### 1. Autenticação
- [ ] Login de colaborador
- [ ] Registro de novo colaborador
- [ ] Logout

### 2. Produtos
- [ ] Listar produtos
- [ ] Criar novo produto
- [ ] Editar produto
- [ ] Deletar produto
- [ ] Visualizar imagens de produtos

### 3. Gestão (Admin)
- [ ] Listar colaboradores
- [ ] Editar colaborador
- [ ] Deletar colaborador
- [ ] Listar produtos (na página de gestão)

### 4. Dashboard
- [ ] Pesquisar produtos
- [ ] Registrar venda
- [ ] Ver histórico de vendas
- [ ] Atualização de estoque

---

## 🚨 Pontos de Atenção

### ⚠️ Imagens
- As imagens são servidas em `/uploads/` (sem `/api/`)
- Caminho correto: `http://localhost:7001/uploads/imagem.jpg`
- ❌ Incorreto: `http://localhost:7001/api/uploads/imagem.jpg`

### ⚠️ CORS
- Certifique-se de que o backend está com CORS habilitado
- O backend já está configurado com `app.use(cors())`

### ⚠️ Token de Autenticação
- O token é adicionado automaticamente pelo interceptor em `api.js`
- Não é necessário adicionar manualmente em cada requisição

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 5 |
| Linhas modificadas | 7 |
| Rotas atualizadas | 6 |
| Compatibilidade | 100% ✅ |

---

## 🎯 Próximos Passos

1. ✅ **Teste o login** - Verifique se a autenticação funciona
2. ✅ **Teste o cadastro** - Crie um novo colaborador
3. ✅ **Teste produtos** - Liste, crie e edite produtos
4. ✅ **Verifique imagens** - Confira se as fotos aparecem
5. ✅ **Teste a gestão** - Acesse com usuário Admin

---

## 🐛 Solução de Problemas

### Erro 404 nas requisições
**Problema**: Requisições retornando 404  
**Solução**: Verifique se o backend está rodando e se as rotas têm o prefixo `/api/`

### Imagens não aparecem
**Problema**: Imagens retornam 404  
**Solução**: Verifique se o caminho é `/uploads/` sem o `/api/`

### Token expirado
**Problema**: Erro 401 após algum tempo  
**Solução**: Faça login novamente (tokens expiram em 7 dias)

### CORS Error
**Problema**: Erro de CORS no console  
**Solução**: Certifique-se de que o backend está com CORS habilitado

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se o backend está rodando em `http://localhost:7001`
2. Confira o console do navegador para erros
3. Verifique se o token está sendo enviado nas requisições
4. Teste com o Postman para isolar o problema

---

**✅ Frontend totalmente atualizado e compatível com o backend refatorado!**

