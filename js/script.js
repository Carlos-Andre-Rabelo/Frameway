let currentMovieData = {
    credits: null,
    // Outros dados do filme podem ser armazenados aqui no futuro
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


    // Carrega um filme padrão na inicialização
    const movieId = 129; // ID padrão para "A Viagem de Chihiro"
    loadMovieData(movieId);

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    const searchContainer = document.querySelector('.search-container'); // Ainda necessário para as sugestões
    let debounceTimer;    

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Busca pelo filme e carrega o primeiro resultado
            fetchAndProcess(`api.php?search=${query}`, (data) => {
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

function loadMovieData(movieId) {
    const loadingBar = document.getElementById('loading-bar');
    const mainElement = document.querySelector('main');

    // 1. Inicia o carregamento: reseta e exibe a barra, inicia o fade-out
    if (loadingBar) {
        loadingBar.classList.add('inactive'); // Reseta para 0% sem animação
        // Força o navegador a aplicar a classe 'inactive' antes de remover
        loadingBar.offsetHeight; 
        loadingBar.classList.remove('inactive');
        loadingBar.style.width = '70%'; // Anima a barra até 70%
    }

    // 1. Seleciona todos os elementos de conteúdo e os torna invisíveis (fade-out)
    const fadeTargets = document.querySelectorAll('.fade-target');
    fadeTargets.forEach(el => {
        el.style.opacity = '0';
    });

    if (mainElement) mainElement.classList.add('background-loading'); // Inicia o fade-out do fundo

    // 2. Espera a animação de fade-out terminar para então carregar os novos dados
    setTimeout(() => { // O tempo deve ser igual ou maior que a transição no CSS
        // Rola a página para o topo suavemente
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Limpa os dados antigos antes de carregar novos
        currentMovieData.credits = null;
        currentMovieData.images = null;

        fetchAndProcess(`api.php?movie_id=${movieId}`, (movie) => updateMovieDetails(movie, movieId));
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

function updateMovieDetails(movie, movieId) {
    const mainElement = document.querySelector('main');

    // Pré-carrega a imagem de fundo para garantir que o fade-in seja suave
    if (mainElement && movie.backdrop_path) {
        const backdropUrl = `${imageBaseUrl}original${movie.backdrop_path}`;
        const img = new Image();
        img.src = backdropUrl;
        img.onload = () => {
            // 1. Define a nova imagem de fundo
            mainElement.style.setProperty('--bg-image', `url('${backdropUrl}')`);
            // 2. Remove a classe de carregamento para iniciar o fade-in
            mainElement.classList.remove('background-loading');
        };
        img.onerror = () => {
            // Caso a imagem falhe, remove a classe mesmo assim para não travar a UI
            mainElement.classList.remove('background-loading');
            console.error("Falha ao carregar a imagem de fundo:", backdropUrl);
        };
    } else if (mainElement) {
        // Se não houver imagem, remove a classe de carregamento imediatamente
        mainElement.classList.remove('background-loading');
    }

    // Completa a barra de carregamento e a esconde
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) {
        loadingBar.style.width = '100%';
        setTimeout(() => loadingBar.classList.add('inactive'), 500); // Esconde após completar
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

    // 3. Torna os elementos visíveis novamente para iniciar o fade-in
    const fadeTargets = document.querySelectorAll('.fade-target');
    // Usar um pequeno timeout garante que o navegador processe as atualizações de conteúdo antes de iniciar a animação
    setTimeout(() => {
        fadeTargets.forEach(el => el.style.opacity = '1');
    }, 50);

    // AGORA, com os detalhes do filme carregados, buscamos o trailer
    // Usamos Promise.all para buscar vídeos e imagens simultaneamente
    Promise.all([
        fetch(`api.php?videos_for=${movieId}`).then(res => res.json()),
        fetch(`api.php?images_for=${movieId}`).then(res => res.json())
    ]).then(([videos, images]) => {
        currentMovieData.images = images; // Armazena as imagens para uso posterior (galeria)
        updateMovieTrailer(videos, images);
    }).catch(error => {
        console.error("Falha ao buscar dados do trailer ou imagens:", error);
    });
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
    // Armazena todos os créditos para uso posterior (ex: na seção de elenco)
    currentMovieData.credits = credits;

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
            return;
        }
    }

    // Se nenhum trailer for encontrado
    trailerContainer.innerHTML = '<p>Nenhum trailer disponível.</p>';
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

    let activeSection = null;

    actionIconsContainer.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-item');
        if (!iconItem) return;

        const sectionName = iconItem.dataset.section;

        if (sectionName === activeSection) {
            closeSection();
        } else {
            // Abre a nova seção (se outra estiver aberta, ela será substituída)
            openSection(sectionName, iconItem);
        }
    });

    function openSection(sectionName, iconElement) {
        resetGalleryState(); // Reseta o estado da galeria (contagem e scroll)
        const isSwitching = activeSection !== null;

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
            updateContent(sectionName, iconElement, false); // CORREÇÃO: Passando sectionName corretamente
            rightColumn.classList.add('content-expanded');
        }

        // Ativa o novo ícone e atualiza o estado DEPOIS da lógica de transição
        iconElement.classList.add('active');
        activeSection = sectionName;
    }

    function updateContent(sectionName, iconElement, fadeIn = true) {
        // Cria o novo conteúdo
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
        // Limpa o conteúdo ao fechar para não aparecer rapidamente na próxima abertura
        setTimeout(() => { innerContentContainer.innerHTML = ''; }, 400);
    }

    function createContentHTML(sectionName, iconElement) {
        const title = iconElement.querySelector('span').textContent.toUpperCase();
        let headerHtml = `<h3>${title}</h3>`;
        let contentHtml = `<p>Aqui virá o conteúdo detalhado sobre o ${title.toLowerCase()}.</p>`;

        if (sectionName === 'cast' && currentMovieData.credits && currentMovieData.credits.cast) {
            contentHtml = createCastHtml(currentMovieData.credits.cast);
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
                : 'images/placeholder-person.png'; // Crie uma imagem placeholder para pessoas

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
            const imageUrl = `${imageBaseUrl}w500${img.file_path}`;
            const aspectRatio = filter === 'posters' ? '2 / 3' : '16 / 9';
            return `
                <div class="gallery-item" style="aspect-ratio: ${aspectRatio};">
                    <img src="${imageUrl}" alt="Imagem da galeria" loading="lazy">
                </div>`;
        }).join('');

        // Adiciona o botão "Carregar Mais" se houver mais imagens disponíveis
        if (imageList.length > count) {
            gridHtml += `<div class="load-more-container"><button class="load-more-btn"><i class="fas fa-plus"></i> Carregar Mais</button></div>`;
        }

        return gridHtml;
    }
}
