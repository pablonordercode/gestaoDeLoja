# 🖼️ Correção de Upload de Imagens

## ❌ Problema Identificado

As imagens dos produtos não estavam aparecendo devido a um problema de **caminho relativo**.

---

## 🔍 Causa do Problema

### Estrutura de Pastas
```
backend/
├── src/
│   ├── app.js              ← Servidor inicia aqui
│   ├── middlewares/
│   │   └── imagemUPL.js    ← Configuração do Multer
│   └── ...
└── uploads/                ← Pasta de destino
    └── .gitkeep
```

### O que estava errado

1. **app.js (linha 14)**:
```javascript
// ❌ ERRADO - Procurava em backend/src/uploads/
app.use('/uploads', express.static('uploads'));
```

2. **imagemUPL.js (linha 7)**:
```javascript
// ❌ ERRADO - Tentava salvar em backend/src/uploads/
destination: (req, file, cb) => {
    cb(null, "uploads/");
}
```

**Resultado**: Arquivos eram salvos/servidos no caminho errado!

---

## ✅ Solução Aplicada

### 1. Corrigido `app.js`

```javascript
const path = require("path");

// ✅ CORRETO - Caminho absoluto
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**Explicação**:
- `__dirname` = `/backend/src/`
- `path.join(__dirname, '../uploads')` = `/backend/uploads/`

---

### 2. Corrigido `imagemUPL.js`

```javascript
const path = require("path");

// ✅ CORRETO - Caminho absoluto
const uploadPath = path.join(__dirname, '../../uploads');

const imagemStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    // ...
});
```

**Explicação**:
- `__dirname` = `/backend/src/middlewares/`
- `path.join(__dirname, '../../uploads')` = `/backend/uploads/`

---

## 🧪 Como Testar

### 1. **Reinicie o Servidor Backend**

```bash
cd backend
npm run dev
```

Você deve ver:
```
╔════════════════════════════════════════╗
║  🚀 Servidor rodando na porta 7001     ║
║  📊 MongoDB conectado com sucesso      ║
╚════════════════════════════════════════╝
```

### 2. **Teste Upload via Frontend**

#### A. Criar um Produto
1. Acesse o frontend
2. Vá em "Produtos" → "Adicionar Produto"
3. Preencha todos os campos
4. **Selecione uma imagem** (.jpg ou .png)
5. Clique em "Salvar Produto"

#### B. Criar um Colaborador
1. Acesse "Registrar Colaborador"
2. Preencha os dados
3. **Selecione uma foto de perfil**
4. Clique em "Registrar"

### 3. **Verifique os Uploads**

```bash
# Ver arquivos na pasta uploads
dir uploads
# ou
ls uploads
```

Você deve ver arquivos como:
```
1697654321123.jpg
1697654400456.png
```

### 4. **Teste Visualização**

#### Via Navegador
Abra diretamente no navegador:
```
http://localhost:7001/uploads/NOME_DO_ARQUIVO.jpg
```

#### Via Frontend
- As imagens devem aparecer automaticamente nas listas de produtos
- As fotos de perfil devem aparecer na gestão de colaboradores

---

## 🔧 Teste Manual no Postman

### 1. Upload de Produto

**POST** `http://localhost:7001/api/produtos/addProduto`

**Headers**:
```
Authorization: Bearer SEU_TOKEN
```

**Body** (form-data):
```
nome: Notebook Test
descricao: Teste de upload
preco: 1000
quantidade: 5
categoria: Eletrônicos
fornecedor: Test Inc
imagem: [SELECIONE UM ARQUIVO]
```

### 2. Verificar a Imagem

**GET** `http://localhost:7001/uploads/NOME_DO_ARQUIVO.jpg`

A imagem deve abrir diretamente no navegador.

---

## 📊 Fluxo de Upload

```
1. Frontend envia arquivo
   ↓
2. Backend recebe em /api/produtos/addProduto
   ↓
3. Multer salva em backend/uploads/
   Nome: timestamp + random + extensão
   ↓
4. Nome do arquivo é salvo no MongoDB
   ↓
5. Frontend acessa via /uploads/arquivo.jpg
   ↓
6. Express serve de backend/uploads/
```

---

## 🌐 URLs de Acesso

| Tipo | URL | Descrição |
|------|-----|-----------|
| Upload API | `http://localhost:7001/api/produtos/addProduto` | Enviar produto com imagem |
| Arquivo Estático | `http://localhost:7001/uploads/arquivo.jpg` | Acessar imagem diretamente |
| Produto na API | `http://localhost:7001/api/produtos/produto/:id` | Dados incluem campo `imagem` |

---

## 🐛 Solução de Problemas

### Problema 1: Imagem não aparece no frontend
**Sintoma**: Console mostra erro 404 ao carregar imagem

**Solução**:
1. Verifique se o arquivo existe:
```bash
dir backend\uploads
```

2. Teste o acesso direto:
```
http://localhost:7001/uploads/NOME_DO_ARQUIVO.jpg
```

3. Verifique o console do backend para erros

---

### Problema 2: Erro ao fazer upload
**Sintoma**: Erro ao tentar criar produto/colaborador com imagem

**Solução**:
1. Verifique se a pasta `backend/uploads` existe
2. Verifique as permissões da pasta
3. Certifique-se de que está enviando um arquivo .jpg ou .png
4. Verifique se o token de autenticação está válido

---

### Problema 3: Pasta uploads não existe
**Solução**:
```bash
# Criar a pasta manualmente
mkdir backend/uploads
```

A pasta já deve ter o arquivo `.gitkeep` que foi criado anteriormente.

---

## ✅ Checklist de Verificação

- [ ] Pasta `backend/uploads` existe
- [ ] Servidor backend reiniciado após as mudanças
- [ ] Upload de produto funciona
- [ ] Upload de colaborador funciona
- [ ] Imagens aparecem na lista de produtos
- [ ] Fotos aparecem na gestão de colaboradores
- [ ] Acesso direto via URL funciona

---

## 📝 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `backend/src/app.js` | Caminho absoluto para servir uploads | ✅ |
| `backend/src/middlewares/imagemUPL.js` | Caminho absoluto para salvar uploads | ✅ |

---

## 🎯 Resultado Esperado

### Frontend - Lista de Produtos
```
┌──────────┬────────────┬─────────┐
│  Foto    │   Nome     │  Preço  │
├──────────┼────────────┼─────────┤
│ [IMG] 📷 │ Notebook   │ R$ 3500 │
│ [IMG] 📷 │ Mouse      │ R$ 50   │
└──────────┴────────────┴─────────┘
```

### Backend - Resposta da API
```json
{
  "success": true,
  "data": {
    "_id": "67123abc...",
    "nome": "Notebook",
    "preco": 3500,
    "imagem": "1697654321123.jpg",  ← Nome do arquivo
    ...
  }
}
```

### URL da Imagem no Frontend
```javascript
`http://localhost:7001/uploads/${produto.imagem}`
```

---

## 🎉 Conclusão

As correções garantem que:
- ✅ Uploads são salvos em `backend/uploads/`
- ✅ Arquivos são servidos corretamente em `/uploads/`
- ✅ Caminhos absolutos evitam problemas de execução
- ✅ Frontend acessa imagens sem erros 404

**Agora as imagens devem aparecer corretamente! 🖼️**

