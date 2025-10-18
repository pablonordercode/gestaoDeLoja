/**
 * Módulos do sistema
 * 
 * Este arquivo serve como ponto de entrada para módulos independentes
 * que podem ser desenvolvidos no futuro.
 * 
 * Estrutura sugerida para novos módulos:
 * 
 * modules/
 * ├── auth/
 * │   ├── authController.js
 * │   ├── authService.js
 * │   ├── authRepository.js
 * │   └── authRoutes.js
 * ├── produtos/
 * │   ├── produtoController.js
 * │   ├── produtoService.js
 * │   ├── produtoRepository.js
 * │   └── produtoRoutes.js
 * └── colaboradores/
 *     ├── colaboradorController.js
 *     ├── colaboradorService.js
 *     ├── colaboradorRepository.js
 *     └── colaboradorRoutes.js
 * 
 * Cada módulo deve ser autocontido e seguir os princípios de:
 * - Single Responsibility Principle
 * - Dependency Injection
 * - Separation of Concerns
 */

const modules = {
    // Futuros módulos serão registrados aqui
    // Exemplo:
    // auth: require('./auth'),
    // produtos: require('./produtos'),
    // colaboradores: require('./colaboradores'),
};

module.exports = modules;

