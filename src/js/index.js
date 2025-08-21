document.addEventListener('DOMContentLoaded', () => {
    // Seletores
    const carousel = document.getElementById('clinicCarousel');
    const slidesContainer = document.getElementById('slidesContainer');
    const dotsContainer = document.getElementById('dotsContainer');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    // Estado do Carrossel
    let slides = [];
    let currentIndex = 1; // REQUISITO: Começa no segundo slide (índice 1)
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let autoSlideInterval;

    /**
     * Carrega os dados e inicia o carrossel.
     */
    async function loadAndInitCarousel() {
        try {
            const response = await fetch('./slides.json');
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const data = await response.json();

            // Guardar todos os slides para usar na galeria            
            allSlides = data.slides;

            console.log(data.slides.map(s => s.showInSlide));


            const slidesForCarousel = data.slides.filter(slide =>
                slide.showInSlide === true

            );

            console.log(slidesForCarousel);

            slidesContainer.innerHTML = '';

            slidesForCarousel.forEach((slide, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'carousel-slide';

                // slideDiv.dataset.index = allSlides.indexOf(slide); // <-- índice correto
                slideDiv.dataset.carouselIndex = index;          // índice no carrossel
                slideDiv.dataset.globalIndex = allSlides.indexOf(slide);
                slideDiv.loading = 'lazy'
                slideDiv.innerHTML = `
                    <img src="${slide.image}" alt="${slide.alt}" draggable="false" loading="lazy">
                    <div class="carousel-caption"><h3>${slide.title || ""}</h3><p class='fs-08'>${slide.description || ""}</p><span class="small">${slide.details || ""}</span></div>
                `;
                slidesContainer.appendChild(slideDiv);
            });

            init();
            // Inicializar a galeria após carregar os slides
            initGallery();
        } catch (error) {
            console.error('Falha ao carregar carrossel:', error);
        }
    }

    /**
     * Inicializa o carrossel: configura eventos e posição inicial.
     */
    function init() {
        slides = Array.from(slidesContainer.children);
        if (slides.length === 0) return;

        // Garante que o índice inicial não seja inválido se houver poucos slides
        if (currentIndex >= slides.length) {
            currentIndex = slides.length - 1;
        }

        createDots();
        setupEventListeners();
        goToSlide(currentIndex); // Posiciona no slide inicial
        startAutoSlide();
    }

    // --- Funções de Posição e Navegação ---

    function goToSlide(index) {
        // Garante que o índice esteja dentro dos limites (0 a N-1)
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));

        slidesContainer.style.transition = 'transform 0.5s ease-out';

        const slideWidth = slides[0].offsetWidth;
        const gap = 20;
        const totalSlideWidth = slideWidth + gap;
        const containerWidth = carousel.offsetWidth;
        const offset = (containerWidth / 2) - (slideWidth / 2);

        currentTranslate = -currentIndex * totalSlideWidth + offset;
        prevTranslate = currentTranslate;

        slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
        updateActiveClasses();
        resetAutoSlide();
    }

    function updateActiveClasses() {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });
        updateDots();
        // Desativa/ativa botões de navegação nas pontas
        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === slides.length - 1);
    }

    // --- Funções de Arrastar (Drag) ---

    function dragStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        clearInterval(autoSlideInterval);
        slidesContainer.style.transition = 'none'; // Remove a animação durante o arrasto
    }

    function drag(e) {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
        slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;

        const slideWidth = slides[0].offsetWidth + 20;
        // Calcula qual seria o índice ideal com base na posição final do arrasto
        const idealIndex = Math.round((-currentTranslate + ((carousel.offsetWidth - slideWidth) / 2)) / slideWidth);

        // Vai para o slide calculado, com a lógica de limites já embutida
        goToSlide(idealIndex);
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // --- Eventos e Automação ---

    function setupEventListeners() {
        // Eventos de Arrastar
        slidesContainer.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        slidesContainer.addEventListener('touchstart', dragStart, { passive: true });
        document.addEventListener('touchmove', drag, { passive: true });
        document.addEventListener('touchend', dragEnd);

        // Botões de Navegação
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        // REQUISITO: CLICAR NO SLIDE
        slides.forEach(slide => {
            slide.addEventListener('click', () => {
                // Se não houve um arrasto significativo, trata como um clique
                if (!isDragging) {
                    goToSlide(parseInt(slide.dataset.carouselIndex));  // movimenta carrossel
                    openGallery(parseInt(slide.dataset.globalIndex));  // abre galeria
                }
            });
        });

        // Automação e Redimensionamento
        carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        carousel.addEventListener('mouseleave', startAutoSlide);
        window.addEventListener('resize', () => goToSlide(currentIndex));
    }

    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            // Se chegar no último, volta para o primeiro. Se não, avança.
            const nextIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            goToSlide(nextIndex);
        }, 4000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // --- UI (Dots) ---

    function createDots() {
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Inicia tudo
    loadAndInitCarousel();

    // Variáveis globais para a galeria
    let galleryModal, lightbox, currentLocation, allSlides = [];
    let currentLightboxIndex = 0;

    // Inicializa a funcionalidade de galeria
    function initGallery() {
        // Criar elementos da galeria
        createGalleryElements();

        // Adicionar event listeners
        document.addEventListener('click', function (e) {
            if (e.target.closest('.carousel-slide')) {
                const slide = e.target.closest('.carousel-slide');
                const index = parseInt(slide.dataset.index);
                openGallery(index);
            }
        });
    }

    // Criar elementos HTML da galeria
    function createGalleryElements() {
        // Criar modal da galeria
        galleryModal = document.createElement('div');
        galleryModal.className = 'gallery-modal';
        galleryModal.innerHTML = `
        <div class="gallery-modal-content">
            <div class="gallery-header">
                <h2 id="galleryTitle">Galeria</h2>
                <span class="close-gallery">&times;</span>
            </div>
            <div id="galleryGrid" class="gallery-grid"></div>
        </div>
    `;

        // Criar lightbox
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <div class="lightbox-nav">
            <button id="prevLightbox">&lt;</button>
            <button id="nextLightbox">&gt;</button>
        </div>
        <div class="lightbox-content">
            <img id="lightboxImage" src="" alt="">
            <div id="lightboxCaption" class="lightbox-caption"></div>
        </div>
    `;

        // Adicionar ao DOM
        document.body.appendChild(galleryModal);
        document.body.appendChild(lightbox);

        // Event listeners para fechar a galeria
        galleryModal.querySelector('.close-gallery').addEventListener('click', closeGallery);
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

        // Event listeners para navegação do lightbox
        document.getElementById('prevLightbox').addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('nextLightbox').addEventListener('click', () => navigateLightbox(1));

        // Fechar ao clicar fora do conteúdo
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) closeGallery();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Abrir galeria para uma localidade específica
    function openGallery(clickedIndex) {
        // Encontrar a localidade do slide clicado
        const clickedSlide = allSlides[clickedIndex];
        const location = extractLocationFromTitle(clickedSlide.title);
        currentLocation = location;

        // Filtrar slides por localidade
        const locationSlides = allSlides.filter(slide => {
            const slideLocation = extractLocationFromTitle(slide.title);
            return slideLocation === location;
        });

        // Preencher a galeria
        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.innerHTML = '';

        locationSlides.forEach((slide, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            // delay aleatório entre 0 e 0.8 segundos
            const randomDelay = (Math.random() * 0.4).toFixed(2);
            galleryItem.style.animationDelay = `${randomDelay}s`;

            galleryItem.innerHTML = `
        <img src="${slide.image}" alt="${slide.alt}" data-index="${index}">
    `;
            galleryItem.addEventListener('click', () => openLightbox(locationSlides, index));
            galleryGrid.appendChild(galleryItem);
        });


        // Atualizar título
        document.getElementById('galleryTitle').textContent = `Galeria - ${location}`;

        // Exibir a galeria
        galleryModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir scroll da página principal
    }

    // Fechar a galeria
    function closeGallery() {
        galleryModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // Extrair localidade do título
    function extractLocationFromTitle(title) {
        // Esta função assume que o título começa com o nome da localidade
        // Ex: "Unidade Rio de Janeiro" -> "Rio de Janeiro"
        if (title.includes('Unidade')) {
            return title.replace('Unidade ', '');
        }
        if (title.includes('-')) {
            return title.split('-')[0].trim();
        }
        return title;
    }

    // Abrir lightbox com imagem ampliada
    function openLightbox(slides, index) {
        currentLightboxIndex = index;
        updateLightbox(slides, index);
        lightbox.style.display = 'flex';
    }

    // Fechar lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    // Atualizar conteúdo do lightbox
    function updateLightbox(slides, index) {
        const slide = slides[index];
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');

        lightboxImage.src = slide.image;
        lightboxImage.alt = slide.alt;
        lightboxCaption.innerHTML = `
        <h3>${slide.title || ""}</h3>
        <p>${slide.description || ""}</p>
        <span class="small">${slide.details || ""}</span>
    `;
    }

    // Navegar entre imagens no lightbox
    function navigateLightbox(direction) {
        const locationSlides = allSlides.filter(slide => {
            const slideLocation = extractLocationFromTitle(slide.title);
            return slideLocation === currentLocation;
        });

        currentLightboxIndex += direction;

        // Verificar limites
        if (currentLightboxIndex < 0) {
            currentLightboxIndex = locationSlides.length - 1;
        } else if (currentLightboxIndex >= locationSlides.length) {
            currentLightboxIndex = 0;
        }

        updateLightbox(locationSlides, currentLightboxIndex);
    }

    // Teclado shortcuts para o lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        }
    });
});

