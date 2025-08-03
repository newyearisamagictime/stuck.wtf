/* =====================================================================
 * Copy Save Widget - Animates "Copy & Save" workflow
 * ===================================================================== */

(function (global) {
    "use strict";

    /* Dynamic file loading */
    const STYLE_ID = 'copy-save-style';
    const WIDGET_BASE_PATH = './'; // Базовый путь к файлам виджета

    // Функция для загрузки CSS файла
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            if (document.getElementById(STYLE_ID)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.id = STYLE_ID;
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            document.head.appendChild(link);
        });
    }

    // Функция для загрузки HTML файла
    function loadHTML(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load HTML: ${url}`);
                }
                return response.text();
            });
    }

    function copySaveWidget(selector, opts = {}) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return console.error('copySaveWidget: container not found', selector);

        // Определяем пути к файлам
        const cssPath = opts.cssPath || WIDGET_BASE_PATH + 'copy-save-widget.css';
        const htmlPath = opts.htmlPath || WIDGET_BASE_PATH + 'copy-save-widget.html';

        // Загружаем CSS и HTML асинхронно
        Promise.all([
            loadCSS(cssPath),
            loadHTML(htmlPath)
        ])
        .then(([, htmlContent]) => {
            // Инициализируем виджет после загрузки файлов
            initializeWidget(el, htmlContent, opts);
        })
        .catch(error => {
            console.error('copySaveWidget: Failed to load resources', error);
        });
    }

    function initializeWidget(el, htmlContent, opts) {
        el.innerHTML = '';
        el.classList.add('copy-save-widget');

        if (opts.width) el.style.width = opts.width + 'px';
        if (opts.height) el.style.height = opts.height + 'px';

        el.insertAdjacentHTML('afterbegin', htmlContent);

        const sceneCopy = el.querySelector('.scene-copy');
        const sceneEditor = el.querySelector('.scene-editor');
        const copyBtn = el.querySelector('.copy-btn');
        const saveBtn = el.querySelector('.save-btn');
        const typeSpan = el.querySelector('.type-script');
        const tag = '<script src="widget.js"></' + 'script>';

        copyBtn.addEventListener('click', () => {
            copyBtn.classList.add('clicked');
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copy it';
        });

        saveBtn.addEventListener('click', () => {
            saveBtn.classList.add('clicked');
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
        });

        const T = opts.speedMultiplier ? 1 / opts.speedMultiplier : 1;

        function reset() {
            sceneCopy.style.opacity = 1;
            sceneEditor.style.opacity = 0;
            copyBtn.classList.remove('clicked');
            saveBtn.classList.remove('clicked');
            copyBtn.innerHTML = 'Copy';
            saveBtn.innerHTML = 'Save';
            typeSpan.textContent = '';
        }

        function loop() {
            reset();
            setTimeout(() => {
                copyBtn.classList.add('clicked');
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            }, 1000 * T);
            setTimeout(() => { sceneCopy.style.opacity = 0; sceneEditor.style.opacity = 1; }, 2200 * T);
            setTimeout(() => {
                let i = 0;
                const t = setInterval(() => {
                    typeSpan.textContent = tag.slice(0, i++);
                    if (i > tag.length) clearInterval(t);
                }, 50 * T);
            }, 2500 * T);
            setTimeout(() => {
                saveBtn.classList.add('clicked');
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
            }, 5200 * T);
            setTimeout(() => { sceneEditor.style.opacity = 0; }, 6700 * T);
            setTimeout(loop, 8200 * T);
        }

        loop();

        // Возвращаем API для управления виджетом
        return {
            element: el,
            reset: reset,
            loop: loop
        };
    }

    // Экспорт в глобальную область видимости
    global.copySaveWidget = copySaveWidget;

})(typeof window !== 'undefined' ? window : global);
