<div align="center">
  <h1>Frameway</h1>
  <p><strong>Uma experiência cinematográfica imersiva para descobrir e explorar filmes.</strong></p>
  <p>O Frameway é uma aplicação web moderna e visualmente rica, construída para entusiastas de cinema. Utilizando a API do The Movie Database (TMDB), o projeto oferece uma interface dinâmica e responsiva, focada na exploração de conteúdo cinematográfico, com funcionalidades avançadas como carregamento progressivo, busca inteligente e galerias interativas.</p>
</div>

---

## ✨ Funcionalidades Principais

<!-- O restante do arquivo permanece inalterado -->
O projeto já está funcional e conta com uma interface polida e diversas funcionalidades avançadas:

### 🏠 Landing Page
- **Carrossel de Destaques:** Apresenta os filmes em alta com rotação automática, indicador de progresso e pré-carregamento inteligente para transições suaves.
- **Carrossel de Populares:** Um carrossel infinito com um elegante efeito de *hover* que expande os cards para mostrar mais detalhes. Suporta navegação por botões e por arrastar (*swipe*).
- **Busca Inteligente:** Campo de busca com sugestões em tempo real que aparecem enquanto você digita.

### 🎬 Página de Detalhes do Filme
- **Carregamento Progressivo:** A página carrega em etapas, exibindo *skeletons* e uma barra de progresso para uma experiência de usuário fluida e rápida.
- **Background Dinâmico:** A imagem de fundo do filme aplica um efeito de *blur* gradual conforme o usuário rola a página.
- **Trailer Inteligente:** O sistema busca e exibe o melhor trailer disponível, priorizando versões oficiais e em português.
- **Galeria Avançada:**
  - Navegue por imagens do filme e pôsteres com filtros.
  - Carregue mais imagens sob demanda com o botão "Carregar Mais".
  - Visualize imagens em tela cheia com um **lightbox** integrado.
  - Baixe imagens em alta resolução de forma segura.
- **Seções Expansíveis:** Explore o elenco completo, fatos e outras informações em seções que se expandem com uma animação suave.
- **Filmes Relacionados:** Descubra novas sugestões em um carrossel infinito e com suporte a *swipe*.

### ⚙️ Gerais
- **Design Responsivo:** A interface se adapta perfeitamente a desktops, tablets e celulares.
- **Navegação por Histórico:** Os botões de "voltar" e "avançar" do navegador funcionam perfeitamente, graças ao uso da History API.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (Flexbox & Grid), JavaScript (ES6+)
- **Backend:** PHP (atuando como um proxy seguro para a API do TMDB)
- **API:** The Movie Database (TMDB)

---

## 🔧 Como Executar Localmente

1.  **Pré-requisitos:**
    - Um ambiente de servidor local com PHP, como XAMPP, WAMP ou MAMP, deve estar instalado e em execução.

2.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/Frameway.git
    ```
    - Mova a pasta do projeto clonado (`Frameway`) para o diretório raiz do seu servidor web (geralmente `htdocs` no XAMPP ou `www` no WAMP).

3.  **Acesse o projeto:**
    - Abra seu navegador e acesse `http://localhost/Frameway/pages/landingpage.php`.
    - O projeto já está configurado com a chave de API necessária e deve funcionar imediatamente.

---

## 🔮 Planos Futuros

A base atual é sólida e abre caminho para transformar o Frameway em uma plataforma social completa. Os próximos passos incluem:

- **Autenticação de Usuários:** Implementar sistema de login e registro.
- **Funcionalidades de Usuário:**
  - **Minha Lista (Watchlist):** Para salvar filmes que deseja assistir.
  - **Avaliações e Críticas:** Permitir que usuários avaliem e escrevam sobre os filmes.
- **Recursos Sociais:** Seguir outros usuários, ver atividades de amigos e muito mais.
    *   **Cinéfilos:** Usuários ávidos que desejam catalogar, avaliar e discutir filmes em profundidade.
    *   **Espectadores Casuais:** Usuários que buscam recomendações, informações rápidas e uma forma simples de gerenciar uma lista de "filmes para assistir".

### 1.3. Visão Geral do Produto e Funcionalidades
O Frameway será uma aplicação web responsiva, desenvolvida com a metodologia *mobile-first*. O sistema terá uma arquitetura cliente-servidor, com um frontend dinâmico construído com HTML, CSS e JavaScript, e um backend em PHP que servirá como um proxy para a API do TMDB e gerenciará as interações com o banco de dados local.

#### Funcionalidades Essenciais (MVP - Mínimo Produto Viável)
1.  **Exploração de Conteúdo (Já implementado):**
    *   Página inicial (Landing Page) com filmes em destaque e populares, carregados dinamicamente.
    *   Página de detalhes do filme, com informações completas (sinopse, elenco, trailer, galeria, etc.).
    *   Sistema de busca global com sugestões em tempo real.

2.  **Autenticação e Gerenciamento de Usuário (A implementar):**
    *   Formulários de registro e login com validação no frontend e backend.
    *   Sistema de sessão para manter o usuário logado (login/logout).
    *   Área de perfil do usuário para visualizar e editar informações básicas.

3.  **Interatividade do Usuário (A implementar):**
    *   **"Minha Lista" (Watchlist):** Funcionalidade que permite ao usuário adicionar ou remover filmes de uma lista pessoal de "filmes para assistir".
    *   **Avaliações e Críticas:** Sistema para que usuários logados possam avaliar filmes (com notas de 1 a 5 estrelas) e escrever críticas.

#### Funcionalidades Futuras
*   **Listas Personalizadas:** Criação de múltiplas listas (ex: "Favoritos dos anos 90", "Melhores de Ficção Científica").
*   **Recursos Sociais:** Seguir outros usuários, ver a atividade de amigos (novas avaliações, adições à watchlist).
*   **Notificações:** Alertas sobre novos lançamentos de diretores favoritos ou quando um filme da "Minha Lista" se torna disponível em um serviço de streaming.

---

## 2. Diagrama de Componentes

O diagrama abaixo descreve a arquitetura de alto nível do sistema, mostrando os principais componentes e suas interações.

**Descrição dos Componentes:**

*   **Cliente (Navegador Web):** Renderiza a interface do usuário e envia requisições HTTP. É o ponto de entrada para todas as interações do usuário.

*   **Frontend (Estrutura já existente):**
    *   **Responsabilidade:** Lógica de apresentação, interatividade da interface e comunicação com o backend.
    *   **Tecnologias:** HTML5, CSS3 (com Flexbox/Grid para responsividade), JavaScript (ES6+).
    *   **Arquivos:** `landingpage.js`, `script.js`, `landingpage.css`, `style.css`.
    *   **Funcionamento:** Manipula o DOM para exibir dados dinâmicos, gerencia estados de UI (como skeletons e loading bars) e realiza chamadas assíncronas (Fetch API) para o backend.

*   **Backend (API PHP - Estrutura já existente):**
    *   **Responsabilidade:** Servir como um gateway seguro e centralizado. Orquestra o acesso aos dados, combinando informações da API externa (TMDB) e do banco de dados local.
    *   **Tecnologias:** PHP.
    *   **Arquivo Principal:** `api/api.php`.
    *   **Funcionamento:**
        1.  Atua como um **Proxy** para a API do TMDB, protegendo a chave da API.
        2.  Implementará **endpoints CRUD** para gerenciar dados de usuários, listas, avaliações, etc.
        3.  Processará a lógica de negócio e as validações do lado do servidor.

*   **Banco de Dados (A implementar):**
    *   **Responsabilidade:** Persistir todos os dados gerados pelos usuários.
    *   **Tecnologia:** MySQL (ou outro SGBD relacional).
    *   **Dados:** Armazenará informações de usuários, senhas (hashed), listas de filmes, avaliações e relações sociais.

*   **API Externa (TMDB):**
    *   **Responsabilidade:** Fornecer todos os dados brutos sobre filmes, como detalhes, elenco, imagens e vídeos.

---

## 3. Modelo de Dados

O diagrama a seguir representa a estrutura do banco de dados relacional que suportará as funcionalidades do sistema.

```
Table: usuarios {
  id INT [pk, increment]
  nome_usuario VARCHAR(50) [unique, not null]
  email VARCHAR(255) [unique, not null]
  senha_hash VARCHAR(255) [not null]
  data_criacao TIMESTAMP [default: `now()`]
}

Table: minha_lista {
  id INT [pk, increment]
  usuario_id INT [ref: > usuarios.id]
  filme_id INT [not null]
  data_adicao TIMESTAMP [default: `now()`]

  Indexes {
    (usuario_id, filme_id) [unique]
  }
}

Table: avaliacoes {
  id INT [pk, increment]
  usuario_id INT [ref: > usuarios.id]
  filme_id INT [not null]
  nota INT [not null] // Nota de 1 a 10, por exemplo
  critica TEXT
  data_avaliacao TIMESTAMP [default: `now()`]

  Indexes {
    (usuario_id, filme_id) [unique]
  }
}
```

**Descrição das Tabelas:**

*   **`usuarios`**: Armazena as informações de cada usuário registrado.
    *   `id`: Identificador único.
    *   `nome_usuario`: Nome público do usuário na plataforma.
    *   `email`: E-mail para login e comunicação.
    *   `senha_hash`: Senha do usuário armazenada de forma segura usando um algoritmo de hash (ex: `password_hash()` do PHP).
    *   `data_criacao`: Data e hora do registro.

*   **`minha_lista`**: Tabela de associação que representa a watchlist de cada usuário.
    *   `usuario_id`: Chave estrangeira que referencia o usuário.
    *   `filme_id`: ID do filme (proveniente do TMDB). Não é uma chave estrangeira, pois os dados do filme não estão no nosso banco.
    *   O índice único em `(usuario_id, filme_id)` garante que um usuário não possa adicionar o mesmo filme à sua lista mais de uma vez.

*   **`avaliacoes`**: Armazena as notas e críticas que os usuários fazem para os filmes.
    *   `usuario_id`: Chave estrangeira que referencia o usuário que fez a avaliação.
    *   `filme_id`: ID do filme (do TMDB) que foi avaliado.
    *   `nota`: A nota numérica dada pelo usuário (ex: de 1 a 10).
    *   `critica`: O texto da crítica (opcional).
    *   O índice único em `(usuario_id, filme_id)` garante que um usuário só possa avaliar um filme uma única vez.