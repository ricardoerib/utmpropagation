(function() {
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    function logMessage(type, message, data = null) {
        if (type === 'warn') {
            console.warn(message, data);
        } else if (type === 'error') {
            console.error(message, data);
        } else {
            console.log(message, data);
        }
    }

    function getDomainUrl(includeSubdomain = false) {
        try {
            const { hostname } = new URL(window.location.href);
            const parts = hostname.split('.');

            if (includeSubdomain) {
                return hostname;
            }

            if (parts.length > 2) {
                return `.${parts.slice(-2).join('.')}`;
            }

            return hostname;
        } catch (error) {
            logMessage('error', 'Erro ao extrair domínio:', error);
            return null;
        }
    }

    if (!('URL' in window)) {
        logMessage('warn', 'API URL não suportada. Adicionando polyfill.');
        (function() {
            function URL(url, base) {
                const doc = document.implementation.createHTMLDocument('');
                const baseElement = doc.createElement('base');
                const anchor = doc.createElement('a');
                baseElement.href = base || window.location.href;
                doc.head.appendChild(baseElement);
                anchor.href = url;
                doc.body.appendChild(anchor);
                return anchor;
            }
            window.URL = URL;
        })();
    }

    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utmData = {};
        utmParams.forEach(param => {
            if (params.has(param)) {
                utmData[param] = params.get(param);
            }
        });
        return utmData;
    }

    function storeUTMCookies(utmData, h=24) {
        const expires = new Date(Date.now() + h * 60 * 60 * 1000).toUTCString();
        const domain = getDomainUrl();
        for (const key in utmData) {
            if (utmData.hasOwnProperty(key)) {
                document.cookie = `${key}=${utmData[key]};expires=${expires};path=/;domain=${domain}`;
            }
        }
    }

    function getStoredUTMCookies() {
        const storedUTMData = {};
        const cookies = document.cookie.split('; ').filter(cookie => {
            const [key] = cookie.split('=');
            return utmParams.includes(key);
        });
        cookies.forEach(cookie => {
            const [key, value] = cookie.split('=');
            storedUTMData[key] = value;
        });
        return storedUTMData;
    }

    function propagateUTMParams() {
        const storedUTMs = getStoredUTMCookies();
        if (Object.keys(storedUTMs).length > 0) {
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                try {
                    const url = new URL(link.href, window.location.origin);
                    if (url.origin === window.location.origin) { 
                        for (const key in storedUTMs) {
                            if (storedUTMs.hasOwnProperty(key)) {
                                url.searchParams.set(key, storedUTMs[key]);
                            }
                        }
                        link.href = url.toString();
                    }
                } catch (e) {
                    logMessage('error', `Erro ao processar link: ${link.href}`, e);
                }
            });
        }
    }

    // Observar links dinâmicos (para SPAs)
    const observer = new MutationObserver(() => {
        propagateUTMParams();
    });

    // Configuração opcional do observador
    const observerConfig = {
        childList: true,
        subtree: true
    };

    observer.observe(document.body, observerConfig);

    document.addEventListener('DOMContentLoaded', () => {
        const currentUTMs = getUTMParams();
        if (Object.keys(currentUTMs).length > 0) {
            storeUTMCookies(currentUTMs);
        }
        propagateUTMParams();
    });

    // Comentários detalhados
    // Este script:
    // 1. Captura parâmetros UTM da URL na primeira visita.
    // 2. Armazena os UTMs em cookies de curta duração (1 dia).
    // 3. Propaga UTMs para links internos do site.
    // 4. Monitora mudanças no DOM (para SPAs) e aplica UTMs dinamicamente.
    // 5. Inclui fallback para navegadores sem suporte à API URL.
})();
