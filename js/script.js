document.addEventListener('DOMContentLoaded', () => {
    // Lógica para o cabeçalho com efeito de scroll
    const header = document.querySelector('.main-header');
    const mainContent = document.querySelector('main'); // Alvo agora é o <main>

    if (header || mainContent) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            // Efeito de blur no header
            if (header) {
                header.classList.toggle('scrolled', scrollY > 50);
            }

            // Efeito de blur gradual na imagem de fundo do <main>
            if (mainContent) {
                // Aumenta o blur até um máximo de 10px, baseado na rolagem
                const blurAmount = Math.min(10, scrollY / 50).toFixed(2);
                mainContent.style.setProperty('--bg-blur', `${blurAmount}px`);
            }
        });
    }


    // Carrega um filme padrão na inicialização
    const movieId = 129; // ID padrão para "A Viagem de Chihiro"
    loadMovieData(movieId);

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    let debounceTimer;

    // Lógica para expandir a busca
    const searchContainer = document.querySelector('.search-container');
    const searchButton = searchForm.querySelector('button');

    searchButton.addEventListener('click', (e) => {
        // Se a busca não estiver expandida, previne o envio do formulário e a expande.
        if (!searchContainer.classList.contains('active')) {
            e.preventDefault();
            searchContainer.classList.add('active');
            searchInput.focus(); // Foca no input
        }
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query && searchContainer.classList.contains('active')) { // Só busca se o campo estiver visível
            // Busca pelo filme e carrega o primeiro resultado
            fetchAndProcess(`api.php?search=${query}`, (data) => {
                if (data.results && data.results.length > 0) {
                    const firstMovieId = data.results[0].id;
                    loadMovieData(firstMovieId);
                    searchInput.value = ''; // Limpa o campo após a busca
                    suggestionsContainer.style.transform = 'scaleY(0)'; // Esconde sugestões com animação
                    suggestionsContainer.style.opacity = '0';
                    searchContainer.classList.remove('active'); // Recolhe a barra de busca
                } else {
                    alert('Nenhum filme encontrado com esse nome.');
                }
            });
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            searchContainer.classList.remove('suggestions-open');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchAndProcess(`api.php?search=${query}`, (data) => {
                // Limpa o container e cria o wrapper se ele não existir
                suggestionsContainer.innerHTML = ''; 

                if (data.results && data.results.length > 0) {
                    searchContainer.classList.add('suggestions-open');
                    const suggestions = data.results.slice(0, 5); // Pega as 5 primeiras sugestões
                    suggestions.forEach(movie => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        item.dataset.movieId = movie.id;
                        
                        // Cria a imagem do pôster
                        const posterUrl = movie.poster_path 
                            ? `${imageBaseUrl}w92${movie.poster_path}` 
                            : 'images/placeholder-poster.png'; // Sugestão: crie um placeholder pequeno
                        const img = document.createElement('img');
                        img.src = posterUrl;
                        img.alt = movie.title;
                        
                        // Cria o texto da sugestão
                        const textDiv = document.createElement('div');
                        let suggestionText = movie.title;
                        if (movie.release_date) {
                            const year = movie.release_date.substring(0, 4);
                            suggestionText += ` (${year})`;
                        }
                        textDiv.textContent = suggestionText;
                        
                        item.appendChild(img);
                        item.appendChild(textDiv);
                        suggestionsContainer.appendChild(item); // Adiciona o item diretamente
                    });
                    suggestionsContainer.style.transform = 'scaleY(1)';
                    suggestionsContainer.style.opacity = '1';
                } else {
                    suggestionsContainer.style.transform = 'scaleY(0)';
                    suggestionsContainer.style.opacity = '0';
                    searchContainer.classList.remove('suggestions-open');
                }
            });
        }, 300); // Espera 300ms após o usuário parar de digitar
    });

    suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            const movieId = suggestionItem.dataset.movieId;
            loadMovieData(movieId);
            searchInput.value = ''; // Limpa o input
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            searchContainer.classList.remove('suggestions-open');
        }
    });

    // Esconde as sugestões se clicar fora
    document.addEventListener('click', (e) => {
        const searchContainer = e.target.closest('.search-container');
        if (!searchContainer) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            document.querySelector('.search-container').classList.remove('suggestions-open');
            document.querySelector('.search-container').classList.remove('active');
        }
    });

    // Adiciona um listener de clique no carrossel (delegação de evento)
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('click', (e) => {
            const movieCard = e.target.closest('.movie-card');
            if (movieCard && movieCard.dataset.movieId) {
                const movieId = movieCard.dataset.movieId;
                loadMovieData(movieId);
            }
        });
    }

    // Lógica para o botão "LEIA MAIS" da sinopse
    const readMoreBtn = document.querySelector('.read-more');
    const moviePlot = document.getElementById('movie-plot');

    if (readMoreBtn && moviePlot) {
        readMoreBtn.addEventListener('click', () => {
            moviePlot.classList.toggle('expanded');
            if (moviePlot.classList.contains('expanded')) {
                readMoreBtn.textContent = 'LER MENOS';
            } else {
                readMoreBtn.textContent = 'LEIA MAIS';
            }
        });
    }

    // Configura os botões do carrossel uma única vez
    setupCarouselButtons();
});

function loadMovieData(movieId) {
    // 1. Seleciona todos os elementos de conteúdo e os torna invisíveis (fade-out)
    const fadeTargets = document.querySelectorAll('.fade-target');
    fadeTargets.forEach(el => {
        el.style.opacity = '0';
    });

    // 2. Espera a animação de fade-out terminar para então carregar os novos dados
    setTimeout(() => { // O tempo deve ser igual ou maior que a transição no CSS
        // Rola a página para o topo suavemente
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        fetchAndProcess(`api.php?movie_id=${movieId}&language=pt-BR`, updateMovieDetails);
        fetchAndProcess(`api.php?credits_for=${movieId}`, updateMovieCredits);
        fetchAndProcess(`api.php?related_to=${movieId}`, updateRelatedMovies);
    }, 300); 
}

/**
 * Função auxiliar para fazer requisições fetch e processar a resposta.
 * @param {string} url - A URL para a requisição.
 * @param {function} callback - A função a ser chamada com os dados bem-sucedidos.
 */
function fetchAndProcess(url, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error(`Erro da API em ${url}:`, data.error);
                return;
            }
            callback(data);
        })
        .catch(error => {
            console.error('Houve um problema com a requisição fetch:', error);
        });
}

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

function updateMovieDetails(movie) {
    const mainContent = document.querySelector('main');

    if (mainContent && movie.backdrop_path) {
        const backdropUrl = `${imageBaseUrl}original${movie.backdrop_path}`;
        // Define a variável CSS para a imagem de fundo no pseudo-elemento do <main>
        mainContent.style.setProperty('--bg-image', `url('${backdropUrl}')`);
    }

    const movieTitle = document.getElementById('movie-title');
    const movieYear = document.getElementById('movie-year');
    const movieGenres = document.getElementById('movie-genres');
    const ratingStarsContainer = document.querySelector('.rating-stars');

    if (movieTitle) movieTitle.textContent = movie.title.toUpperCase();
    if (movieYear) movieYear.textContent = `(${new Date(movie.release_date).getFullYear()})`;
    if (movieGenres) movieGenres.textContent = movie.genres.map(g => g.name).join(' | ');

    document.getElementById('stat-rating').textContent = movie.vote_average.toFixed(1);
    document.getElementById('stat-runtime').textContent = `${movie.runtime} mins`;
    document.getElementById('stat-budget').textContent = movie.budget > 0 ? `$${movie.budget.toLocaleString('en-US')}` : 'N/A';
    document.getElementById('stat-release').textContent = new Date(movie.release_date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();

    if (ratingStarsContainer && movie.vote_average) {
        ratingStarsContainer.innerHTML = generateStarRating(movie.vote_average);
    }

    const moviePoster = document.getElementById('movie-poster');
    const moviePlot = document.getElementById('movie-plot');

    if (moviePoster && movie.poster_path) {
        moviePoster.src = `${imageBaseUrl}w500${movie.poster_path}`;
        moviePoster.alt = `${movie.title} Poster`;
    }
    if (moviePlot) moviePlot.textContent = movie.overview;

    // Lógica para exibir ou esconder o botão "LEIA MAIS"
    const readMoreBtn = document.querySelector('.read-more');
    if (moviePlot && readMoreBtn) {
        // Reseta o estado antes de verificar a altura
        moviePlot.classList.remove('expanded');
        readMoreBtn.textContent = 'LEIA MAIS';

        // Verifica se o conteúdo é maior que a área visível
        if (moviePlot.scrollHeight > moviePlot.clientHeight) {
            readMoreBtn.style.display = 'block';
        } else {
            readMoreBtn.style.display = 'none';
        }
    }

    // 3. Torna os elementos visíveis novamente para iniciar o fade-in
    const fadeTargets = document.querySelectorAll('.fade-target');
    // Usar um pequeno timeout garante que o navegador processe as atualizações de conteúdo antes de iniciar a animação
    setTimeout(() => {
        fadeTargets.forEach(el => el.style.opacity = '1');
    }, 50);
}

/**
 * Gera o HTML para as estrelas de avaliação com base em uma nota de 0 a 10.
 * @param {number} rating - A nota do filme (ex: 8.7).
 * @returns {string} O HTML com os ícones de estrela.
 */
function generateStarRating(rating) {
    const ratingOutOf5 = rating / 2;
    let starsHtml = '';
    const fullStars = Math.floor(ratingOutOf5);
    const hasHalfStar = (ratingOutOf5 - fullStars) >= 0.25; // Limiar para mostrar meia estrela

    // Adiciona estrelas cheias
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }

    // Adiciona meia estrela se aplicável
    if (hasHalfStar && fullStars < 5) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }

    // Adiciona estrelas vazias para completar 5
    const totalStars = fullStars + (hasHalfStar && fullStars < 5 ? 1 : 0);
    for (let i = 0; i < 5 - totalStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }

    return starsHtml;
}

function updateMovieCredits(credits) {
    const director = credits.crew.find(person => person.job === 'Director');
    const writer = credits.crew.find(person => person.department === 'Writing'); // Pega o primeiro roteirista
    const stars = credits.cast.slice(0, 3).map(person => person.name).join(', ');

    document.getElementById('director-name').textContent = director ? director.name : 'Não disponível';
    document.getElementById('writer-name').textContent = writer ? writer.name : 'Não disponível';
    document.getElementById('stars-names').textContent = stars || 'Não disponível';

    // Garante que os créditos também apareçam com o fade-in
    document.querySelectorAll('#director-name, #writer-name, #stars-names').forEach(el => {
        el.style.opacity = '1';
    });
}

function updateRelatedMovies(related) {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    carousel.innerHTML = ''; // Limpa o conteúdo

    if (related.results && related.results.length > 0) {
        const moviesToShow = related.results.slice(0, 10);

        moviesToShow.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.dataset.movieId = movie.id; // Adiciona o ID do filme ao card
            const posterUrl = movie.poster_path ? `${imageBaseUrl}w342${movie.poster_path}` : 'images/placeholder.png'; // TODO: Crie uma imagem placeholder
            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${movie.title}">
                <p>${movie.title.toUpperCase()}</p>
            `;
            carousel.appendChild(movieCard);
        });

        // Lógica de clonagem para o carrossel infinito
        const originalCards = carousel.querySelectorAll('.movie-card');
        // Clona os primeiros itens e adiciona ao final
        originalCards.forEach(card => {
            carousel.appendChild(card.cloneNode(true));
        });

    } else {
        carousel.innerHTML = '<p style="text-align: center; width: 100%; color: white;">Nenhum filme relacionado encontrado.</p>';
    }
}

function setupCarouselButtons() {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (!carousel || !prevBtn || !nextBtn) return;

    let isTransitioning = false;
    let currentIndex = 0;

    carousel.addEventListener('transitionend', () => {
        isTransitioning = false;
        const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;

        // Se chegamos ao clone do início (no final da lista)
        if (currentIndex >= originalCardCount) {
            currentIndex = 0;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(0)`;
            // Força o reflow para aplicar a mudança antes de reativar a transição
            carousel.offsetHeight; 
            carousel.style.transition = '';
        }

        // Se chegamos ao clone do final (no início da lista)
        if (currentIndex < 0) {
            currentIndex = originalCardCount - 1;
            const cardWidth = carousel.querySelector('.movie-card').offsetWidth + 20;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            carousel.offsetHeight;
            carousel.style.transition = '';
        }
    });

    nextBtn.addEventListener('click', () => {
        if (isTransitioning || carousel.children.length <= 1) return;
        isTransitioning = true;
        
        const cardWidth = carousel.querySelector('.movie-card').offsetWidth + 20; // Largura + gap
        currentIndex++;
        carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });

    prevBtn.addEventListener('click', () => {
        if (isTransitioning || carousel.children.length <= 1) return;
        isTransitioning = true;

        const cardWidth = carousel.querySelector('.movie-card').offsetWidth + 20;

        // Se estamos no primeiro item, precisamos saltar para o clone final para criar a ilusão de loop
        if (currentIndex === 0) {
            const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;
            currentIndex = originalCardCount;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            carousel.offsetHeight; // Força o reflow
            carousel.style.transition = '';
        }

        // Agora, anima para o item anterior
        // Usar requestAnimationFrame garante que a animação comece no próximo quadro de renderização,
        // tornando a transição mais suave após o salto.
        requestAnimationFrame(() => {
            currentIndex--;
            carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        });
    });
}
