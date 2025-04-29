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

checklist_content = """

1. Controle de Acesso por API Key

- [x] Criar um ApiKeyGuard para validar requisições.
- [x] Usar @SkipApiKey() para rotas que não precisam da key.
- [x] Proteger até rotas públicas com a key (site principal, app mobile, etc.).
- [ ] Rotacionar (mudar) as keys periodicamente.
- [ ] Salvar as API Keys em variável ambiente (.env).

2. Autenticação e Autorização

- [x] Usar JWT com tempo de expiração curto.
- [x] Usar Guards separados: público, autenticado e por roles (user, admin, etc.).
- [x] Criar @Roles() e RolesGuard para proteger rotas específicas.
- [ ] Usar refresh token (opcional, para manter login sem estender token de acesso).

3. Proteções de Rede e Transporte

- [ ] Obrigar HTTPS no ambiente de produção (SSL).
- [ ] Configurar CORS corretamente (liberar só domínios confiáveis).
- [ ] Ocultar headers sensíveis (X-Powered-By, etc.).

4. Rate Limiting / DDoS Protection

- [ ] Instalar @nestjs/throttler:
      npm i @nestjs/throttler
- [ ] Aplicar limite global:
      ThrottlerModule.forRoot({ ttl: 60, limit: 20 }) // 20 req/min

5. Validação e Sanitização de Dados

- [x] Usar class-validator + ValidationPipe.
- [ ] Ativar forbidNonWhitelisted: true e whitelist: true no main.ts.
- [ ] Usar DTOs sempre que possível.

6. Monitoramento e Logs

- [ ] Adicionar logs de requisição (com IP e headers principais).
- [ ] Monitorar uso de cada API Key (via log, dashboard, ou banco).
- [ ] Configurar alertas para erros suspeitos (via Sentry, LogRocket, etc.).

7. Banco de Dados

- [ ] Usar ORM com query builder (TypeORM, Drizzle, Prisma) para evitar SQL Injection.
- [ ] Criar roles e permissões no banco (evitar acesso total com 1 único usuário).

8. Ambiente e DevOps

- [x] Esconder .env e nunca subir no Git.
- [ ] Usar secrets diferentes por ambiente (.env.production, .env.staging, etc.).
- [ ] Atualizar dependências com frequência (corrigir falhas conhecidas).

9. Extras (opcional, avançado)

- [ ] Autenticação mútua entre serviços (ex: Backend → Microserviço).
- [ ] Token JWT assinado com chave privada (RS256) em vez de segredo simétrico (HS256).
- [ ] Web Application Firewall (WAF) se estiver em cloud pública.
      """
