# 🎨 Integração Frontend - Sistema de Refresh Token

## 📋 Visão Geral

Guia completo para integrar o sistema de Refresh Token no frontend React.

---

## 🔧 Passo 1: Atualizar o Serviço de API

### Substituir `frontend/src/services/api.js`

Substitua o conteúdo atual pelo código em `EXEMPLO_API_REFRESH_TOKEN.js`

Ou copie diretamente:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7001",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const errorCode = error.response.data?.error;

      if (errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const { data } = await axios.post(
            "http://localhost:7001/colaborador/refresh-token",
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("usuario");
          
          window.location.href = "/login";
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (errorCode !== 'TOKEN_EXPIRED') {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📝 Passo 2: Atualizar a Página de Login

### Localização: `frontend/src/pages/Login.jsx`

**Encontre a função de login** e atualize para salvar ambos os tokens:

#### ❌ Antes:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post('/colaborador/login', {
      email,
      password
    });

    const { token, ...userData } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

#### ✅ Depois:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post('/colaborador/login', {
      email,
      password
    });

    const { accessToken, refreshToken, ...userData } = response.data.data;
    
    // Salvar ambos os tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Erro no login:', error);
    // Adicionar notificação de erro se necessário
  }
};
```

---

## 🚪 Passo 3: Implementar Logout Adequado

### Criar função de logout que revoga o token

```javascript
// Pode ser em um hook ou componente
const handleLogout = async () => {
  try {
    // Chamar rota de logout no backend
    await api.post('/colaborador/logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Limpar storage independente do resultado
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    
    // Redirecionar para login
    window.location.href = '/login';
  }
};
```

### Exemplo: Atualizar o Navbar

**Localização:** `frontend/src/components/Navbar.jsx`

```javascript
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/colaborador/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <nav>
      {/* ... outros elementos ... */}
      <button onClick={handleLogout}>Sair</button>
    </nav>
  );
};
```

---

## 🔐 Passo 4: Atualizar ProtectedRoute (se houver)

### Localização: `frontend/src/components/ProtectedRoute.jsx`

Atualizar verificação de autenticação:

```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Se não tem nem access nem refresh token, redirecionar
  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

---

## 🧪 Passo 5: Testar a Integração

### Teste 1: Login

1. Abra o DevTools → Application → Local Storage
2. Faça login
3. Verifique se `accessToken` e `refreshToken` foram salvos

### Teste 2: Renovação Automática

Para testar, configure no backend `.env`:

```env
JWT_ACCESS_EXP=30s
```

1. Faça login
2. Aguarde 30 segundos
3. Faça qualquer requisição (ex: acessar lista de colaboradores)
4. Verifique no **Network** do DevTools:
   - Primeira requisição: 401 (TOKEN_EXPIRED)
   - Chamada automática para `/refresh-token`
   - Repetição da requisição original: 200 (sucesso)

### Teste 3: Logout

1. Clique no botão de logout
2. Verifique que os tokens foram removidos
3. Verifique redirecionamento para login

---

## 📊 Estrutura de Dados no LocalStorage

### Antes (sistema antigo):

```
token: "eyJhbGci..."
usuario: {"id":"...","nome":"...","email":"..."}
```

### Depois (novo sistema):

```
accessToken: "eyJhbGci..."
refreshToken: "eyJhbGci..."
usuario: {"id":"...","nome":"...","email":"..."}
```

---

## 🚀 Funcionalidades Implementadas

### ✅ 1. Renovação Automática
- O frontend detecta quando o access token expira
- Chama automaticamente `/refresh-token`
- Repete a requisição original com novo token
- Usuário não percebe a renovação

### ✅ 2. Fila de Requisições
- Se múltiplas requisições falharem ao mesmo tempo
- Apenas uma chamada de renovação é feita
- Outras requisições aguardam na fila
- Todas são reprocessadas com o novo token

### ✅ 3. Logout Automático
- Se o refresh token também expirar
- Usuário é deslogado automaticamente
- Redirecionado para tela de login

### ✅ 4. Tratamento de Erros
- Mensagens claras de erro
- Diferenciação entre token expirado e outros erros
- Limpeza adequada do storage

---

## 🔍 Debug e Troubleshooting

### Ver Requisições no Console

Adicione logs temporários no interceptor:

```javascript
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta:', response);
    return response;
  },
  async (error) => {
    console.log('❌ Erro:', error.response?.data);
    // ... resto do código
  }
);
```

### Verificar Tokens

No console do navegador:

```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### Decodificar Token (Debug)

Use https://jwt.io para ver o conteúdo dos tokens.

---

## 📱 Exemplo Completo de Fluxo

### 1. Usuário Faz Login

```javascript
// Login.jsx
const response = await api.post('/colaborador/login', { email, password });
localStorage.setItem('accessToken', response.data.data.accessToken);
localStorage.setItem('refreshToken', response.data.data.refreshToken);
```

### 2. Usuário Acessa Página Protegida

```javascript
// Dashboard.jsx
useEffect(() => {
  const fetchData = async () => {
    // Interceptor adiciona automaticamente o accessToken
    const response = await api.get('/colaborador/todosColaboradores');
    setData(response.data);
  };
  
  fetchData();
}, []);
```

### 3. Access Token Expira Durante Navegação

```
1. Frontend faz requisição GET /colaborador/todosColaboradores
2. Backend retorna 401 { error: "TOKEN_EXPIRED" }
3. Interceptor detecta e chama POST /refresh-token
4. Backend retorna novos tokens
5. Frontend salva novos tokens
6. Frontend repete GET /colaborador/todosColaboradores
7. Sucesso! Dados retornados
```

### 4. Usuário Faz Logout

```javascript
// Navbar.jsx
const handleLogout = async () => {
  await api.post('/colaborador/logout'); // Revoga refresh token no backend
  localStorage.clear();
  navigate('/login');
};
```

---

## ⚠️ Importante: Migração de Código Existente

### Substituir em TODOS os arquivos:

#### ❌ Antigo:
```javascript
localStorage.getItem('token')
localStorage.setItem('token', ...)
localStorage.removeItem('token')
```

#### ✅ Novo:
```javascript
localStorage.getItem('accessToken')
localStorage.setItem('accessToken', ...)
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
```

### Arquivos que provavelmente precisam atualização:

- [ ] `src/services/api.js` - PRINCIPAL
- [ ] `src/pages/Login.jsx`
- [ ] `src/components/Navbar.jsx`
- [ ] `src/components/ProtectedRoute.jsx`
- [ ] Qualquer outro arquivo que use autenticação

---

## ✅ Checklist de Integração Frontend

- [ ] Atualizar `api.js` com interceptor de refresh
- [ ] Atualizar página de login para salvar ambos os tokens
- [ ] Implementar logout que chama o backend
- [ ] Atualizar ProtectedRoute
- [ ] Remover referências ao antigo `token`
- [ ] Testar login
- [ ] Testar renovação automática
- [ ] Testar logout
- [ ] Testar expiração completa (logout forçado)

---

## 🎯 Benefícios da Implementação

✅ **Segurança Aprimorada** - Tokens de curta duração  
✅ **UX Melhorada** - Renovação invisível ao usuário  
✅ **Controle Total** - Revogação de sessões via logout  
✅ **Escalável** - Suporta múltiplas requisições simultâneas  

---

## 🐛 Problemas Comuns

### 1. "Network Error" ao renovar

**Causa:** URL hardcoded no interceptor  
**Solução:** Use `api.defaults.baseURL`

```javascript
const { data } = await axios.post(
  `${api.defaults.baseURL}/colaborador/refresh-token`,
  { refreshToken }
);
```

### 2. Loop infinito de renovações

**Causa:** Flag `_retry` não está sendo verificada  
**Solução:** Certifique-se que `!originalRequest._retry` está no if

### 3. Tokens não são salvos

**Causa:** Estrutura de resposta diferente  
**Solução:** Verifique `response.data.data` vs `response.data`

---

**Frontend pronto para o sistema de Refresh Token! 🚀**

