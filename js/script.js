document.addEventListener('DOMContentLoaded', () => {
    const movieId = 129; // ID padrão para "A Viagem de Chihiro"

    fetch(`api.php?movie_id=${movieId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Erro da API:', data.error);
                // Opcional: exibir uma mensagem de erro para o usuário na página
                return;
            }
            updateMovieDetails(data);
        })
        .catch(error => {
            console.error('Houve um problema com a requisição fetch:', error);
        });
});

function updateMovieDetails(movie) {
    // --- URLs base para imagens ---
    const imageBaseUrl = 'https://image.tmdb.org/t/p/';

    // --- Atualiza o fundo do Hero ---
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && movie.backdrop_path) {
        heroSection.style.backgroundImage = `url('${imageBaseUrl}w1280${movie.backdrop_path}')`;
    }

    // --- Atualiza o Cabeçalho do Filme ---
    const movieTitle = document.getElementById('movie-title');
    const movieYear = document.getElementById('movie-year');
    const movieGenres = document.getElementById('movie-genres');

    if (movieTitle) movieTitle.textContent = movie.title.toUpperCase();
    if (movieYear) movieYear.textContent = `(${new Date(movie.release_date).getFullYear()})`;
    if (movieGenres) movieGenres.textContent = movie.genres.map(g => g.name).join(' | ');

    // --- Atualiza as Estatísticas ---
    document.getElementById('stat-rating').textContent = movie.vote_average.toFixed(1); // Usando a nota da API
    document.getElementById('stat-runtime').textContent = `${movie.runtime} mins`;
    document.getElementById('stat-budget').textContent = `$${movie.budget.toLocaleString('en-US')}`;
    document.getElementById('stat-release').textContent = new Date(movie.release_date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();


    // --- Atualiza a Coluna Esquerda ---
    const moviePoster = document.getElementById('movie-poster');
    const moviePlot = document.getElementById('movie-plot');

    if (moviePoster && movie.poster_path) {
        moviePoster.src = `${imageBaseUrl}w500${movie.poster_path}`;
        moviePoster.alt = `${movie.title} Poster`;
    }
    if (moviePlot) moviePlot.textContent = movie.overview;

    // --- Atualiza a Coluna Direita (Diretor, etc.) ---
    // A API v3 precisa de uma chamada extra para créditos para obter essa informação de forma confiável.
    // Por simplicidade, vamos deixar estático por enquanto ou você pode adicionar uma nova chamada à API.
    // Exemplo: fetch(`api.php?credits_for=${movieId}`).then(...)
}
