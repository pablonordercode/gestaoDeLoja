/**
 * EXEMPLO DE IMPLEMENTAÇÃO: Sistema de Refresh Token no Frontend
 * 
 * Este arquivo mostra como atualizar o frontend/src/services/api.js
 * para trabalhar com o novo sistema de Access Token e Refresh Token
 * 
 * IMPORTANTE: Substitua o conteúdo de frontend/src/services/api.js por este código
 */

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7001",
});

// Flag para evitar múltiplas renovações simultâneas
let isRefreshing = false;
let failedQueue = [];

/**
 * Processa a fila de requisições que falharam durante a renovação
 */
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

/**
 * Interceptor para adicionar access token em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Usar 'accessToken' ao invés de 'token'
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para renovação automática de tokens
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se não há resposta (erro de rede), rejeitar
    if (!error.response) {
      return Promise.reject(error);
    }

    // Se receber erro 401 (não autorizado)
    if (error.response.status === 401) {
      const errorCode = error.response.data?.error;

      // Se o token expirou e não é uma tentativa de retry
      if (errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        
        // Se já está renovando, adicionar à fila
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
        }

        // Marcar que está renovando
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          
          // Se não há refresh token, ir para login
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Chamar rota de renovação
          const { data } = await axios.post(
            "http://localhost:7001/colaborador/refresh-token",
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = data.data;

          // Salvar novos tokens
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Atualizar header da requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Processar fila de requisições pendentes
          processQueue(null, accessToken);

          // Repetir a requisição original
          return api(originalRequest);

        } catch (refreshError) {
          // Refresh token expirado ou inválido
          processQueue(refreshError, null);
          
          // Limpar storage e redirecionar para login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("usuario");
          
          window.location.href = "/login";
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Se é outro tipo de erro 401 (não TOKEN_EXPIRED), fazer logout
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

