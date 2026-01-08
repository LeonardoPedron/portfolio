// blog-article.js - Sistema i18n per articoli del blog

class BlogArticleI18n {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'it';
        this.translations = window.translations || {};
        this.init();
    }

    init() {
        // Applica traduzioni al caricamento
        this.applyTranslations();

        // Ascolta cambi di lingua
        document.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.lang;
            this.applyTranslations();
        });

        // Gestione selettore lingua se presente
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            langSelector.value = this.currentLang;
            langSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('preferredLanguage', lang);
            this.applyTranslations();
            document.documentElement.lang = lang;

            // Notifica cambio lingua
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { lang: this.currentLang }
            }));
        }
    }

    t(path) {
        const keys = path.split('.');
        let value = this.translations[this.currentLang];

        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }

    applyTranslations() {
        // Traduci elementi con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (translation) {
                if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Traduci placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Traduci attributi title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation) {
                element.title = translation;
            }
        });

        // Aggiorna attributo lang del documento
        document.documentElement.lang = this.currentLang;
    }

    getCurrentLang() {
        return this.currentLang;
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.blogArticleI18n = new BlogArticleI18n();
    });
} else {
    window.blogArticleI18n = new BlogArticleI18n();
}
