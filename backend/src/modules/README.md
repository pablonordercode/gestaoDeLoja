# Módulos do Sistema

Esta pasta está preparada para receber módulos independentes do sistema.

## Estrutura Recomendada

Cada módulo deve seguir a estrutura:

```
modules/
└── nome-do-modulo/
    ├── controller.js     # Controladores HTTP
    ├── service.js        # Lógica de negócio
    ├── repository.js     # Acesso a dados
    ├── routes.js         # Rotas específicas
    ├── model.js          # Modelo de dados (se necessário)
    ├── validator.js      # Validações específicas
    └── index.js          # Exportações do módulo
```

## Exemplo de Módulo

### Criar um novo módulo de "Relatórios":

1. Criar pasta: `modules/relatorios/`
2. Implementar arquivos conforme necessário
3. Registrar no `modules/index.js`

## Princípios

- **Autocontido**: Cada módulo deve ser independente
- **Reutilizável**: Código pode ser compartilhado entre módulos via utils
- **Testável**: Facilita testes unitários e de integração
- **Escalável**: Permite crescimento organizado do projeto

## Integração com a Aplicação

Para integrar um novo módulo:

1. Criar estrutura do módulo
2. Exportar rotas no `index.js` do módulo
3. Registrar rotas no `app.js` principal
4. Adicionar documentação específica

## Boas Práticas

- Use async/await para operações assíncronas
- Sempre valide dados de entrada
- Mantenha controllers finos (delegue para services)
- Use repositories para isolar acesso ao banco
- Documente funções e rotas complexas

