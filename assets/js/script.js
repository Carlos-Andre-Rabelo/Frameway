let currentMovieData = {
    details: null,
    credits: null,
    images: null,
};

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

    // Listener para o botão "voltar" do navegador
    window.addEventListener('popstate', (event) => {
        // Se o estado tiver um movieId, carrega esse filme.
        // O 'event.state' pode ser nulo se o usuário voltou para o estado inicial da página.
        if (event.state && event.state.movieId) {
            // Passamos 'false' para não adicionar um novo estado ao histórico
            loadMovieData(event.state.movieId, false);
        } else {
            // Se não houver estado, podemos carregar o filme padrão ou o primeiro da URL
            const initialMovieId = 129; // ID de "A Viagem de Chihiro"
            loadMovieData(initialMovieId, false);
        }
    });

    // Carrega um filme padrão na inicialização
    const movieId = 129; // ID padrão para "A Viagem de Chihiro"
    loadMovieData(movieId);

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    const searchContainer = document.querySelector('.search-container'); // Ainda necessário para as sugestões
    let debounceTimer;    
    let searchAbortController = new AbortController(); // Controlador para cancelar buscas

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Busca pelo filme e carrega o primeiro resultado
            fetchAndProcess(`../api/api.php?search=${query}`).then((data) => {
                if (data.results && data.results.length > 0) {
                    const firstMovieId = data.results[0].id;
                    loadMovieData(firstMovieId);
                    searchInput.value = ''; // Limpa o campo após a busca
                    suggestionsContainer.style.transform = 'scaleY(0)'; // Esconde sugestões com animação
                    suggestionsContainer.style.opacity = '0';
                } else {
                    alert('Nenhum filme encontrado com esse nome.');
                }
            });
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(debounceTimer);
        // Cancela a busca anterior antes de iniciar uma nova
        searchAbortController.abort();
        searchAbortController = new AbortController();

        if (query.length < 3) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            searchContainer.classList.remove('suggestions-open');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchAndProcess(`../api/api.php?search=${query}`, searchAbortController.signal).then((data) => {
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
                            : '../assets/images/placeholder-poster.png'; // Sugestão: crie um placeholder pequeno
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
            }).catch(error => {
                // Ignora erros de aborto, que são esperados
                if (error.name !== 'AbortError') console.error("Erro na busca por sugestões:", error);
            });;
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
        const topSearchContainer = document.querySelector('.search-container');
        if (!searchContainer) {
            suggestionsContainer.style.transform = 'scaleY(0)';
            suggestionsContainer.style.opacity = '0';
            if (topSearchContainer) { // Verifica se o elemento existe antes de modificar
                topSearchContainer.classList.remove('suggestions-open');
            }
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

    // Configura os botões do carrossel uma única vez
    setupCarouselButtons();

    setupExpandableColumn();
});

function setSkeletonState(isLoading, scope = document) {
    const elements = scope.querySelectorAll('.skeleton');
    const relatedCarousel = document.querySelector('.related-movies .carousel');

    if (isLoading) {
        // Limpa e preenche o carrossel com esqueletos para o estado de carregamento
        if (relatedCarousel) {
            relatedCarousel.innerHTML = ''; // Limpa conteúdo antigo
            for (let i = 0; i < 10; i++) {
                relatedCarousel.innerHTML += `
                    <div class="movie-card skeleton">
                        <div class="skeleton skeleton-block" style="width: 150px; height: 225px; margin-bottom: 10px; border-radius: 7px;"></div>
                        <div class="skeleton skeleton-text" style="height: 2em; width: 80%; margin: 0 auto;"></div>
                    </div>
                `;
            }
        }
    } else {
        // Remove as classes de esqueleto apenas dos elementos no escopo fornecido
        elements.forEach(el => el.classList.remove('skeleton', 'skeleton-text', 'skeleton-text-block', 'skeleton-block'));
    }
}

// --- GERENCIADOR DA BARRA DE CARREGAMENTO ---
const loadingBarManager = {
    progress: 0,
    bar: document.getElementById('loading-bar'),
    
    reset() {
        this.progress = 0;
        if (!this.bar) return;
        this.bar.classList.add('inactive');
        void this.bar.offsetHeight; // Força reflow
        this.bar.classList.remove('inactive');
        this.update(10); // Começa com um progresso inicial pequeno
    },

    // Adiciona um valor ao progresso atual
    advance(value) {
        this.progress = Math.min(100, this.progress + value);
        this.update(this.progress);
    },

    // Atualiza a largura da barra
    update(value) {
        if (this.bar) this.bar.style.width = `${value}%`;
        if (value === 100) setTimeout(() => this.bar.classList.add('inactive'), 500);
    }
};

let closeActiveSection = () => {}; // Placeholder para a função que fecha a seção expansível

function loadMovieData(movieId, addToHistory = true) {
    const loadingBar = document.getElementById('loading-bar');
    const mainElement = document.querySelector('main');
    const fadeTargets = document.querySelectorAll('.fade-target');
    
    // **CORREÇÃO**: Fecha qualquer seção aberta (galeria, elenco, etc.) e reseta os ícones
    closeActiveSection();
    // **CORREÇÃO**: Reseta os dados de imagem para evitar que a galeria antiga apareça
    currentMovieData.images = null;

    // 1. Inicia o carregamento: reseta a UI para o estado de esqueleto
    window.scrollTo({ top: 0, behavior: 'smooth' });

    loadingBarManager.reset(); // Reseta e inicia a barra de carregamento

    // Reseta a imagem do pôster e o fundo
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster) {
        moviePoster.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Imagem transparente
    }
    if (mainElement) mainElement.classList.add('background-loading');

    // Mostra todos os esqueletos
    document.querySelectorAll('.fade-target, .movie-poster, #trailer-container > div').forEach(el => el.classList.add('skeleton'));
    document.getElementById('movie-plot').classList.add('skeleton-text-block');
    setSkeletonState(true); // Preenche o carrossel com esqueletos

    // Atualiza a URL e o histórico do navegador
    const url = `?movie=${movieId}`;
    if (addToHistory) history.pushState({ movieId: movieId }, '', url);

    // **OTIMIZAÇÃO**: Busca os detalhes do filme UMA VEZ e reutiliza a promessa.
    const detailsPromise = fetchAndProcess(`../api/api.php?movie_id=${movieId}`);

    // Pré-carrega a imagem de fundo usando a promessa de detalhes.
    const backdropPromise = detailsPromise.then(details => {
        loadingBarManager.advance(25); // Peso da imagem de fundo
        if (details && details.backdrop_path) {
            return new Promise(resolve => {
                const backdropUrl = `${imageBaseUrl}original${details.backdrop_path}`; // imageBaseUrl já é um caminho absoluto
                const img = new Image();
                img.src = backdropUrl;
                img.onload = () => resolve(backdropUrl);
                img.onerror = () => resolve(null); // Resolve mesmo em caso de erro
            });
        }
        return Promise.resolve(null);
    });

    // 2. **CARREGAMENTO PROGRESSIVO**
    // Etapa 1: Busca dos dados CRÍTICOS (detalhes e créditos)
    Promise.all([detailsPromise, fetchAndProcess(`../api/api.php?credits_for=${movieId}`)])
    .then(async ([details, credits]) => {
        // **BARRA PRECISA**: Dados críticos carregados (+40%)
        loadingBarManager.advance(40);
        // Assim que os dados críticos chegam, atualiza a UI principal
        currentMovieData.details = details;
        currentMovieData.credits = credits;

        const backdropUrl = await backdropPromise; // Espera a imagem de fundo terminar de carregar
        updateMovieDetails(details, backdropUrl);
        updateMovieCredits(credits);
        updateQuoteSection(details);

    }).catch(error => {
        console.error("Falha ao carregar dados do filme:", error);
        if (loadingBar) loadingBar.classList.add('inactive');
        // Adicionar tratamento de erro para o usuário aqui
    });

    // Etapa 2: Busca dos dados SECUNDÁRIOS em paralelo
    const relatedPromise = fetchAndProcess(`../api/api.php?related_to=${movieId}`);
    const videosPromise = fetchAndProcess(`../api/api.php?videos_for=${movieId}`);
    // **REVERSÃO**: A busca de imagens volta a ser feita no carregamento inicial
    const imagesPromise = fetchAndProcess(`../api/api.php?images_for=${movieId}`);

    // Atualiza cada seção secundária assim que seus dados chegam
    Promise.all([videosPromise, imagesPromise]).then(([videos, images]) => {
        // **BARRA PRECISA**: Dados do trailer e galeria carregados (+20%)
        loadingBarManager.advance(20);
        currentMovieData.videos = videos;
        currentMovieData.images = images; // Armazena os dados da galeria
        updateMovieTrailer(videos, images);
    });

    relatedPromise.then(related => {
        currentMovieData.related = related;
        updateRelatedMovies(related);
    });
}

/**
 * Função auxiliar para fazer requisições fetch e processar a resposta.
 * Retorna uma Promise.
 * @param {string} url - A URL para a requisição.
 * @param {AbortSignal} [signal] - Um AbortSignal para cancelar a requisição.
 */
function fetchAndProcess(url, signal) {
    return new Promise((resolve, reject) => {
        fetch(url, { signal })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error(`Erro da API em ${url}:`, data.error);
                    reject(data.error);
                } else {
                    resolve(data);
                }
            })
            .catch(error => {
                console.error('Houve um problema com a requisição fetch:', error);
                reject(error);
            });
    });
}

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

function updateMovieDetails(movie, backdropUrl) {
    const mainElement = document.querySelector('main');

    // **OTIMIZAÇÃO**: A imagem de fundo já foi pré-carregada. Apenas a aplicamos.
    if (mainElement) {
        if (backdropUrl) {
            mainElement.style.setProperty('--bg-image', `url('${backdropUrl}')`);
        } else {
            // Se não houver imagem, limpa a propriedade
            mainElement.style.setProperty('--bg-image', 'none');
        }
        // Se não houver imagem, remove a classe de carregamento imediatamente
        mainElement.classList.remove('background-loading');
    }

    const movieTitle = document.getElementById('movie-title');
    const movieYear = document.getElementById('movie-year');
    const movieGenres = document.getElementById('movie-genres');
    const ratingStarsContainer = document.querySelector('.rating-stars');

    const statRating = document.getElementById('stat-rating');
    const statRuntime = document.getElementById('stat-runtime');
    const statBudget = document.getElementById('stat-budget');
    const statRelease = document.getElementById('stat-release');
    const moviePoster = document.getElementById('movie-poster');
    const moviePlot = document.getElementById('movie-plot');

    // **OTIMIZAÇÃO**: Agrupa todas as atualizações do DOM em um único requestAnimationFrame
    // para evitar múltiplos reflows/repaints.
    requestAnimationFrame(() => {
        // --- ATUALIZAÇÕES DE TEXTO E CONTEÚDO ---
        movieTitle.textContent = movie.title.toUpperCase();
        movieYear.textContent = `(${new Date(movie.release_date).getFullYear()})`;
        movieGenres.textContent = movie.genres.map(g => g.name).join(' | ');
        ratingStarsContainer.innerHTML = generateStarRating(movie.vote_average);
        
        statRating.textContent = movie.vote_average.toFixed(1);
        statRuntime.textContent = `${movie.runtime} mins`;
        statBudget.textContent = movie.budget > 0 ? `$${movie.budget.toLocaleString('en-US')}` : 'N/A';
        statRelease.textContent = new Date(movie.release_date).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        }).toUpperCase();

        moviePlot.textContent = movie.overview;

        // --- ATUALIZAÇÃO DE IMAGEM ---
        if (moviePoster && movie.poster_path) {
            moviePoster.src = `${imageBaseUrl}w500${movie.poster_path}`;
            moviePoster.alt = `${movie.title} Poster`;
        }

        // --- REMOÇÃO DAS CLASSES SKELETON (Tudo de uma vez) ---
        [movieTitle, movieYear, movieGenres, ratingStarsContainer, statRating, statRuntime, statBudget, statRelease].forEach(el => {
            el.classList.remove('skeleton', 'skeleton-text');
        });
        moviePlot.classList.remove('skeleton', 'skeleton-text-block');
        if (moviePoster) moviePoster.classList.remove('skeleton');
    });

}

function updateQuoteSection(movie) {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');

    if (movie.tagline) {
        quoteText.textContent = `"${movie.tagline}"`;
        quoteAuthor.textContent = movie.title.toUpperCase();
    } else {
        quoteText.textContent = "Uma experiência cinematográfica inesquecível.";
        quoteAuthor.textContent = "FRAMEWAY";
    }
    quoteText.classList.remove('skeleton', 'skeleton-text');
    quoteAuthor.classList.remove('skeleton', 'skeleton-text');
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

    document.getElementById('director-name').classList.remove('skeleton');
    document.getElementById('writer-name').classList.remove('skeleton');
    document.getElementById('stars-names').classList.remove('skeleton');
}

/**
 * Encontra o trailer oficial e o exibe na página.
 * @param {object} videos - O objeto de resposta da API com a lista de vídeos.
 */
function updateMovieTrailer(videos, images) {
    const trailerContainer = document.getElementById('trailer-container');
    if (!trailerContainer) return;
    
    trailerContainer.innerHTML = ''; // Limpa o container

    /**
     * Encontra o melhor trailer disponível com base em uma ordem de prioridade:
     * 1. Oficial em Português
     * 2. Qualquer um em Português
     * 3. Oficial em Inglês
     * 4. Qualquer um em Inglês
     * 5. O primeiro trailer da lista
     */
    function findBestTrailer(videoResults) {
        if (!videoResults || videoResults.length === 0) return null;

        const allYoutubeVideos = videoResults.filter(v => v.site === 'YouTube');
        if (allYoutubeVideos.length === 0) return null;

        // Define uma lista de critérios de busca em ordem de prioridade.
        // Cada critério é uma função que retorna true se o vídeo corresponder.
        const priorityList = [
            v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'pt',
            v => v.type === 'Teaser'  && v.official && v.iso_639_1 === 'pt',
            v => v.type === 'Trailer' && v.iso_639_1 === 'pt',
            v => v.type === 'Teaser'  && v.iso_639_1 === 'pt',
            v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'en',
            v => v.type === 'Teaser'  && v.official && v.iso_639_1 === 'en',
            v => v.type === 'Trailer' && v.iso_639_1 === 'en',
            v => v.type === 'Teaser'  && v.iso_639_1 === 'en',
            v => v.type === 'Trailer', // Qualquer trailer
            v => v.type === 'Teaser',  // Qualquer teaser
        ];

        // Itera sobre a lista de prioridades e retorna o primeiro vídeo que corresponder.
        for (const condition of priorityList) {
            const found = allYoutubeVideos.find(condition);
            if (found) return found;
        }

        // Se nenhum dos critérios acima for atendido, retorna o primeiro vídeo do YouTube disponível.
        return allYoutubeVideos[0];
    }

    const trailer = findBestTrailer(videos.results);

    if (trailer) {
        if (trailer) {
            let backdropUrl;
            // Tenta pegar a segunda imagem de backdrop. Se não existir, usa a primeira.
            if (images && images.backdrops && images.backdrops.length > 1) {
                backdropUrl = `${imageBaseUrl}w780${images.backdrops[1].file_path}`;
            } else if (images && images.backdrops && images.backdrops.length > 0) {
                // Se não houver uma segunda, usa a primeira
                backdropUrl = `${imageBaseUrl}w780${images.backdrops[0].file_path}`;
            } else {
                // Fallback para a thumb do YouTube se não houver backdrops
                backdropUrl = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
            }

            // Em vez de um link, criamos um botão ou div clicável
            trailerContainer.innerHTML = `
                <div class="trailer-link" data-video-key="${trailer.key}" role="button" tabindex="0" aria-label="Play trailer">
                    <img src="${backdropUrl}" alt="Thumbnail do trailer de ${trailer.name}">
                    <i class="fab fa-youtube play-icon"></i>
                </div>
            `;

            // Adiciona o evento de clique para tocar o vídeo
            trailerContainer.querySelector('.trailer-link').addEventListener('click', (e) => {
                const videoKey = e.currentTarget.dataset.videoKey;                
                // Substitui o conteúdo do container pelo player de vídeo
                trailerContainer.innerHTML = `
                    <div class="video-player-wrapper">
                        <iframe src="https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                    </div>
                `;
            });
            // **CORREÇÃO**: Remove o esqueleto do container do trailer quando o conteúdo é inserido
            setSkeletonState(false, trailerContainer);
            return;
        }
    }

    // Se nenhum trailer for encontrado
    trailerContainer.innerHTML = '<p>Nenhum trailer disponível.</p>';
    setSkeletonState(false, trailerContainer); // Remove o esqueleto mesmo se não houver trailer
}

function updateRelatedMovies(related) {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    carousel.innerHTML = ''; // Limpa o conteúdo

    // **BARRA PRECISA**: Dados de filmes relacionados carregados (+15%)
    loadingBarManager.advance(15);

    if (related.results && related.results.length > 0) {
        const moviesToShow = related.results.slice(0, 10);

        moviesToShow.forEach(movie => {
            // **OTIMIZAÇÃO**: Usamos data-src para o lazy loading
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.dataset.movieId = movie.id; // Adiciona o ID do filme ao card
            const posterUrl = movie.poster_path ? `${imageBaseUrl}w342${movie.poster_path}` : '../assets/images/placeholder.png'; // TODO: Crie uma imagem placeholder
            movieCard.innerHTML = `
                <img data-src="${posterUrl}" alt="${movie.title}" class="lazy-load">
                <p>${movie.title.toUpperCase()}</p>
            `;
            carousel.appendChild(movieCard);
        });

        // **CORREÇÃO**: Clona os cards ANTES de configurar o observer
        // para que os clones também sejam observados.
        const originalCards = carousel.querySelectorAll('.movie-card');
        originalCards.forEach(card => {
            carousel.appendChild(card.cloneNode(true));
        });

        // **NOVA ESTRATÉGIA**: Pré-carrega todas as imagens do carrossel em segundo plano.
        const imageElements = carousel.querySelectorAll('img[data-src]');
        
        // Cria uma promessa para cada imagem a ser carregada
        const imageLoadPromises = Array.from(imageElements).map(imgElement => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = imgElement.dataset.src;
                // Resolve a promessa quando a imagem carrega ou dá erro,
                // para não impedir que as outras apareçam.
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        // Quando todas as imagens estiverem no cache do navegador...
        Promise.all(imageLoadPromises).then(() => {
            // ...atribui o src para exibi-las.
            // Como estão no cache, a exibição é instantânea.
            requestAnimationFrame(() => {
                imageElements.forEach(imgElement => {
                    imgElement.src = imgElement.dataset.src;
                    imgElement.classList.remove('lazy-load');
                });
            });
        });

        // Remove o skeleton do carrossel (agora que o conteúdo real está pronto)
        carousel.classList.remove('skeleton');

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
    
    // Variáveis para a funcionalidade de arrastar (swipe)
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let velocity = 0;
    let lastMoveTime = 0;
    let lastMovePos = 0;


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

    // --- LÓGICA DE ARRASTAR (SWIPE) PARA O CARROSSEL ---

    const dragStart = (e) => {
        if (isTransitioning || carousel.children.length <= 1) return;
        isDragging = true;
        // Usa pageX tanto para mouse quanto para touch
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        lastMovePos = startPos;
        lastMoveTime = performance.now();
        velocity = 0;

        // Pega a posição atual do transform e cancela qualquer animação em andamento
        currentTranslate = getTranslateX();
        carousel.style.transition = 'none';
        cancelAnimationFrame(animationID);
    };

    const dragMove = (e) => {
        if (!isDragging) return;
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const diff = currentPosition - startPos;
        const newTranslate = currentTranslate + diff;

        // Cálculo de velocidade
        const now = performance.now();
        const elapsed = now - lastMoveTime;
        if (elapsed > 10) { // Evita divisões por zero ou valores muito pequenos
            const distance = currentPosition - lastMovePos;
            velocity = distance / elapsed; // pixels por milissegundo
            lastMoveTime = now;
            lastMovePos = currentPosition;
        }

        setTranslateX(newTranslate);
    };

    const dragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);

        const cardWidth = carousel.querySelector('.movie-card').offsetWidth + 20;
        const currentPosition = getTranslateX();

        // Fator de inércia: quanto maior, mais longe o carrossel vai
        const momentumFactor = 120; 
        const momentumDistance = velocity * momentumFactor;
        let finalPosition = currentPosition + momentumDistance;

        // Calcula o índice do card mais próximo da posição final
        currentIndex = Math.round(-finalPosition / cardWidth);

        // Garante que o índice não saia dos limites dos itens originais
        const originalCardCount = carousel.querySelectorAll('.movie-card').length / 2;
        currentIndex = Math.max(0, Math.min(currentIndex, originalCardCount));

        // Define a posição final para ser exatamente no card calculado
        finalPosition = -currentIndex * cardWidth;

        // Aplica a transição com efeito de desaceleração
        carousel.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
        setTranslateX(finalPosition);
        isTransitioning = true; // Bloqueia interações durante a animação
    };

    function getTranslateX() {
        const style = window.getComputedStyle(carousel);
        const matrix = new DOMMatrix(style.transform);
        return matrix.m41;
    }

    function setTranslateX(x) {
        carousel.style.transform = `translateX(${x}px)`;
    }

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('touchstart', dragStart, { passive: true });

    carousel.addEventListener('mousemove', dragMove);
    carousel.addEventListener('touchmove', dragMove, { passive: true });

    carousel.addEventListener('mouseup', dragEnd);
    carousel.addEventListener('mouseleave', dragEnd); // Se o mouse sair da área do carrossel
    carousel.addEventListener('touchend', dragEnd);
}

function setupExpandableColumn() {
    const rightColumn = document.querySelector('.right-column');
    if (!rightColumn) return;

    const actionIconsContainer = rightColumn.querySelector('.action-icons');
    const innerContentContainer = rightColumn.querySelector('.expandable-content-inner');

    if (!actionIconsContainer || !innerContentContainer) return;

    const INITIAL_GALLERY_COUNT = 12;
    let galleryState = {};

    function resetGalleryState() {
        galleryState = {
            backdrops: { count: INITIAL_GALLERY_COUNT, scrollTop: 0 },
            posters: { count: INITIAL_GALLERY_COUNT, scrollTop: 0 }
        };
    }

    // Event listener para os filtros da galeria (usando delegação)
    innerContentContainer.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('.filter-btn');
        const loadMoreBtn = e.target.closest('.load-more-btn');
        const galleryContainer = innerContentContainer.querySelector('.gallery-container');

        if (loadMoreBtn) {
            // Salva a posição de rolagem atual ANTES de renderizar novamente
            const currentScrollTop = galleryContainer ? galleryContainer.scrollTop : 0;

            const activeFilter = innerContentContainer.querySelector('.filter-btn.active')?.dataset.filter || 'backdrops';
            
            // Incrementa a contagem apenas para o filtro ativo
            galleryState[activeFilter].count += 12;

            const galleryGrid = innerContentContainer.querySelector('.gallery-grid');

            if (galleryGrid) {
                // Renderiza o grid novamente com mais itens
                galleryGrid.innerHTML = renderGalleryGrid(currentMovieData.images, activeFilter, galleryState[activeFilter].count);
                
                // Restaura a posição de rolagem APÓS a renderização
                // Usamos um pequeno timeout para garantir que o DOM foi atualizado
                setTimeout(() => {
                    if (galleryContainer) {
                        galleryContainer.scrollTop = currentScrollTop;
                    }
                }, 0);
            }
            return; // Impede que o código do filtro seja executado
        }


        if (!filterBtn) return;

        const filterType = filterBtn.dataset.filter;
        const galleryGrid = innerContentContainer.querySelector('.gallery-grid');

        if (filterType && galleryGrid) {
            // Salva a posição de rolagem do filtro antigo
            const oldFilter = innerContentContainer.querySelector('.filter-btn.active')?.dataset.filter;
            if (galleryContainer && oldFilter) {
                galleryState[oldFilter].scrollTop = galleryContainer.scrollTop;
            }

            // Atualiza o botão ativo
            innerContentContainer.querySelector('.filter-btn.active')?.classList.remove('active');
            filterBtn.classList.add('active');

            // Adiciona/remove classe para o layout de duas colunas dos pôsteres
            if (filterType === 'posters') {
                galleryGrid.classList.add('posters-active');
            } else {
                galleryGrid.classList.remove('posters-active');
            }
            // Renderiza novamente o grid com o novo filtro
            galleryGrid.innerHTML = renderGalleryGrid(currentMovieData.images, filterType, galleryState[filterType].count);

            // Restaura a posição de rolagem para o novo filtro
            // Usamos setTimeout para garantir que o DOM foi atualizado
            setTimeout(() => {
                if (galleryContainer) {
                    galleryContainer.scrollTop = galleryState[filterType].scrollTop;
                }
            }, 0);
        }
    });

    // Adiciona o listener para abrir o lightbox (usando delegação de evento)
    innerContentContainer.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            // Encontra todas as imagens visíveis no grid
            const allImageElements = innerContentContainer.querySelectorAll('.gallery-item');
            const allImages = Array.from(allImageElements).map(item => item.querySelector('img').src);
            const clickedIndex = Array.from(allImageElements).indexOf(galleryItem);

            openLightbox(allImages, clickedIndex);
        }
    });

    let activeSection = null;

    actionIconsContainer.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-item');
        if (!iconItem) return;

        const sectionName = iconItem.dataset.section;

        if (sectionName === activeSection) {
            closeSection(); // Fecha a seção se o mesmo ícone for clicado
        } else {
            // Abre a nova seção
            openSection(sectionName, iconItem);
        }
    });

    function openSection(sectionName, iconElement) {
        resetGalleryState(); // Reseta o estado da galeria (contagem e scroll)
        const isSwitching = activeSection !== null;

        // Remove a classe ativa do ícone antigo
        actionIconsContainer.querySelector('.icon-item.active')?.classList.remove('active');

        const oldContentWrapper = innerContentContainer.querySelector('.expandable-content-inner-wrapper');

        // Se estivermos trocando de seção, faz o fade-out primeiro
        if (isSwitching && oldContentWrapper) {
            oldContentWrapper.style.opacity = '0';
            
            // Espera o fade-out terminar para trocar o conteúdo
            setTimeout(() => {
                updateContent(sectionName, iconElement);
            }, 200); // Duração da transição de opacidade do CSS
        } else {
            // Se for a primeira vez abrindo, apenas atualiza o conteúdo e expande
            updateContent(sectionName, iconElement, false);
            rightColumn.classList.add('content-expanded');
        }

        // Ativa o novo ícone e atualiza o estado DEPOIS da lógica de transição
        iconElement.classList.add('active');
        activeSection = sectionName;
    }

    async function updateContent(sectionName, iconElement, fadeIn = true) {
        // **OTIMIZAÇÃO**: Carregamento da galeria sob demanda
        if (sectionName === 'gallery' && !currentMovieData.images) {
            // Mostra um estado de carregamento para a galeria
            innerContentContainer.innerHTML = `
                <div class="expandable-content-inner-wrapper" style="text-align: center; padding: 40px 0;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #888;"></i>
                    <p style="color: #888; margin-top: 10px;">Carregando galeria...</p>
                </div>
            `;
            try {
                // Busca os dados da galeria apenas agora
                const images = await fetchAndProcess(`../api/api.php?images_for=${currentMovieData.details.id}`);
                currentMovieData.images = images;
            } catch (error) {
                console.error("Falha ao carregar dados da galeria:", error);
                innerContentContainer.innerHTML = `<div class="expandable-content-inner-wrapper"><p>Não foi possível carregar a galeria.</p></div>`;
                return; // Interrompe a execução se a galeria falhar
            }
        }

        // Agora que os dados (se necessários) foram carregados, cria o HTML final
        innerContentContainer.innerHTML = createContentHTML(sectionName, iconElement);
        const newContentWrapper = innerContentContainer.querySelector('.expandable-content-inner-wrapper');

        if (fadeIn) {
            // Para o fade-in, o elemento começa invisível
            newContentWrapper.style.opacity = '0';
            // Força o navegador a registrar a opacidade 0 antes de animar para 1
            requestAnimationFrame(() => {
                newContentWrapper.style.opacity = '1';
            });
        }
    }

    function closeSection() {
        actionIconsContainer.querySelector('.icon-item.active')?.classList.remove('active');
        rightColumn.classList.remove('content-expanded');
        activeSection = null;
        // Limpa o conteúdo após a animação de fechamento
        setTimeout(() => { innerContentContainer.innerHTML = ''; }, 400);
    }

    // **CORREÇÃO**: Torna a função closeSection acessível globalmente
    closeActiveSection = closeSection;

    function createContentHTML(sectionName, iconElement) {
        const title = iconElement.querySelector('span').textContent.toUpperCase();
        let headerHtml = `<h3>${title}</h3>`;
        let contentHtml = `<p>Aqui virá o conteúdo detalhado sobre o ${title.toLowerCase()}.</p>`;

        if (sectionName === 'cast' && currentMovieData.credits && currentMovieData.credits.cast) {
            contentHtml = createCastHtml(currentMovieData.credits.cast);
        }

        if (sectionName === 'awards') {
            contentHtml = createAwardsHtml();
        }

        if (sectionName === 'quotes') {
            contentHtml = createQuotesHtml();
        }

        if (sectionName === 'facts' && currentMovieData.details) {
            contentHtml = createFactsHtml(currentMovieData.details);
        }

        if (sectionName === 'gallery' && currentMovieData.images) {
            // Cria um cabeçalho especial com filtros para a galeria
            headerHtml = `
                <div class="section-header">
                    <h3>${title}</h3>
                    <div class="gallery-filters">
                        <button class="filter-btn active" data-filter="backdrops">Imagens do Filme</button>
                        <button class="filter-btn" data-filter="posters">Pôsteres</button>
                    </div>
                </div>
            `;
            contentHtml = createGalleryHtml(currentMovieData.images);
        }

        return `
            <div class="expandable-content-inner-wrapper">
                ${headerHtml}
                ${contentHtml}
            </div>
        `;
    }

    function createCastHtml(cast) {
        if (!cast || cast.length === 0) {
            return '<p>Informações do elenco não disponíveis.</p>';
        }

        const castList = cast.slice(0, 20).map(member => { // Limita a 20 para performance
            const profilePic = member.profile_path
                ? `${imageBaseUrl}w185${member.profile_path}`
                : '../assets/images/placeholder-person.png'; // Crie uma imagem placeholder para pessoas

            return `
                <div class="cast-member">
                    <img src="${profilePic}" alt="${member.name}" loading="lazy">
                    <div class="cast-member-info">
                        <span class="cast-name">${member.name}</span>
                        <span class="cast-character">${member.character}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="cast-list">${castList}</div>`;
    }

    function createAwardsHtml() {
        // A API do TMDB não fornece dados de prêmios.
        // Esta função cria um placeholder informativo com a estrutura visual correta.
        const content = `
            <div class="award-item">
                <i class="fas fa-info-circle award-icon"></i>
                <div class="award-info">
                    <span class="award-category">Informação sobre Prêmios</span>
                    <span class="award-details">Dados sobre prêmios não estão disponíveis na API do TMDB. A interface está pronta para ser integrada com uma fonte de dados futura.</span>
                </div>
            </div>
        `;

        return `<div class="awards-list">${content}</div>`;
    }

    function createQuotesHtml() {
        // A API do TMDB não fornece dados de citações.
        // Esta função cria um placeholder informativo.
        const content = `
            <div class="quote-item">
                <i class="fas fa-comment-slash quote-icon"></i>
                <div class="quote-info">
                    <span class="quote-text">Nenhuma citação disponível.</span>
                    <span class="quote-character">Dados sobre citações não são fornecidos pela API.</span>
                </div>
            </div>
        `;
        return `<div class="quotes-list">${content}</div>`;
    }

    function createFactsHtml(movie) {
        // Função auxiliar para formatar nomes de países
        const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

        const facts = [
            // O Slogan foi movido para a seção de citação principal
            { label: 'Orçamento', value: movie.budget > 0 ? `$${movie.budget.toLocaleString('en-US')}` : 'N/A', icon: 'fa-wallet' },
            { label: 'Receita', value: movie.revenue > 0 ? `$${movie.revenue.toLocaleString('en-US')}` : 'N/A' },
            { label: 'Total de Votos', value: movie.vote_count ? movie.vote_count.toLocaleString('en-US') : 'N/A', icon: 'fa-users' },
            { label: 'Idiomas Falados', value: movie.spoken_languages.map(l => l.name).join(', '), icon: 'fa-comments' },
            { label: 'Produtoras', value: movie.production_companies.map(c => c.name).join(', ') || 'N/A', icon: 'fa-building' },
            { label: 'Países de Produção', value: movie.production_countries.map(c => countryNames.of(c.iso_3166_1)).join(', '), icon: 'fa-globe-americas' },
            { label: 'Site Oficial', value: movie.homepage, icon: 'fa-link', isLink: true },
            { label: 'Conteúdo Adulto', value: movie.adult ? 'Sim' : 'Não', icon: 'fa-exclamation-triangle' }
        ];

        const gridItems = facts.map(fact => {
            if (!fact.value || fact.value.trim() === '') return ''; // Não renderiza fatos sem valor

            // Define o ícone a ser usado
            const iconClass = fact.icon || 'fa-info-circle';
            // Formata o valor como um link se necessário
            const factValueHtml = fact.isLink ? `<a href="${fact.value}" target="_blank" rel="noopener noreferrer">${fact.value}</a>` : fact.value;

            return `
                <div class="fact-item">
                    <i class="fas ${iconClass} fact-icon"></i>
                    <div class="fact-info">
                        <span class="fact-label">${fact.label}</span>
                        <span class="fact-value">${factValueHtml}</span>
                    </div>
                </div>`;
        }).join('');

        // Retorna apenas os itens do grid
        return `<div class="facts-list">${gridItems}</div>`;
    }

    function createGalleryHtml(images) {
        if (!images || (images.backdrops.length === 0 && images.posters.length === 0)) {
            return '<p>Nenhuma imagem disponível na galeria.</p>';
        }
        
        // Renderiza o grid inicial com o filtro padrão 'backdrops'
        const galleryGridHtml = renderGalleryGrid(images, 'backdrops', galleryState.backdrops.count);
        
        // Usa um container para aplicar a rolagem, similar ao cast-list
        return `<div class="gallery-container"><div class="gallery-grid">${galleryGridHtml}</div></div>`;
    }

    function renderGalleryGrid(images, filter, count) {
        const imageList = images[filter] || [];

        if (imageList.length === 0) {
            return `<p style="text-align: center; padding: 20px 0; color: #888;">Nenhuma imagem encontrada para este filtro.</p>`;
        }

        let gridHtml = imageList.slice(0, count).map(img => {
            // Usa uma resolução maior para backdrops e uma adequada para pôsteres
            const imageSize = filter === 'backdrops' ? 'w780' : 'w500';
            const imageUrl = `${imageBaseUrl}${imageSize}${img.file_path}`;
            const aspectRatio = filter === 'posters' ? '2 / 3' : '16 / 9';
            return `
                <div class="gallery-item" style="aspect-ratio: ${aspectRatio};">
                    <img src="${imageUrl}" alt="Imagem da galeria" loading="lazy" data-original-src="${imageBaseUrl}original${img.file_path}">
                </div>`;
        }).join('');

        // Adiciona o botão "Carregar Mais" se houver mais imagens disponíveis
        if (imageList.length > count) {
            gridHtml += `<div class="load-more-container"><button class="load-more-btn"><i class="fas fa-plus"></i> Carregar Mais</button></div>`;
        }

        return gridHtml;
    }
}

// --- LÓGICA DO LIGHTBOX ---

let lightboxState = {
    images: [],
    currentIndex: -1,
    isOpen: false
};

function openLightbox(images, index) {
    if (lightboxState.isOpen) return;

    lightboxState.images = images.map(imgSrc => {
        // Extrai o caminho original da URL da thumbnail para construir a URL de alta resolução
        const path = imgSrc.split('/').pop();
        return `${imageBaseUrl}original/${path}`;
    });
    lightboxState.isOpen = true;

    const lightboxHtml = `
        <div class="lightbox-modal" id="lightbox-modal">
            <div class="lightbox-controls top-left">
                <button id="lightbox-download" class="lightbox-btn" title="Baixar imagem"><i class="fas fa-download"></i></button>
            </div>
            <div class="lightbox-controls top-right">
                <button id="lightbox-close" class="lightbox-btn"><i class="fas fa-times"></i></button>
            </div>
            <button class="lightbox-arrow prev" id="lightbox-prev">&#10094;</button>
            <img src="" id="lightbox-image" alt="Imagem em tela cheia">
            <button class="lightbox-arrow next" id="lightbox-next">&#10095;</button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    document.body.classList.add('lightbox-open');

    // Adiciona listeners
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-download').addEventListener('click', downloadCurrentImage);
    document.getElementById('lightbox-prev').addEventListener('click', showPrevImage);
    document.getElementById('lightbox-next').addEventListener('click', showNextImage);
    document.getElementById('lightbox-modal').addEventListener('click', (e) => {
        // Fecha se clicar no fundo, mas não na imagem ou nos botões
        if (e.target.id === 'lightbox-modal') {
            closeLightbox();
        }
    });
    window.addEventListener('keydown', handleKeyboard);

    showImage(index);
}

function showImage(index) {
    if (index < 0 || index >= lightboxState.images.length) return;

    lightboxState.currentIndex = index;
    const imageElement = document.getElementById('lightbox-image');
    const imageUrl = lightboxState.images[index];

    // Mostra um spinner ou loading enquanto a imagem carrega (opcional)
    imageElement.src = ''; // Limpa a imagem anterior
    imageElement.src = imageUrl;
}

function showNextImage() {
    let nextIndex = lightboxState.currentIndex + 1;
    if (nextIndex >= lightboxState.images.length) {
        nextIndex = 0; // Volta para o início
    }
    showImage(nextIndex);
}

function showPrevImage() {
    let prevIndex = lightboxState.currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = lightboxState.images.length - 1; // Vai para o final
    }
    showImage(prevIndex);
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('lightbox-open');
    window.removeEventListener('keydown', handleKeyboard);
    lightboxState.isOpen = false;
}

async function downloadCurrentImage(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const icon = button.querySelector('i');
    const originalIconClass = 'fas fa-download';
    const loadingIconClass = 'fas fa-spinner fa-spin';

    const fullImageUrl = lightboxState.images[lightboxState.currentIndex];
    // Extrai apenas o caminho do arquivo, ex: /wA2cKnqT0maACr3aI3hWwRAnVam.jpg
    const imagePath = new URL(fullImageUrl).pathname.replace('/t/p/original', '');
    const imageName = imagePath.split('/').pop();

    // A URL que vamos chamar para o download via nosso proxy
    const downloadUrl = `../api/api.php?download_image=${encodeURIComponent(imagePath)}`;

    try {
        // Mostra um feedback de carregamento no botão
        icon.className = loadingIconClass;
        button.disabled = true;
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Falha ao buscar a imagem: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

    } catch (error) {
        console.error('Erro ao baixar a imagem:', error);
        alert('Não foi possível baixar a imagem. Tente novamente.');
    } finally {
        // Restaura o botão ao estado original
        icon.className = originalIconClass;
        button.disabled = false;
    }
}

function handleKeyboard(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    } else if (e.key === 'ArrowLeft') {
        showPrevImage();
    }
}
