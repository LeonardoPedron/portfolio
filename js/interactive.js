// ============================================
// INTERACTIVE FEATURES
// Advanced interactivity for portfolio website
// ============================================

// ============================================
// 1. PARTICLES ANIMATION
// ============================================
class ParticlesAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 30 : 50;
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isVisible = true;

        this.init();
        this.animate();
        this.addEventListeners();
        this.setupVisibilityDetection();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
            this.ctx.fill();

            // Update position
            particle.x += particle.dx;
            particle.y += particle.dy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.dx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.dy *= -1;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const dirX = dx / distance;
                const dirY = dy / distance;
                particle.x -= dirX * force * 2;
                particle.y -= dirY * force * 2;
            }
        });

        // Draw connections
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.15 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
    }

    animate() {
        if (!this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupVisibilityDetection() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0 });

        observer.observe(this.canvas);

        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });
    }

    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    }

    addEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.particleCount = window.innerWidth < 768 ? 30 : 50;
                this.resizeCanvas();
                this.createParticles();
            }, 250);
        });

        const throttledMouseMove = this.throttle((e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        }, 16);

        window.addEventListener('mousemove', throttledMouseMove);

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ============================================
// 2. CUSTOM CURSOR
// ============================================
class CustomCursor {
    constructor() {
        this.dot = document.getElementById('cursorDot');
        this.outline = document.getElementById('cursorOutline');

        if (!this.dot || !this.outline) return;

        this.mouseX = 0;
        this.mouseY = 0;
        this.outlineX = 0;
        this.outlineY = 0;

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            this.dot.style.left = `${e.clientX}px`;
            this.dot.style.top = `${e.clientY}px`;
        });

        // Smooth outline follow
        const animate = () => {
            this.outlineX += (this.mouseX - this.outlineX) * 0.15;
            this.outlineY += (this.mouseY - this.outlineY) * 0.15;

            this.outline.style.left = `${this.outlineX}px`;
            this.outline.style.top = `${this.outlineY}px`;

            requestAnimationFrame(animate);
        };
        animate();

        // Add hover effects
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-category, .contact-item');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.outline.style.borderColor = 'rgba(14, 165, 233, 0.8)';
            });

            el.addEventListener('mouseleave', () => {
                this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
                this.outline.style.transform = 'translate(-50%, -50%) scale(1)';
                this.outline.style.borderColor = 'rgba(14, 165, 233, 0.5)';
            });
        });
    }
}

// ============================================
// 3. THEME SWITCHER
// ============================================
class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        if (!this.themeToggle) return;

        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateIcon();
        this.updateRotation();

        // Toggle theme
        this.themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            localStorage.setItem('theme', this.currentTheme);
            this.updateIcon();
            this.updateRotation();
            this.animateThemeChange();
        });
    }

    updateIcon() {
        const icon = this.themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    updateRotation() {
        if (this.currentTheme === 'light') {
            this.themeToggle.classList.add('light-mode');
        } else {
            this.themeToggle.classList.remove('light-mode');
        }
    }

    animateThemeChange() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
}

// ============================================
// 4. PROJECT CARDS INTERACTION
// ============================================
class ProjectCards {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.handleMouseEnter(card, e);
            });

            card.addEventListener('mousemove', (e) => {
                this.handleMouseMove(card, e);
            });

            card.addEventListener('mouseleave', (e) => {
                this.handleMouseLeave(card);
            });
        });
    }

    handleMouseEnter(card, e) {
        card.style.transition = 'transform 0.1s ease';
    }

    handleMouseMove(card, e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    }

    handleMouseLeave(card) {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    }
}

// ============================================
// 5. SKILL BARS WITH INTERACTION
// ============================================
class SkillBars {
    constructor() {
        this.skillCategories = document.querySelectorAll('.skill-category');
        this.init();
    }

    init() {
        this.skillCategories.forEach(category => {
            category.addEventListener('click', () => {
                this.expandSkillDetails(category);
            });
        });
    }

    expandSkillDetails(category) {
        // Add active class
        const wasActive = category.classList.contains('active');

        // Remove active from all
        this.skillCategories.forEach(cat => cat.classList.remove('active'));

        // Toggle current
        if (!wasActive) {
            category.classList.add('active');
            category.style.transform = 'scale(1.05)';
            setTimeout(() => {
                category.style.transform = '';
            }, 300);
        }
    }
}

// ============================================
// 6. TYPING EFFECT ENHANCED
// ============================================
class TypingEffect {
    constructor() {
        this.titles = [
            'Software Engineer',
            'Backend Developer',
            'Database Architect',
            'Full Stack Developer'
        ];
        this.currentIndex = 0;
        this.element = document.querySelector('.hero-subtitle');
        if (!this.element) return;

        this.init();
    }

    init() {
        this.typeAndDelete();
    }

    async typeAndDelete() {
        while (true) {
            const currentTitle = this.titles[this.currentIndex];

            // Type
            for (let i = 0; i <= currentTitle.length; i++) {
                this.element.textContent = currentTitle.substring(0, i);
                await this.sleep(100);
            }

            await this.sleep(2000);

            // Delete
            for (let i = currentTitle.length; i >= 0; i--) {
                this.element.textContent = currentTitle.substring(0, i);
                await this.sleep(50);
            }

            await this.sleep(500);

            this.currentIndex = (this.currentIndex + 1) % this.titles.length;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateTitles(newTitles) {
        if (Array.isArray(newTitles) && newTitles.length > 0) {
            this.titles = newTitles;
        }
    }
}

// ============================================
// 7. SCROLL REVEAL ANIMATIONS
// ============================================
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.skill-category, .stat-item, .contact-item, .project-card');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// 8. PARALLAX EFFECTS
// ============================================
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.elements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const yPos = -(window.pageYOffset * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// ============================================
// 8. LANGUAGE SELECTOR
// ============================================
class LanguageSelector {
    constructor() {
        this.langToggle = document.getElementById('langToggle');
        this.langMenu = document.getElementById('langMenu');
        this.currentLangSpan = document.getElementById('currentLang');

        if (!this.langToggle || !this.langMenu) return;

        this.initLanguage();
        this.addEventListeners();
    }

    initLanguage() {
        const currentLang = window.i18n.getCurrentLang().toUpperCase();
        this.currentLangSpan.textContent = currentLang;

        window.i18n.updatePage();
    }

    addEventListeners() {
        this.langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.langMenu.classList.toggle('active');
        });

        this.langMenu.querySelectorAll('button[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                window.i18n.setLanguage(lang);
                this.currentLangSpan.textContent = lang.toUpperCase();
                this.langMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.langToggle.contains(e.target) && !this.langMenu.contains(e.target)) {
                this.langMenu.classList.remove('active');
            }
        });
    }
}

// ============================================
// 9. BLOG SEARCH
// ============================================
class BlogSearch {
    constructor() {
        this.searchInput = document.getElementById('blogSearch');
        this.blogCards = document.querySelectorAll('.blog-card');

        if (!this.searchInput) return;

        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        this.searchInput.addEventListener('input', () => this.applySearch());

        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.applySearch();
        });
    }

    applySearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();

        this.blogCards.forEach(card => {
            const titleKey = card.getAttribute('data-title-key');
            const descKey = card.getAttribute('data-desc-key');
            const cardTags = card.getAttribute('data-tags') || '';

            // Get translated title and description
            const title = titleKey ? window.i18n.t(titleKey).toLowerCase() : '';
            const description = descKey ? window.i18n.t(descKey).toLowerCase() : '';
            const tagsLower = cardTags.toLowerCase();

            // Check search term (search in title, description, and tags)
            const matchesSearch = !searchTerm ||
                title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                tagsLower.includes(searchTerm);

            // Show or hide card
            if (matchesSearch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive features
    new ParticlesAnimation('particlesCanvas');
    new CustomCursor();
    new ThemeSwitcher();
    new LanguageSelector();
    new ProjectCards();
    new SkillBars();
    window.typingEffect = new TypingEffect();
    new ScrollReveal();
    new ParallaxEffect();
    new BlogSearch();

    console.log('%c✨ Interactive features loaded!', 'color: #0ea5e9; font-size: 16px; font-weight: bold;');
});

// ============================================
// SMOOTH PERFORMANCE
// ============================================
// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-base', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
}
