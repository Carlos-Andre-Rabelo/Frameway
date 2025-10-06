<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movie Profile - Spirited Away</title>
    
    <link rel="stylesheet" href="style.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>

    <header class="main-header">
        <div class="container">
            <a href="#" class="logo">SCRN</a>
            <nav class="main-nav">
                <i class="fas fa-search"></i>
                <i class="fas fa-user"></i>
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
                    <h1><span id="movie-title">CARREGANDO...</span> <span class="year" id="movie-year"></span></h1>
                    <p class="genres" id="movie-genres"></p>
                    <div class="rating-stars">
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
                        <span class="stat-label">RATING</span>
                        <span class="stat-value" id="stat-rating">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">RUNNING TIME</span>
                        <span class="stat-value" id="stat-runtime">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">BUDGET</span>
                        <span class="stat-value" id="stat-budget">N/A</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">RELEASE DATE</span>
                        <span class="stat-value" id="stat-release">N/A</span>
                    </div>
                </div>

                <div class="movie-content">
                    <div class="left-column">
                        <img src="" alt="Movie Poster" class="movie-poster" id="movie-poster">
                        <h2>PLOT</h2>
                        <p id="movie-plot">Carregando descrição...</p>
                        <button class="read-more">READ MORE</button>
                    </div>
                    <div class="right-column">
                        <div class="director-info">
                            <!-- Informações do diretor/elenco podem exigir outra chamada à API (créditos) -->
                            <p><strong>DIRECTOR</strong><br>A ser carregado</p>
                            <p><strong>WRITER</strong><br>A ser carregado</p>
                            <p><strong>STARS</strong><br>A ser carregado</p>
                        </div>

                        <div class="action-icons">
                            <div class="icon-item"><i class="fas fa-users"></i><span>Cast & Crew</span></div>
                            <div class="icon-item"><i class="fas fa-trophy"></i><span>Awards</span></div>
                            <div class="icon-item"><i class="fas fa-file-alt"></i><span>Plot</span></div>
                            <div class="icon-item"><i class="fas fa-images"></i><span>Gallery</span></div>
                            <div class="icon-item"><i class="fas fa-quote-right"></i><span>Quotes</span></div>
                            <div class="icon-item"><i class="fas fa-info-circle"></i><span>Facts</span></div>
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
            <h2>RELATED MOVIES</h2>
            <div class="carousel">
                <p style="text-align: center; width: 100%;">Filmes relacionados podem ser carregados aqui.</p>
            </div>
        </div>
    </section>

    <!-- ... (rodapé inalterado) ... -->
        </div>
    </footer>

    <script src="js/script.js"></script>
</body>
</html>