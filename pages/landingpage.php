<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frameway</title>
    <link rel="stylesheet" href="../assets/css/landingpage.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- A linha abaixo foi removida para evitar conflito com a versão mais recente do Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"> </head>
<body>
    <div class="app-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1>FRAMEWAY</h1>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active"><i class="fas fa-home"></i> Início</a>
                <a href="#" class="nav-item"><i class="fas fa-film"></i> Minha Lista</a>
                <a href="#" class="nav-item"><i class="fas fa-users"></i> Comunidade</a>
            </nav>
            <div class="sidebar-footer">
                <a href="#" class="nav-item"><i class="fas fa-cog"></i> Configurações</a>
                <a href="#" class="nav-item"><i class="fas fa-question-circle"></i> Ajuda</a>
            </div>
        </aside>

        <main class="main-content">
            <!-- A barra de pesquisa foi movida para fora do header para ser um elemento independente -->
            <div class="search-container">
                <form id="search-form" class="search-form">
                    <input type="text" id="searchInput" placeholder="Buscar filmes..." autocomplete="off">
                    <button type="submit" aria-label="Buscar"><i class="fas fa-search"></i></button>
                </form>
                <div id="search-suggestions" class="search-suggestions"></div>
            </div>

            <header class="main-header">
                <div class="user-profile">
                    <i class="fas fa-bell"></i>
                    <img src="https://i.pravatar.cc/40?u=jennywilson" alt="Avatar do Usuário">
                    <span>Jenny Wilson</span>
                </div>
            </header>

            <section class="featured-section" id="featuredMovie">
                <div class="loading-shimmer featured-shimmer"></div>
            </section>

            <section class="offers-section">
                <div class="offers-header">
                    <h2>Populares no Momento</h2>
                    <a href="#" class="learn-more">Ver mais</a>
                </div>
                <!-- Estrutura de grid substituída pela estrutura de carrossel -->
                <div class="carousel-wrapper">
                    <button id="popular-prev-btn" class="carousel-arrow prev" aria-label="Anterior">&#10094;</button>
                    <div class="carousel" id="popularMoviesGrid">
                        <!-- Shimmers de carregamento -->
                        <div class="loading-shimmer card-shimmer"></div>
                        <div class="loading-shimmer card-shimmer"></div>
                        <div class="loading-shimmer card-shimmer"></div>
                        <div class="loading-shimmer card-shimmer"></div>
                    </div>
                    <button id="popular-next-btn" class="carousel-arrow next" aria-label="Próximo">&#10095;</button>
                </div>
            </section>
        </main>
    </div>

    <script src="../assets/js/landingpage.js"></script>
</body>
</html>