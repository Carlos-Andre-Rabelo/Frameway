<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frameway</title>
    
    <link rel="stylesheet" href="../assets/css/style.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>

    <div id="loading-bar"></div>

    <header class="main-header">
        <div class="container">
            <button class="hamburger-btn" aria-label="Menu">
                <i class="fas fa-bars"></i>
            </button>
            <a href="landingpage.php" class="logo">FRAMEWAY</a>
            <nav class="main-nav">
                <div class="search-container">
                    <form id="search-form" class="search-form">
                        <input type="text" id="searchInput" placeholder="Buscar filme..." aria-label="Buscar filme" autocomplete="off">
                        <button type="submit" aria-label="Buscar"><i class="fas fa-search"></i></button>
                    </form>
                    <div id="search-suggestions" class="search-suggestions"></div>
                </div>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero-section" style="background-image: url('');">
        </section>

        <div class="container movie-details-container">
            <section class="movie-details">
                <div class="movie-header">
                    <h1>
                        <span id="movie-title" class="fade-target skeleton skeleton-text"></span> 
                        <span class="year fade-target skeleton skeleton-text" id="movie-year"></span>
                    </h1>
                    <p class="genres fade-target skeleton skeleton-text" id="movie-genres"></p>
                    <div class="rating-stars fade-target skeleton skeleton-text">
                        <!-- Estrelas serão geradas pelo JS -->
                    </div>
                </div>

                <div class="movie-stats">
                    <div class="stat">
                        <span class="stat-label">AVALIAÇÃO</span>
                        <span class="stat-value fade-target skeleton skeleton-text" id="stat-rating"></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">DURAÇÃO</span>
                        <span class="stat-value fade-target skeleton skeleton-text" id="stat-runtime"></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">ORÇAMENTO</span>
                        <span class="stat-value fade-target skeleton skeleton-text" id="stat-budget"></span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">LANÇAMENTO</span>
                        <span class="stat-value fade-target skeleton skeleton-text" id="stat-release"></span>
                    </div>
                </div>

                <div class="movie-content">
                    <div class="left-column">
                        <div class="poster-info-wrapper">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Pôster do Filme" class="movie-poster skeleton" id="movie-poster">
                            <div class="director-info">
                                <p><strong>DIRETOR</strong><br><span id="director-name" class="fade-target skeleton skeleton-text"></span></p>
                                <p><strong>ROTEIRISTA</strong><br><span id="writer-name" class="fade-target skeleton skeleton-text"></span></p>
                                <p><strong>ELENCO</strong><br><span id="stars-names" class="fade-target skeleton skeleton-text"></span></p>
                            </div>
                        </div>
                        <h2>SINOPSE</h2>
                        <p id="movie-plot" class="fade-target skeleton skeleton-text-block"></p>
                    </div>
                    <div class="right-column">
                        <div class="action-icons">
                            <div class="icon-item" data-section="cast"><i class="fas fa-users"></i><span>Elenco</span></div>
                            <div class="icon-item" data-section="awards"><i class="fas fa-trophy"></i><span>Prêmios</span></div>
                            <div class="icon-item" data-section="gallery"><i class="fas fa-images"></i><span>Galeria</span></div>
                            <div class="icon-item" data-section="quotes"><i class="fas fa-quote-right"></i><span>Citações</span></div>
                            <div class="icon-item" data-section="facts"><i class="fas fa-info-circle"></i><span>Fatos</span></div>
                        </div>

                        <!-- Container para o conteúdo que será expandido -->
                        <div id="expandable-content" class="expandable-content">
                            <div class="expandable-content-inner">
                                <!-- O conteúdo dinâmico será inserido aqui -->
                            </div>
                        </div>

                        <div class="trailer-wrapper">
                            <h2 id="trailer-title">TRAILER</h2>
                            <div id="trailer-container" class="trailer-container">
                                <div class="skeleton skeleton-block"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <section class="quote-section">
            <div class="container">
                <p id="quote-text" class="skeleton skeleton-text"></p>
                <span id="quote-author" class="skeleton skeleton-text"></span>
            </div>
        </section>
    </main>

    <section class="related-movies">
        <!-- A seção de filmes relacionados exigiria uma chamada de API separada -->
        <div class="container">
            <h2>FILMES RELACIONADOS</h2>
            <div class="carousel-wrapper">
                <button id="prev-btn" class="carousel-arrow prev" aria-label="Anterior">&#10094;</button>
                <div class="carousel">
                    <!-- O conteúdo esqueleto será preenchido pelo script.js -->
                </div>
                <button id="next-btn" class="carousel-arrow next" aria-label="Próximo">&#10095;</button>
            </div>
        </div>
    </section>

    <footer class="main-footer">
        <div class="container">
            <div class="footer-column">
                <h3>FRAMEWAY</h3>
                <p>123 Fictional Street, Farringdon, London<br>email@example.com<br>Tel: +44 (0)20 4567 8910</p>
                <div class="social-icons">
                    <i class="fab fa-facebook-f"></i>
                    <i class="fab fa-twitter"></i>
                    <i class="fab fa-instagram"></i>
                </div>
            </div>
            <div class="footer-column">
                <h3>ENTRE EM CONTATO</h3>
                <p>Tem alguma dúvida ou sugestão? Mande uma mensagem para nós.</p>
                <form>
                    <input type="text" placeholder="Nome">
                    <input type="email" placeholder="E-mail">
                    <textarea placeholder="Sua mensagem..." rows="4"></textarea>
                    <button type="submit">ENVIAR</button>
                </form>
            </div>
            <div class="footer-column">
                <h3>CITAÇÃO</h3>
                <p>"Ooh, that's a bingo! Is that the way you say it? 'That's a bingo!'"</p>
                <span>COL. HANS LANDA<br>INGLOURIOUS BASTERDS</span>
            </div>
            <div class="footer-column">
                <h3>MENU</h3>
                <ul>
                    <li><a href="#">Filmes</a></li>
                    <li><a href="#">Sobre</a></li>
                    <li><a href="#">Contato</a></li>
                    <li><a href="#">Índice</a></li>
                    <li><a href="#">FAQs</a></li>
                    <li><a href="#">Downloads</a></li>
                </ul>
            </div>
        </div>
    </footer>

    <!-- NAVEGAÇÃO MOBILE FIXA -->
    <nav class="mobile-nav">
        <a href="#" class="mobile-nav-item active" aria-label="Início">
            <i class="fas fa-home"></i>
            <span>Início</span>
        </a>
        <a href="#" class="mobile-nav-item" aria-label="Favoritos">
            <i class="fas fa-heart"></i>
            <span>Favoritos</span>
        </a>
        <a href="#" class="mobile-nav-item" aria-label="Notificações">
            <i class="fas fa-bell"></i>
            <span>Notificações</span>
        </a>
        <a href="#" class="mobile-nav-item" aria-label="Configurações">
            <i class="fas fa-cog"></i>
            <span>Configurações</span>
        </a>
    </nav>

    <script src="../assets/js/script.js"></script>
</body>
</html>