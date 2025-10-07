<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frameway</title>
    
    <link rel="stylesheet" href="style.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>

    <header class="main-header">
        <div class="container">
            <a href="/Frameway/" class="logo">FRAMEWAY</a>
            <nav class="main-nav">
                <div class="search-container">
                    <form id="search-form" class="search-form">
                        <input type="text" id="search-input" placeholder="Buscar filme..." aria-label="Buscar filme" autocomplete="off">
                        <button type="submit" aria-label="Buscar"><i class="fas fa-search"></i></button>
                    </form>
                    <div id="search-suggestions" class="search-suggestions"></div>
                </div>
            </nav>
        </div>
    </header>

    <!-- ... (cabeçalho inalterado) ... -->

    <main>
        <section class="hero-section" style="background-image: url('');">
        </section>

        <div class="container">
            <section class="movie-details">
                <div class="movie-header">
                    <h1><span id="movie-title" class="fade-target">CARREGANDO...</span> <span class="year fade-target" id="movie-year"></span></h1>
                    <p class="genres fade-target" id="movie-genres"></p>
                    <div class="rating-stars fade-target">
                        <!-- A lógica das estrelas pode ser implementada depois com JS -->
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="far fa-star"></i>
                    </div>
                </div>

                <div class="movie-stats">
                    <div class="stat">
                        <span class="stat-label">AVALIAÇÃO</span>
                        <span class="stat-value fade-target" id="stat-rating">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">DURAÇÃO</span>
                        <span class="stat-value fade-target" id="stat-runtime">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">ORÇAMENTO</span>
                        <span class="stat-value fade-target" id="stat-budget">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">LANÇAMENTO</span>
                        <span class="stat-value fade-target" id="stat-release">N/A</span>
                    </div>
                </div>

                <div class="movie-content">
                    <div class="left-column">
                        <img src="" alt="Movie Poster" class="movie-poster" id="movie-poster">
                        <h2>SINOPSE</h2>
                        <p id="movie-plot" class="fade-target">Carregando descrição...</p>
                        <button class="read-more">LEIA MAIS</button>
                    </div>
                    <div class="right-column">
                        <div class="director-info">
                            <p><strong>DIRETOR</strong><br><span id="director-name" class="fade-target">Carregando...</span></p>
                            <p><strong>ROTEIRISTA</strong><br><span id="writer-name" class="fade-target">Carregando...</span></p>
                            <p><strong>ESTRELAS</strong><br><span id="stars-names" class="fade-target">Carregando...</span></p>
                        </div>

                        <div class="action-icons">
                            <div class="icon-item"><i class="fas fa-users"></i><span>Elenco</span></div>
                            <div class="icon-item"><i class="fas fa-trophy"></i><span>Prêmios</span></div>
                            <div class="icon-item"><i class="fas fa-file-alt"></i><span>Sinopse</span></div>
                            <div class="icon-item"><i class="fas fa-images"></i><span>Galeria</span></div>
                            <div class="icon-item"><i class="fas fa-quote-right"></i><span>Citações</span></div>
                            <div class="icon-item"><i class="fas fa-info-circle"></i><span>Fatos</span></div>
                        </div>

                        <h2>TRAILER</h2>
                        <div class="trailer-thumbnails">
                            <!-- Thumbnails do trailer podem ser carregados dinamicamente -->
                            <img src="images/trailer-thumb1.jpg" alt="Trailer thumbnail 1">
                            <img src="images/trailer-thumb2.jpg" alt="Trailer thumbnail 2">
                            <img src="images/trailer-thumb3.jpg" alt="Trailer thumbnail 3">
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <section class="quote-section">
             <!-- Esta seção pode ser preenchida dinamicamente ou removida se não for usada -->
            <div class="container">
                <p>"Once you do something, you never forget. Even if you can't remember."</p>
                <span>ZENIBA</span>
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
                    <!-- O conteúdo será preenchido pelo script.js -->
                    <p style="text-align: center; width: 100%;">Carregando filmes relacionados...</p>
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
                <h3>NEWSLETTER</h3>
                <p>Keep in the loop with our Screen updates by subscribing to our yummy newsletter.</p>
                <form>
                    <input type="text" placeholder="Name">
                    <input type="email" placeholder="E-mail">
                    <button type="submit">INSCREVER</button>
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

    <script src="js/script.js"></script>
</body>
</html>