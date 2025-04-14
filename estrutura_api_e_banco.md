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
- [x] Adiciona um novo produto.
- `PUT /admin/products/:id`
- [x] Edita um produto existente.
- `DELETE /admin/products/:id`
- [x] Remove um produto.

#### 1.3. Gerenciamento de Pedidos

- `GET /admin/orders`
- [ ] Lista todos os pedidos.
- `GET /admin/orders/:id`
- [ ] Visualiza detalhes de um pedido específico.
- `PUT /admin/orders/:id`
- [ ] Atualiza o status de um pedido.

#### 1.4. Gerenciamento de Usuários

- `GET /admin/users`
- [x] Lista todos os usuários.
- `POST /admin/users`
- [x] Cria um novo usuário.
- `PUT /admin/users/:id`
- [x] Edita um usuário existente.
- `DELETE /admin/users/:id`
- [x] Remove um usuário.

#### 1.5. Relatórios

- `GET /admin/reports/sales`
- [ ] Retorna um balanço mensal de vendas.

#### 1.6 Rotas anuncios/destaques

- `GET /promotios`
- [x] Rota para cads de promoção anuncios, video bg

#### 1.7 Rotas para avaliação

### 2. Rotas para Usuários

Essas rotas serão acessíveis para usuários comuns.

#### 2.1. Autenticação

- `POST /users/login`
- [x] Autentica um usuário e retorna um token.
- [x] Confirmar email

#### 2.2. Produtos

- `GET /products`
- [x] Lista todos os produtos disponíveis.
- `GET /products/:id`
- [x] Visualiza detalhes de um produto específico.

#### 2.3. Carrinho de Compras

- `GET /cart`
- [x] Visualiza os itens no carrinho.
- `POST /cart`
- [x] Adiciona um item ao carrinho.
- `PUT /cart`
- [x] Atualizar a quantidade de um item no carrinho.
- `DELETE /cart/:id`
- [x] Remove um item do carrinho.
- `DELETE /cart`
- [x] Remove todos os itens do carrinho.

#### 2.4. Carrinho de Compras

- `GET /coupon/check/:code`
- [x] Valida um cupom de desconto

#### 2.5. Pedidos

- `POST /orders`
- [ ] Cria um novo pedido.
- `GET /orders`
- [ ] Lista os pedidos do usuário.
- `GET /orders/:id`
- [ ] Visualiza detalhes de um pedido específico.

#### 2.6. Perfil do Usuário

- `GET /users/profile`
- [x] Visualiza informações do perfil do usuário.
- `PUT /users/profile`
- [x] Atualiza informações do perfil.

### 3. Segurança e Autorização

- [x] **Middleware de Autenticação**: Utilize middleware para proteger as rotas de admin e garantir que apenas usuários autenticados possam acessá-las.
- [x] **Verificação de Função**: Adicione lógica para verificar se o usuário é um administrador antes de permitir o acesso às rotas administrativas.

### 1 filtro

GET /api/produtos?categoria=eletronicos&marca=sony&preco_min=100&preco_max=1000
http://localhost:3333/products?limit=10&offset=0&category=notebooks&price=100&-price=4000&brand=acer1&tags=aaaa&bigsale=false&assessment=0

Sugestões para Tornar o Projeto AINDA MAIS Impactante:
Aqui estão algumas ideias de melhorias que podem agregar mais valor ao seu projeto e ao seu portfólio:

Testes automatizados: Adicione testes unitários e de integração para garantir que seu sistema esteja funcionando corretamente. Isso mostra que você se preocupa com a qualidade do código.
Responsividade: Certifique-se de que sua loja virtual e a dashboard administrativa sejam responsivas e funcionem bem em dispositivos móveis. Hoje em dia, a experiência mobile é fundamental.
UI/UX: Trabalhe no design da interface para que seja intuitiva e atraente. Isso pode ser um diferencial, principalmente em e-commerce, onde a experiência do usuário impacta diretamente nas vendas.
Integração com APIs de Pagamento: Se você ainda não fez isso, adicione uma integração com serviços de pagamento como Stripe ou PayPal.
Implementação de SEO e performance: Como você está usando o Next.js, explore as funcionalidades de otimização de SEO e performance (SSR, geração de sitemap, etc.) para melhorar a visibilidade nos motores de busca e a velocidade do site.
Deploy em Produção: Coloque seu projeto online! Faça o deploy do seu e-commerce (pode ser na Vercel para o frontend e Heroku ou DigitalOcean para o backend) e mostre aos recrutadores que você sabe como colocar um projeto em produção.

- [ ] [Nest]` {/users/complete-profile, PATCH}`
- [ ] [Nest]` {/users/avatar, POST}`
- [ ] [Nest]` {/users/avatar-Cloudnary, POST}`
- [ ] [Nest]` {/users/admin/:id, GET}`
- [ ] [Nest]` {/users/admin, GET}`
- [ ] [Nest]` {/users/admin/:id, DELETE}`
- [ ] [Nest]` {/auth/register-admin, POST}`
- [ ] [Nest]` {/auth/login-admin, POST}`
- [ ] [Nest]` {/auth/admin/admin-only, GET}`
- [ ] [Nest]` {/auth/register, POST}`
- [ ] [Nest]` {/auth/google, POST}`
- [ ] [Nest]` {/auth/login, POST}`
- [ ] [Nest]` {/auth/profile, GET}`
- [ ] [Nest]` {/auth/password, PATCH}`
- [ ] [Nest]` {/auth/forgot-password, POST}`
- [ ] [Nest]` {/auth/reset-password, POST}`
- [ ] [Nest]` {/email-verification/send, POST}`
- [ ] [Nest]` {/email-verification/verify-email, GET}`
- [ ] [Nest]` {/email-verification/confirm-email, POST}`
- [ ] [Nest]` {/products/admin, POST}`
- [ ] [Nest]` {/products/admin/image, POST}`
- [ ] [Nest]` {/products, GET}`
- [ ] [Nest]` {/products/:id, GET}`
- [ ] [Nest]` {/products/admin/:id, PATCH}`
- [ ] [Nest]` {/products/admin/:id, DELETE}`
- [ ] [Nest]` {/category/admin, POST}`
- [ ] [Nest]` {/category, GET}`
- [ ] [Nest]` {/category/:id, GET}`
- [ ] [Nest]` {/category/admin/:id, PATCH}`
- [ ] [Nest]` {/category/admin/:id, DELETE}`
- [ ] [Nest]` {/cart, POST}`
- [ ] [Nest]` {/cart/admin, GET}`
- [ ] [Nest]` {/cart/:id, GET}`
- [ ] [Nest]` {/cart, PATCH}`
- [ ] [Nest]` {/cart/:id, DELETE}`
- [ ] [Nest]` {/cart/all/:id, DELETE}`
- [ ] [Nest]` {/coupon/admin, POST}`
- [ ] [Nest]` {/coupon/admin, GET}`
- [ ] [Nest]` {/coupon/admin/:id, GET}`
- [ ] [Nest]` {/coupon/admin/:id, PATCH}`
- [ ] [Nest]` {/coupon/admin/:id, DELETE}`
- [ ] [Nest]` {/coupon/check/:code, GET}`
- [ ] [Nest]` {/wishlist, POST}`
- [ ] [Nest]` {/wishlist/admin, GET}`
- [ ] [Nest]` {/wishlist/:id, GET}`
- [ ] [Nest]` {/wishlist/:id, DELETE}`
- [ ] [Nest]` {/review, POST}`
- [ ] [Nest]` {/review/user/:id, GET}`
- [ ] [Nest]` {/review/product/:id, GET}`
- [ ] [Nest]` {/review, GET}`
- [ ] [Nest]` {/review/:id, PATCH}`
- [ ] [Nest]` {/review/admin/:id, DELETE}`
- [ ] [Nest]` {/address, POST}`
- [ ] [Nest]` {/address/admin, GET}`
- [ ] [Nest]` {/address/user/:id, GET}`
- [ ] [Nest]` {/address/:id, PATCH}`
- [ ] [Nest]` {/address/:id, DELETE}`
- [ ] [Nest]` {/validete-zip/:zip, GET}`
- [ ] [Nest]` {/site-content/admin, POST}`
- [ ] [Nest]` {/site-content/admin/banner/:id, PUT}`
- [ ] [Nest]` {/site-content/admin/video/:id, PUT}`
- [ ] [Nest]` {/site-content/admin/bg_video/:id, PUT}`
- [ ] [Nest]` {/site-content/admin/logo/:id, PUT}`
- [ ] [Nest]` {/site-content/admin/favicon/:id, PUT}`
- [ ] [Nest]` {/site-content/admin, GET}`
- [ ] [Nest]` {/site-content/admin/:id, GET}`
- [ ] [Nest]` {/site-content/admin/:id, PATCH}`
- [ ] [Nest]` {/site-content/admin/:id, DELETE}`
- [ ] [Nest]` {/promotions/admin, POST}`
- [ ] [Nest]` {/promotions/banner/admin/:id, PUT}`
- [ ] [Nest]` {/promotions/video/admin/:id, PUT}`
- [ ] [Nest]` {/promotions, GET}`
- [ ] [Nest]` {/promotions/:id, GET}`
- [ ] [Nest]` {/promotions/admin/:id, PATCH}`
- [ ] [Nest]` {/promotions/admin/:id, DELETE}`
- [ ] [Nest]` {/promotion-hero/admin, POST}`
- [ ] [Nest]` {/promotion-hero/image/admin/:id, PUT}`
- [ ] [Nest]` {/promotion-hero, GET}`
- [ ] [Nest]` {/promotion-hero/:id, GET}`
- [ ] [Nest]` {/promotion-hero/admin:id, PATCH}`
- [ ] [Nest]` {/promotion-hero/admin/:id, DELETE}`
- [ ] [Nest]` {/social-media/admin, POST}`
- [ ] [Nest]` {/social-media, GET}`
- [ ] [Nest]` {/social-media/:id, GET}`
- [ ] [Nest]` {/social-media/admin/:id, PATCH}`
- [ ] [Nest]` {/social-media/admin/:id, DELETE}`
- [ ] [Nest]` {/contact-info/admin, POST}`
- [ ] [Nest]` {/contact-info, GET}`
- [ ] [Nest]` {/contact-info/:id, GET}`
- [ ] [Nest]` {/contact-info/admin/:id, PATCH}`
- [ ] [Nest]` {/contact-info/admin/:id, DELETE}`
