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
    const POPULAR_MOVIE_IDS = [823464, 1011985, 872585, 792307, 572802]; // Godzilla x Kong, Kung Fu Panda 4, Oppenheimer, Pobres Criaturas, O Abutre

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
        const movie = await fetchData(`movie_id=${FEATURED_MOVIE_ID}`);
        if (!movie) {
            featuredMovieContainer.innerHTML = '<p>Não foi possível carregar o filme em destaque.</p>';
            return;
        }

        const backdropUrl = movie.backdrop_path ? `${IMAGE_BASE_URL}original${movie.backdrop_path}` : '';

        featuredMovieContainer.innerHTML = `
            <img src="${backdropUrl}" class="featured-background" alt="Poster de ${movie.title}">
            <div class="featured-content">
                <h2>${movie.title}</h2>
                <p>${truncateText(movie.overview, 250)}</p>
                <button class="featured-button" onclick="window.location.href='../pages/filmes.php?movie=${FEATURED_MOVIE_ID}'">
                    <i class="fas fa-play"></i> Saiba Mais
                </button>
            </div>
        `;
    }

    /**
     * Busca e exibe os filmes populares
     */
    async function displayPopularMovies() {
        popularMoviesGrid.innerHTML = ''; // Limpa os shimmers de carregamento

        for (const id of POPULAR_MOVIE_IDS) {
            const movie = await fetchData(`movie_id=${id}`);
            if (movie && movie.poster_path) {
                const posterUrl = `${IMAGE_BASE_URL}w500${movie.poster_path}`;
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.dataset.movieId = id; // Adiciona o ID para o redirecionamento
                movieCard.style.animationDelay = `${POPULAR_MOVIE_IDS.indexOf(id) * 0.1}s`; // Efeito cascata
                movieCard.innerHTML = `<img src="${posterUrl}" alt="${movie.title}">`;
                popularMoviesGrid.appendChild(movieCard);
            }
        }
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
});