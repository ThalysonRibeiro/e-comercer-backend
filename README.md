<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# E-commerce API

API para um sistema de e-commerce, desenvolvida com NestJS, um framework Node.js progressivo para construir aplicações server-side eficientes e escaláveis.

## Tecnologias e Bibliotecas

- **Framework**: [NestJS](https://nestjs.com/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) com [Prisma](https://www.prisma.io/) ORM
- **Autenticação**: [Passport](http://www.passportjs.org/) com [JWT](https://jwt.io/)
- **Validação**: [class-validator](https://github.com/typestack/class-validator), [class-transformer](https://github.com/typestack/class-transformer)
- **Upload de Arquivos**: [Multer](https://github.com/expressjs/multer), [Cloudinary](https://cloudinary.com/)
- **Envio de E-mails**: [Nodemailer](https://nodemailer.com/)
- **Segurança**: [Throttler](https://github.com/nestjs/throttler) para Rate Limiting
- **API**: [Swagger](https://swagger.io/) para documentação

## Rotas da API

A seguir, uma lista das principais rotas da API:

- `GET /`: Rota principal da aplicação.
- `POST /auth/register`: Registrar um novo usuário.
- `POST /auth/login`: Autenticar um usuário.
- `GET /products`: Listar todos os produtos.
- `GET /products/:id`: Obter detalhes de um produto.
- `POST /products/admin`: Criar um novo produto (requer autenticação de administrador).
- `PATCH /products/admin/:id`: Atualizar um produto (requer autenticação de administrador).
- `DELETE /products/admin/:id`: Deletar um produto (requer autenticação de administrador).
- `GET /category`: Listar todas as categorias.
- `POST /category/admin`: Criar uma nova categoria (requer autenticação de administrador).
- `GET /brands`: Listar todas as marcas.
- `POST /brands/admin`: Criar uma nova marca (requer autenticação de administrador).
- `GET /cart/:id`: Obter o carrinho de um usuário.
- `POST /cart`: Adicionar um item ao carrinho.
- `DELETE /cart/:id`: Remover um item do carrinho.
- `GET /wishlist/user/:id`: Obter a lista de desejos de um usuário.
- `POST /wishlist`: Adicionar um item à lista de desejos.
- `DELETE /wishlist/:id`: Remover um item da lista de desejos.
- `GET /review/product/:id`: Obter as avaliações de um produto.
- `POST /review`: Criar uma nova avaliação.
- `GET /coupon/check/:code`: Verificar a validade de um cupom.
- `POST /coupon/admin`: Criar um novo cupom (requer autenticação de administrador).
- `GET /validete-zip/:zip`: Validar um CEP.

Para uma lista completa de todas as rotas e seus detalhes, acesse a documentação da API em `/api` após iniciar a aplicação.

## Como Inicializar a Aplicação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (para o banco de dados)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/e-comercer-backend.git
    cd e-comercer-backend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    - Renomeie o arquivo `.env.example` para `.env`.
    - Preencha as variáveis de ambiente no arquivo `.env` com as suas configurações (banco de dados, chaves de API, etc.).

4.  Inicie o banco de dados com Docker:
    ```bash
    docker-compose up -d
    ```

5.  Aplique as migrações do Prisma:
    ```bash
    npx prisma migrate dev
    ```

### Executando a Aplicação

- **Modo de Desenvolvimento:**
  ```bash
  npm run start:dev
  ```
  A aplicação estará disponível em `http://localhost:3001`.

- **Modo de Produção:**
  ```bash
  npm run build
  npm run start:prod
  ```

### Testes

- **Testes Unitários:**
  ```bash
  npm run test
  ```

- **Testes End-to-End (e2e):**
  ```bash
  npm run test:e2e
  ```

- **Cobertura de Testes:**
  ```bash
  npm run test:cov
  ```

## Licença

Este projeto é licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.