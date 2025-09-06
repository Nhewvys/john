document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formContato").addEventListener("submit", async function (e) {
        e.preventDefault();

        const button = document.getElementById("btn-enviar")
        const buttonOldValue = button.innerHTML
        const nome = document.getElementById("nome").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensagem = document.getElementById("mensagem").value.trim();

        // Validação
        if (!nome || !telefone || !email || !mensagem) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Por favor, insira um email válido.");
            return;
        }

        const data = { nome, telefone, email, mensagem };

        try {
            button.innerHTML = "Enviando..."
            button.disabled = true
            const res = await fetch("https://formspree.io/f/xkgvknkl", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert("Recebemos sua mensagem com sucesso! Entraremos em contato em breve");
                e.target.reset();
                button.innerHTML = buttonOldValue
                button.disabled = false
            } else {
                alert("Erro ao enviar. Tente novamente.");
                button.innerHTML = buttonOldValue
                button.disabled = false
            }
        } catch (err) {
            alert("Falha de conexão.");
            button.innerHTML = buttonOldValue
            button.disabled = false
        }
    });

    const menu = document.querySelector(".menu-toggle");
    const header = document.querySelector("header"); // pega só 1 elemento

    menu.onclick = () => {
        header.classList.toggle("active");
    };

    function abrirFormulario() {
        // Rola até o formulário
        document.getElementById("formContato").scrollIntoView({ behavior: "smooth" });
        // Espera a rolagem terminar e dá foco no campo
        setTimeout(() => {
            document.getElementById("nome").focus();
        }, 500); // meio segundo pra dar tempo da rolagem
    }
    class OptimizedAnimationManager {
        constructor() {
            this.observer = null;
            this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            this.animatedElements = new Set();
            this.isInitialized = false;

            this.handleIntersection = this.handleIntersection.bind(this);
            this.handleCounterIntersection = this.handleCounterIntersection.bind(this);

            this.init();
        }

        init() {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            document.body.classList.remove("loading");

            if (this.isReducedMotion) {
                this.showAllElements();
                return;
            }

            this.setupIntersectionObserver();
            this.setupCounterAnimation();

            this.setupMenuToggle();
            this.setupFormHandler();

            this.isInitialized = true;
        }

        setupIntersectionObserver() {
            const options = {
                threshold: 0.15,
                rootMargin: "0px 0px -50px 0px"
            };

            this.observer = new IntersectionObserver(this.handleIntersection, options);

            this.observeElements();
        }

        observeElements() {
            const elementsToObserve = [
                { selector: "main .main-direito", delay: 0 },
                { selector: "main .main-esquerdo", delay: 200 },

                { selector: "main .tittle", delay: 0 },
                { selector: "#sobre .tittle", delay: 0 },
                { selector: "#contato .tittle", delay: 0 },



                { selector: "#sobre .main-direito", delay: 0 },
                { selector: "#sobre .main-esquerdo", delay: 200 },

                { selector: "#servicos .tittle", delay: 0 },
                { selector: "#unidades .tittle", delay: 0 },
                { selector: "#depoimentos .tittle", delay: 0 },

                { selector: ".card-service", delay: 100, stagger: 100 },

                { selector: ".card-region", delay: 100, stagger: 120 },

                { selector: ".card-testimonial", delay: 100, stagger: 150 },

                { selector: "#contato .container-grid > div:first-child", delay: 0 },
                { selector: "#contato .form-container", delay: 200 }
            ];

            elementsToObserve.forEach(({ selector, delay, stagger }) => {
                const elements = document.querySelectorAll(selector);

                elements.forEach((element, index) => {
                    const finalDelay = delay + (stagger ? index * stagger : 0);
                    element.setAttribute("data-animation-delay", finalDelay);
                    this.observer.observe(element);
                });
            });
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    const element = entry.target;
                    const delay = parseInt(element.getAttribute("data-animation-delay")) || 0;

                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            element.classList.add("animate-in");
                            this.animatedElements.add(element);

                            setTimeout(() => {
                                element.style.willChange = "auto";
                            }, 700);

                            this.observer.unobserve(element);
                        }, delay);
                    });
                }
            });
        }

        setupCounterAnimation() {
            const counters = document.querySelectorAll("#contadores .text-center");

            if (counters.length === 0) return;

            const counterOptions = {
                threshold: 0.5,
                rootMargin: "0px"
            };

            const counterObserver = new IntersectionObserver(this.handleCounterIntersection, counterOptions);

            counters.forEach(counter => {
                counter.classList.add("counter");
                counterObserver.observe(counter);
            });
        }

        handleCounterIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;

                    counter.classList.add("animate");

                    setTimeout(() => {
                        counter.classList.remove("animate");
                    }, 600);

                    entry.target.observer?.unobserve?.(counter);
                }
            });
        }

        showAllElements() {
            const allAnimatedElements = document.querySelectorAll(`
            main .main-direito,
            main .main-esquerdo,
            #sobre .main-direito,
            #sobre .main-esquerdo,
            .tittle,
            .card-service,
            .card-region,
            .card-testimonial,
            #contato .container-grid > div,
            .form-container
        `);

            allAnimatedElements.forEach(element => {
                element.classList.add("animate-in");
                element.style.willChange = "auto";
            });
        }

        setupMenuToggle() {
            const menu = document.querySelector(".menu-toggle");
            const header = document.querySelector("header");

            if (menu && header) {
                menu.addEventListener("click", (e) => {
                    e.preventDefault();
                    header.classList.toggle("active");
                });
            }
        }

        setupFormHandler() {
            window.abrirFormulario = () => {
                const formElement = document.getElementById("formContato");
                if (formElement) {
                    formElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    setTimeout(() => {
                        const nomeInput = document.getElementById("nome");
                        if (nomeInput) {
                            nomeInput.focus();
                        }
                    }, 800);
                }
            };
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }

            this.animatedElements.clear();
            this.isInitialized = false;
        }

        reinitialize() {
            this.destroy();
            this.init();
        }
    }

    let animationManager;

    function initializeAnimations() {
        try {
            animationManager = new OptimizedAnimationManager();
        } catch (error) {
            console.warn("Erro ao inicializar animações:", error);
            fallbackAnimations();
        }
    }

    function fallbackAnimations() {
        if (!("IntersectionObserver" in window)) {
            console.warn("Intersection Observer não suportado. Usando fallback.");

            document.addEventListener("DOMContentLoaded", () => {
                setTimeout(() => {
                    const elements = document.querySelectorAll(`
                    main .main-direito,
                    main .main-esquerdo,
                    #sobre .main-direito,
                    #sobre .main-esquerdo,
                    .tittle,
                    .card-service,
                    .card-region,
                    .card-testimonial,
                    #contato .container-grid > div,
                    .form-container
                `);

                    elements.forEach(element => {
                        element.classList.add("animate-in");
                    });
                }, 300);
            });
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function monitorAnimationPerformance() {
        if (typeof performance !== "undefined" && performance.mark) {
            performance.mark("animations-start");

            setTimeout(() => {
                performance.mark("animations-end");
                performance.measure("animations-duration", "animations-start", "animations-end");

                const measure = performance.getEntriesByName("animations-duration")[0];
                if (measure && measure.duration > 1000) {
                    console.warn(`Animações levaram ${measure.duration}ms para carregar`);
                }
            }, 2000);
        }
    }

    initializeAnimations();

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        monitorAnimationPerformance();
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = OptimizedAnimationManager;
    }

    window.OptimizedAnimationManager = OptimizedAnimationManager;
    window.animationManager = animationManager;
});
