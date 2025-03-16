# E-commerce

# Estrutura da API e Banco de Dados

## Estrutura de Rotas da API

### 1. Rotas para Admin

Essas rotas serão protegidas e acessíveis apenas para contas de administrador.

#### 1.1. Autenticação

- `POST /admin/login`
- [x] Autentica um administrador e retorna um token.
- [x] Confirmar email

#### 1.2. Gerenciamento de Produtos

- `GET /admin/products`
- [ ] Lista todos os produtos.
- `POST /admin/products`
- [ ] Adiciona um novo produto.
- `PUT /admin/products/:id`
- [ ] Edita um produto existente.
- `DELETE /admin/products/:id`
- [ ] Remove um produto.

#### 1.3. Gerenciamento de Pedidos

- `GET /admin/orders`
- [ ] Lista todos os pedidos.
- `GET /admin/orders/:id`
- [ ] Visualiza detalhes de um pedido específico.
- `PUT /admin/orders/:id`
- [ ] Atualiza o status de um pedido.

#### 1.4. Gerenciamento de Usuários

- `GET /admin/users`
- [ ] Lista todos os usuários.
- `POST /admin/users`
- [ ] Cria um novo usuário.
- `PUT /admin/users/:id`
- [ ] Edita um usuário existente.
- `DELETE /admin/users/:id`
- [ ] Remove um usuário.

#### 1.5. Relatórios

- `GET /admin/reports/sales`
- [ ] Retorna um balanço mensal de vendas.

#### 1.6 Rotas anuncios/destaques

- `GET /promotios`
- [ ] Rota para cads de promoção anuncios, video bg

#### 1.7 Rotas para avaliação

### 2. Rotas para Usuários

Essas rotas serão acessíveis para usuários comuns.

#### 2.1. Autenticação

- `POST /users/login`
- [x] Autentica um usuário e retorna um token.
- [x] Confirmar email

#### 2.2. Produtos

- `GET /products`
- [ ] Lista todos os produtos disponíveis.
- `GET /products/:id`
- [ ] Visualiza detalhes de um produto específico.

#### 2.3. Carrinho de Compras

- `GET /cart`
- [ ] Visualiza os itens no carrinho.
- `POST /cart`
- [ ] Adiciona um item ao carrinho.
- `DELETE /cart/:id`
- [ ] Remove um item do carrinho.

#### 2.4. Pedidos

- `POST /orders`
- [ ] Cria um novo pedido.
- `GET /orders`
- [ ] Lista os pedidos do usuário.
- `GET /orders/:id`
- [ ] Visualiza detalhes de um pedido específico.

#### 2.5. Perfil do Usuário

- `GET /users/profile`
- [x] Visualiza informações do perfil do usuário.
- `PUT /users/profile`
- [x] Atualiza informações do perfil.

### 3. Segurança e Autorização

- [x] **Middleware de Autenticação**: Utilize middleware para proteger as rotas de admin e garantir que apenas usuários autenticados possam acessá-las.
- [x] **Verificação de Função**: Adicione lógica para verificar se o usuário é um administrador antes de permitir o acesso às rotas administrativas.

### 1 filtro

GET /api/produtos?categoria=eletronicos&marca=sony&preco_min=100&preco_max=1000

---

## Estrutura do Banco de Dados

### 1. Tabela de Usuários

| Campo          | Tipo                      | Descrição                                       |
| -------------- | ------------------------- | ----------------------------------------------- |
| `id`           | INT (PK)                  | Identificador único do usuário                  |
| `email`        | VARCHAR                   | Endereço de e-mail do usuário                   |
| `senha`        | VARCHAR                   | Senha criptografada                             |
| `nome`         | VARCHAR                   | Nome do usuário                                 |
| `tipo`         | ENUM ('usuario', 'admin') | Tipo de conta (usuário normal ou administrador) |
| `data_criacao` | DATETIME                  | Data de criação da conta                        |
| `status`       | ENUM ('ativo', 'inativo') | Status da conta                                 |

### 2. Tabela de Produtos

| Campo          | Tipo     | Descrição                        |
| -------------- | -------- | -------------------------------- |
| `id`           | INT (PK) | Identificador único do produto   |
| `nome`         | VARCHAR  | Nome do produto                  |
| `descricao`    | TEXT     | Descrição do produto             |
| `preco`        | DECIMAL  | Preço do produto                 |
| `estoque`      | INT      | Quantidade disponível em estoque |
| `data_criacao` | DATETIME | Data de adição do produto        |

### 3. Tabela de Pedidos

| Campo         | Tipo                                      | Descrição                              |
| ------------- | ----------------------------------------- | -------------------------------------- |
| `id`          | INT (PK)                                  | Identificador único do pedido          |
| `usuario_id`  | INT (FK)                                  | Referência ao usuário que fez o pedido |
| `data_pedido` | DATETIME                                  | Data do pedido                         |
| `status`      | ENUM ('pendente', 'enviado', 'concluído') | Status do pedido                       |
| `total`       | DECIMAL                                   | Total do pedido                        |

### 4. Tabela de Itens do Pedido

| Campo        | Tipo     | Descrição                             |
| ------------ | -------- | ------------------------------------- |
| `id`         | INT (PK) | Identificador único do item do pedido |
| `pedido_id`  | INT (FK) | Referência ao pedido                  |
| `produto_id` | INT (FK) | Referência ao produto                 |
| `quantidade` | INT      | Quantidade do produto no pedido       |
| `preco`      | DECIMAL  | Preço do produto no momento da compra |

schema
datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

enum TipoConta {
usuario
admin
}

enum StatusConta {
ativo
inativo
}

enum StatusPedido {
pendente
enviado
concluido
cancelado
}

model Usuario {
id Int @id @default(autoincrement())
email String @unique
senha String?
nome String
tipo TipoConta
dataCriacao DateTime @default(now())
status StatusConta

// Colunas para o NextAuth.js
emailVerified DateTime? @db.Timestamptz // Para armazenar quando o email foi verificado
image String? // Para armazenar a imagem de perfil do usuário (caso esteja usando provedores como Google)

Pedidos Pedido[] // Relacionamento com a tabela Pedido
}

model Pedido {
id Int @id @default(autoincrement()) // ID do pedido
usuarioId Int // ID do usuário que fez o pedido
dataPedido DateTime @default(now()) // Data e hora do pedido
status StatusPedido // Status do pedido
total Decimal @db.Decimal(10, 2) // Valor total do pedido
endereco String? // Endereço de entrega (caso necessário)
metodoPagamento String? // Método de pagamento
usuario Usuario @relation(fields: [usuarioId], references: [id]) // Relacionamento com o usuário

ItensPedido ItemPedido[] // Relacionamento com os itens do pedido
}

model ItemPedido {
id Int @id @default(autoincrement()) // ID do item do pedido
pedidoId Int // ID do pedido
produtoId Int // ID do produto
quantidade Int // Quantidade do produto no pedido
preco Decimal @db.Decimal(10, 2) // Preço unitário do produto no momento da compra

Pedido Pedido @relation(fields: [pedidoId], references: [id]) // Relacionamento com o pedido
Produto Produto @relation(fields: [produtoId], references: [id]) // Relacionamento com o produto
}

Sugestões para Tornar o Projeto AINDA MAIS Impactante:
Aqui estão algumas ideias de melhorias que podem agregar mais valor ao seu projeto e ao seu portfólio:

Testes automatizados: Adicione testes unitários e de integração para garantir que seu sistema esteja funcionando corretamente. Isso mostra que você se preocupa com a qualidade do código.
Responsividade: Certifique-se de que sua loja virtual e a dashboard administrativa sejam responsivas e funcionem bem em dispositivos móveis. Hoje em dia, a experiência mobile é fundamental.
UI/UX: Trabalhe no design da interface para que seja intuitiva e atraente. Isso pode ser um diferencial, principalmente em e-commerce, onde a experiência do usuário impacta diretamente nas vendas.
Integração com APIs de Pagamento: Se você ainda não fez isso, adicione uma integração com serviços de pagamento como Stripe ou PayPal.
Implementação de SEO e performance: Como você está usando o Next.js, explore as funcionalidades de otimização de SEO e performance (SSR, geração de sitemap, etc.) para melhorar a visibilidade nos motores de busca e a velocidade do site.
Deploy em Produção: Coloque seu projeto online! Faça o deploy do seu e-commerce (pode ser na Vercel para o frontend e Heroku ou DigitalOcean para o backend) e mostre aos recrutadores que você sabe como colocar um projeto em produção.
