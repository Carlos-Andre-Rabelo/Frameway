document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '../api/api.php';
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
    const featuredMovieContainer = document.getElementById('featuredMovie');
    const popularMoviesGrid = document.getElementById('popularMoviesGrid');

    // --- Elementos da Barra de Pesquisa ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const searchContainer = document.querySelector('.search-container');
    let debounceTimer;
    let searchAbortController = new AbortController();

    // --- IDs para conteúdo da página ---
    // Altere estes IDs para destacar outros filmes!
    const FEATURED_MOVIE_ID = 693134; // Duna: Parte Dois
    // Aumentado o número de filmes no carrossel
    const POPULAR_MOVIE_IDS = [823464, 1011985, 872585, 792307, 572802, 866398, 634492, 1072790]; // Godzilla x Kong, Kung Fu Panda 4, Oppenheimer, Pobres Criaturas, Aquaman 2, Beekeeper, Madame Web, Anyone But You

    /**
     * Função genérica para buscar dados da API
     * @param {string} query - A string de query, ex: 'movie_id=123'
     * @param {AbortSignal} [signal] - Sinal para cancelar a requisição
     * @returns {Promise<Object>} - Os dados da API em JSON
     */
    async function fetchData(query, signal) {
        try {
            const response = await fetch(`${API_URL}?${query}`, { signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            return null;
        }
    }

    /**
     * Trunca o texto para um número máximo de caracteres
     */
    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
    }

    /**
     * Busca e exibe o filme em destaque
     */
    async function displayFeaturedMovie() {
        // Otimização: Busca detalhes e imagens em paralelo
        const [movie, images, keywords] = await Promise.all([
            fetchData(`movie_id=${FEATURED_MOVIE_ID}`), // Detalhes do filme (inclui gêneros)
            fetchData(`images_for=${FEATURED_MOVIE_ID}`), // Imagens
            fetchData(`keywords_for=${FEATURED_MOVIE_ID}`) // Palavras-chave
        ]);

        if (!movie || !images || !keywords) {
            featuredMovieContainer.innerHTML = '<p>Não foi possível carregar o filme em destaque.</p>';
            return;
        }

        // Reduz a resolução da imagem principal de 'original' para 'w1280' para otimizar o carregamento.
        const backdropUrl = movie.backdrop_path ? `${IMAGE_BASE_URL}w1280${movie.backdrop_path}` : '';
        
        // MELHORIA: Filtra a lista de backdrops para remover a imagem que já está sendo usada como fundo principal,
        // garantindo que as imagens menores sejam diferentes.
        const availableStills = images.backdrops?.filter(img => img.file_path !== movie.backdrop_path) || [];

        // Pega os dois primeiros frames da lista filtrada.
        const still1Url = availableStills[0]?.file_path ? `${IMAGE_BASE_URL}w500${availableStills[0].file_path}` : '';
        const still2Url = availableStills[1]?.file_path ? `${IMAGE_BASE_URL}w500${availableStills[1].file_path}` : '';

        // Combina gêneros e palavras-chave para garantir que tenhamos mais tags
        const genreNames = movie.genres?.map(g => g.name) || [];
        const keywordNames = keywords.keywords?.map(k => k.name) || [];
        const allTags = [...genreNames, ...keywordNames];

        // Pega as 4 primeiras tags da lista combinada
        const tagsHtml = allTags.slice(0, 4).map(tagName => `<span class="tag">${tagName}</span>`).join('') || '';

        // Nova estrutura com divisão 2/3 e 1/3
        featuredMovieContainer.innerHTML = `
            <div class="featured-hero">
                <div class="featured-tags">
                    ${tagsHtml}
                </div>
                <img src="${backdropUrl}" class="featured-background" alt="Cena de ${movie.title}">
            </div>
            <div class="featured-side">
                <div class="featured-side-top" style="background-image: url('${backdropUrl}')">
                  <div class="featured-content">
                    <h2>${movie.title}</h2>
                    <p>${truncateText(movie.overview, 250)}</p>
                    <button class="featured-button" onclick="window.location.href='../pages/filmes.php?movie=${FEATURED_MOVIE_ID}'">
                        <i class="fas fa-play"></i> Saiba Mais
                    </button>
                  </div>
                </div>
                <div class="featured-side-bottom">
                    <div class="featured-side-bottom-left">
                        ${still1Url ? `<img src="${still1Url}" alt="Frame 1 de ${movie.title}">` : ''}
                    </div>
                    <div class="featured-side-bottom-right">
                        ${still2Url ? `<img src="${still2Url}" alt="Frame 2 de ${movie.title}">` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Busca e exibe os filmes populares
     */
    function displayPopularMovies() {
        popularMoviesGrid.innerHTML = ''; // Limpa os shimmers de carregamento

        // CORREÇÃO: Inicia a lógica do carrossel imediatamente para que os botões funcionem
        setupCarouselLogic();

        // Busca todos os filmes em paralelo
        const moviePromises = POPULAR_MOVIE_IDS.map(id => fetchData(`movie_id=${id}`));

        Promise.all(moviePromises).then(movies => {
            movies.forEach((movie, index) => {
                if (movie && movie.poster_path) {
                    // Aumentada a resolução da imagem para w300
                    const posterUrl = `${IMAGE_BASE_URL}w342${movie.poster_path}`;
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    movieCard.dataset.movieId = movie.id; // Adiciona o ID para o redirecionamento
                    movieCard.style.animationDelay = `${index * 0.1}s`; // Efeito cascata
                    
                    // REFEITO: Nova estrutura com card-expander para a animação correta
                    movieCard.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front">
                                <img src="${posterUrl}" alt="${movie.title}">
                            </div>
                        </div>
                        <div class="card-expander">
                            <div class="card-back">
                                <div class="card-back-content">
                                    <h3>${movie.title}</h3>
                                </div>
                            </div>
                        </div>`;
                    popularMoviesGrid.appendChild(movieCard);
                }
            });

            // Após todos os cards serem adicionados, duplica-os para o efeito de loop infinito
            const originalCards = popularMoviesGrid.querySelectorAll('.movie-card');
            originalCards.forEach(card => {
                popularMoviesGrid.appendChild(card.cloneNode(true));
            });

            // Inicia o pré-carregamento dos backdrops em segundo plano
            preloadBackdrops(movies);
        });
    }

    /**
     * Redireciona para a página de detalhes do filme
     * @param {string} movieId - O ID do filme
     */
    function redirectToMoviePage(movieId) {
        window.location.href = `../pages/filmes.php?movie=${movieId}`;
    }

    // --- LÓGICA DA BARRA DE PESQUISA (SINCRONIZADA COM SCRIPT.JS) ---

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            const data = await fetchData(`search=${query}`);
            if (data && data.results && data.results.length > 0) {
                const firstMovieId = data.results[0].id;
                redirectToMoviePage(firstMovieId);
            } else {
                alert('Nenhum filme encontrado com esse nome.');
            }
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(debounceTimer);
        searchAbortController.abort();
        searchAbortController = new AbortController();

        if (query.length < 2) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            searchContainer.classList.remove('suggestions-open');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const data = await fetchData(`search=${query}`, searchAbortController.signal);
                suggestionsContainer.innerHTML = '';

                if (data && data.results && data.results.length > 0) {
                    searchContainer.classList.add('suggestions-open');
                    const suggestions = data.results.slice(0, 5);
                    suggestions.forEach(movie => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        item.dataset.movieId = movie.id;

                        const posterUrl = movie.poster_path ? `${IMAGE_BASE_URL}w92${movie.poster_path}` : '../assets/images/placeholder-poster.png';
                        const year = movie.release_date ? ` (${movie.release_date.substring(0, 4)})` : '';

                        item.innerHTML = `
                            <img src="${posterUrl}" alt="${movie.title}">
                            <div>${movie.title}${year}</div>
                        `;
                        suggestionsContainer.appendChild(item);
                    });
                    suggestionsContainer.style.transform = 'scaleY(1)';
                    suggestionsContainer.style.opacity = '1';
                } else {
                    suggestionsContainer.style.transform = 'scaleY(0)';
                    suggestionsContainer.style.opacity = '0';
                    searchContainer.classList.remove('suggestions-open');
                }
            } catch (error) {
                if (error.name !== 'AbortError') console.error("Erro na busca por sugestões:", error);
            }
        }, 300);
    });

    suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            // CORREÇÃO: Garante que o movieId seja lido do dataset do elemento clicado
            const movieId = suggestionItem.dataset.movieId;
            redirectToMoviePage(movieId);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            searchContainer.classList.remove('suggestions-open');
        }
    });

    popularMoviesGrid.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard && movieCard.dataset.movieId) {
            redirectToMoviePage(movieCard.dataset.movieId);
        }
    });

    // --- Inicia o carregamento da página ---
    displayFeaturedMovie();
    displayPopularMovies();

    /**
     * Pré-carrega os backdrops dos filmes em segundo plano para uma transição de hover suave.
     * @param {Array<Object>} movies - A lista de objetos de filmes.
     */
    function preloadBackdrops(movies) {
        movies.forEach(movie => {
            if (movie && movie.backdrop_path) {
                const backdropUrl = `${IMAGE_BASE_URL}w780${movie.backdrop_path}`;
                const img = new Image();
                img.src = backdropUrl;

                // Quando a imagem do backdrop terminar de carregar...
                img.onload = () => {
                    // ...encontra todos os cards correspondentes (original e clone)
                    const cardsToUpdate = document.querySelectorAll(`.movie-card[data-movie-id='${movie.id}']`);
                    cardsToUpdate.forEach(card => {
                        const cardBack = card.querySelector('.card-expander .card-back');
                        if (cardBack) {
                            cardBack.style.backgroundImage = `url('${backdropUrl}')`;
                        }
                    });
                };
            }
        });
    }

    /**
     * Configura toda a lógica do carrossel, incluindo botões e swipe.
     * (Lógica adaptada de script.js)
     */
    function setupCarouselLogic() {
        const carousel = document.getElementById('popularMoviesGrid');
        const prevBtn = document.getElementById('popular-prev-btn');
        const nextBtn = document.getElementById('popular-next-btn');
        if (!carousel || !prevBtn || !nextBtn) return;

        let isTransitioning = false;
        let currentIndex = 0;
        
        // Variáveis para a funcionalidade de arrastar (swipe)
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let velocity = 0;
        let lastMoveTime = 0;
        let lastMovePos = 0;

        const getCardWidth = () => {
            const firstCard = carousel.querySelector('.movie-card');
            if (!firstCard) return 0;
            const carouselStyle = window.getComputedStyle(carousel);
            const gap = parseInt(carouselStyle.gap, 10) || 0;
            // CORREÇÃO: O cálculo deve incluir a largura do card + o espaçamento (gap)
            return firstCard.offsetWidth + gap;
        }

        carousel.addEventListener('transitionend', () => {
            isTransitioning = false;
            const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;

            // CORREÇÃO: A condição deve ser estritamente igual para o salto ocorrer no momento exato.
            if (currentIndex === originalCardCount) {
                currentIndex = 0;
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(0)`;
                carousel.offsetHeight; 
                carousel.style.transition = '';
            }

            if (currentIndex < 0) {
                currentIndex = originalCardCount - 1;
                const cardWidth = getCardWidth();
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                carousel.offsetHeight;
                carousel.style.transition = '';
            }
        });

        nextBtn.addEventListener('click', () => {
            if (isTransitioning || carousel.children.length <= 1) return;
            isTransitioning = true;
            
            const cardWidth = getCardWidth();
            currentIndex++;
            carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        });

        prevBtn.addEventListener('click', () => {
            if (isTransitioning || carousel.children.length <= 1) return;
            isTransitioning = true;

            const cardWidth = getCardWidth();

            if (currentIndex === 0) {
                const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;
                currentIndex = originalCardCount;
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                carousel.offsetHeight;
                carousel.style.transition = '';
            }

            requestAnimationFrame(() => {
                currentIndex--;
                carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            });
        });

        // --- LÓGICA DE ARRASTAR (SWIPE) ---
        const getTranslateX = () => {
            const style = window.getComputedStyle(carousel);
            const matrix = new DOMMatrix(style.transform);
            return matrix.m41;
        }

        const setTranslateX = (x) => {
            carousel.style.transform = `translateX(${x}px)`;
        }

        const dragStart = (e) => {
            if (isTransitioning || carousel.children.length <= 1) return;
            isDragging = true;
            startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            lastMovePos = startPos;
            lastMoveTime = performance.now();
            velocity = 0;
            currentTranslate = getTranslateX();
            carousel.style.transition = 'none';
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const diff = currentPosition - startPos;
            setTranslateX(currentTranslate + diff);

            const now = performance.now();
            const elapsed = now - lastMoveTime;
            if (elapsed > 10) {
                const distance = currentPosition - lastMovePos;
                velocity = distance / elapsed;
                lastMoveTime = now;
                lastMovePos = currentPosition;
            }
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            const cardWidth = getCardWidth();
            const currentPosition = getTranslateX();
            const momentumFactor = 120; 
            const momentumDistance = velocity * momentumFactor;
            let finalPosition = currentPosition + momentumDistance;

            currentIndex = Math.round(-finalPosition / cardWidth);

            const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;
            currentIndex = Math.max(0, Math.min(currentIndex, originalCardCount));

            finalPosition = -currentIndex * cardWidth;

            carousel.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            setTranslateX(finalPosition);
            isTransitioning = true;
        };

        carousel.addEventListener('mousedown', dragStart);
        carousel.addEventListener('touchstart', dragStart, { passive: true });
        carousel.addEventListener('mousemove', dragMove);
        carousel.addEventListener('touchmove', dragMove, { passive: true });
        carousel.addEventListener('mouseup', dragEnd);
        carousel.addEventListener('mouseleave', dragEnd);
        carousel.addEventListener('touchend', dragEnd);
    }
});