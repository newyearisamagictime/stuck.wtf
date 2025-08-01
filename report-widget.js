/**
 * Report Problem Widget
 * Виджет для отправки отчетов о проблемах с возможностью создания скриншотов и аннотаций
 */

class ReportWidget {
    constructor(options = {}) {
        this.options = {
            accentColor: options.accentColor || '#c90f0f',
            buttonText: options.buttonText || 'Report a problem',
            position: options.position || 'right',
            ...options
        };

        // Переменные для аннотаций
        this.isDrawing = false;
        this.currentTool = 'arrow';
        this.currentColor = '#ff0000';
        this.annotations = [];
        this.canvas = null;
        this.ctx = null;
        this.startX = 0;
        this.startY = 0;

        this.init();
    }

    // Инициализация виджета
    init() {
        this.loadExternalLibraries();
        this.injectStyles();
        this.createWidgetHTML();
        this.bindEvents();
    }

    // Загрузка внешних библиотек
    loadExternalLibraries() {
        // HTML2Canvas для создания скриншотов
        if (!window.html2canvas) {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            document.head.appendChild(script);
        }
    }

    // Внедрение стилей
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Виджет обратной связи */
            .report-widget {
                position: fixed;
                right: -2px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1000;
                font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .report-widget.left {
                right: auto;
                left: -2px;
            }

            .report-widget-btn {
                background: ${this.options.accentColor};
                color: white;
                border: none;
                padding: 12px 6px;
                writing-mode: vertical-lr;
                text-orientation: mixed;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                border-radius: 8px 0 0 8px;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                font-family: inherit;
            }

            .report-widget.left .report-widget-btn {
                border-radius: 0 8px 8px 0;
                box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            }

            .report-widget-btn:hover {
                background: #b60e0e;
                transform: translateX(-3px);
            }

            .report-widget.left .report-widget-btn:hover {
                transform: translateX(3px);
            }

            /* Стили для скриншота */
            .report-screenshot-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: none;
                cursor: crosshair;
            }

            .report-screenshot-overlay.active {
                display: block;
            }

            .report-annotation-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: crosshair;
            }

            .report-screenshot-toolbar {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                display: flex;
                gap: 16px;
                align-items: center;
                font-family: inherit;
                z-index: 10000;
            }

            .report-toolbar-section {
                display: flex;
                gap: 8px;
                align-items: center;
                border-right: 1px solid #e2e8f0;
                padding-right: 16px;
            }

            .report-toolbar-section:last-child {
                border-right: none;
                padding-right: 0;
            }

            .report-tool-btn, .report-action-btn {
                width: 36px;
                height: 36px;
                border: 1px solid #e2e8f0;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                color: #64748b;
            }

            .report-tool-btn:hover, .report-action-btn:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
            }

            .report-tool-btn.active {
                background: ${this.options.accentColor};
                border-color: ${this.options.accentColor};
                color: white;
            }

            .report-color-picker {
                display: flex;
                gap: 4px;
            }

            .report-color-btn {
                width: 24px;
                height: 24px;
                border: 2px solid white;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .report-color-btn.active {
                border-color: #1e293b;
                transform: scale(1.1);
            }

            .report-cancel-btn, .report-save-btn {
                width: auto;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
            }

            .report-cancel-btn {
                background: #f8fafc;
                color: #64748b;
            }

            .report-save-btn {
                background: ${this.options.accentColor};
                color: white;
                border-color: ${this.options.accentColor};
            }

            .report-save-btn:hover {
                background: #b60e0e;
            }

            .report-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10001;
                display: none;
                align-items: center;
                justify-content: center;
            }

            .report-popup.active {
                display: flex;
            }

            .report-modal {
                background: white;
                border-radius: 16px;
                padding: 24px;
                max-width: 480px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                animation: reportSlideIn 0.3s ease;
                font-family: inherit;
            }

            @keyframes reportSlideIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }

            .report-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #64748b;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .report-close:hover {
                background: #f1f5f9;
            }

            .report-header {
                margin-bottom: 20px;
                padding-right: 40px;
            }

            .report-header h3 {
                margin: 0 0 8px 0;
                color: #1e293b;
                font-size: 20px;
                font-weight: bold;
            }

            .report-header p {
                margin: 0;
                color: #64748b;
                font-size: 14px;
            }

            .report-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .report-screenshot-preview {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px;
                background: #f8fafc;
            }

            .report-form label {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 4px;
                display: block;
                font-size: 14px;
            }

            .report-form input,
            .report-form textarea,
            .report-form select {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-family: inherit;
                font-size: 14px;
                box-sizing: border-box;
                transition: border-color 0.2s, box-shadow 0.2s;
            }

            .report-form textarea {
                resize: vertical;
                min-height: 100px;
            }

            .report-form input:focus,
            .report-form textarea:focus,
            .report-form select:focus {
                outline: none;
                border-color: ${this.options.accentColor};
                box-shadow: 0 0 0 3px rgba(201, 15, 15, 0.1);
            }

            .report-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            .report-btn-secondary {
                background: #f8f9fa;
                color: #64748b;
                border: 1px solid #d1d5db;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
                transition: all 0.2s;
            }

            .report-btn-secondary:hover {
                background: #e2e8f0;
            }

            .report-btn-primary {
                background: ${this.options.accentColor};
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s;
            }

            .report-btn-primary:hover {
                background: #b60e0e;
            }

            .report-btn-primary:disabled {
                background: #94a3b8;
                cursor: not-allowed;
            }

            .report-success-message {
                text-align: center;
                padding: 40px 20px;
            }

            .report-success-message h3 {
                color: #059669;
                margin-bottom: 12px;
                font-weight: bold;
            }

            .report-success-message p {
                color: #64748b;
                margin-bottom: 20px;
            }

            @media (max-width: 768px) {
                .report-modal {
                    margin: 20px;
                    width: calc(100% - 40px);
                }

                .report-actions {
                    flex-direction: column;
                }

                .report-btn-secondary,
                .report-btn-primary {
                    width: 100%;
                }

                .report-screenshot-toolbar {
                    flex-direction: column;
                    gap: 8px;
                    padding: 8px;
                    max-width: 90%;
                }

                .report-toolbar-section {
                    border-right: none;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 8px;
                    padding-right: 0;
                }

                .report-toolbar-section:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Создание HTML структуры виджета
    createWidgetHTML() {
        // Основной виджет
        const widget = document.createElement('div');
        widget.className = `report-widget ${this.options.position === 'left' ? 'left' : ''}`;
        widget.innerHTML = `
            <button class="report-widget-btn">${this.options.buttonText}</button>
        `;

        // Оверлей для скриншота
        const overlay = document.createElement('div');
        overlay.className = 'report-screenshot-overlay';
        overlay.id = 'reportScreenshotOverlay';
        overlay.innerHTML = `
            <canvas class="report-annotation-canvas" id="reportAnnotationCanvas"></canvas>
            <div class="report-screenshot-toolbar">
                <div class="report-toolbar-section">
                    <button class="report-tool-btn active" data-tool="arrow" title="Стрелка">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 17L17 7M17 7H7M17 7V17"/>
                        </svg>
                    </button>
                    <button class="report-tool-btn" data-tool="rectangle" title="Прямоугольник">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        </svg>
                    </button>
                    <button class="report-tool-btn" data-tool="circle" title="Круг">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    </button>
                    <button class="report-tool-btn" data-tool="pen" title="Рисование">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                    </button>
                </div>

                <div class="report-toolbar-section">
                    <div class="report-color-picker">
                        <button class="report-color-btn active" data-color="#ff0000" style="background: #ff0000;"></button>
                        <button class="report-color-btn" data-color="#00ff00" style="background: #00ff00;"></button>
                        <button class="report-color-btn" data-color="#0000ff" style="background: #0000ff;"></button>
                        <button class="report-color-btn" data-color="#ffff00" style="background: #ffff00;"></button>
                        <button class="report-color-btn" data-color="#ff00ff" style="background: #ff00ff;"></button>
                    </div>
                </div>

                <div class="report-toolbar-section">
                    <button class="report-action-btn" title="Очистить">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                        </svg>
                    </button>
                    <button class="report-action-btn" title="Отменить">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7v6h6"/>
                            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
                        </svg>
                    </button>
                </div>

                <div class="report-toolbar-section">
                    <button class="report-action-btn report-cancel-btn">Отмена</button>
                    <button class="report-action-btn report-save-btn">Готово</button>
                </div>
            </div>
        `;

        // Попап для отправки отчета
        const popup = document.createElement('div');
        popup.className = 'report-popup';
        popup.id = 'reportPopup';
        popup.innerHTML = `
            <div class="report-modal">
                <button class="report-close">&times;</button>

                <div id="reportForm">
                    <div class="report-header">
                        <h3>🐛 Report a problem</h3>
                        <p>Добавьте описание к вашему скриншоту</p>
                    </div>

                    <form class="report-form">
                        <div class="report-screenshot-preview">
                            <img id="reportScreenshotPreview" src="" alt="Screenshot" style="max-width: 100%; border-radius: 8px;">
                        </div>

                        <div>
                            <label for="reportProblemType">Тип проблемы</label>
                            <select id="reportProblemType" required>
                                <option value="">Выберите тип проблемы...</option>
                                <option value="page-not-loading">Страница не загружается</option>
                                <option value="button-not-working">Кнопка не работает</option>
                                <option value="checkout-issue">Проблема с оформлением заказа</option>
                                <option value="display-issue">Проблема с отображением</option>
                                <option value="slow-loading">Медленная загрузка</option>
                                <option value="other">Другое</option>
                            </select>
                        </div>

                        <div>
                            <label for="reportUserEmail">Ваш email (опционально)</label>
                            <input type="email" id="reportUserEmail" placeholder="your@email.com">
                        </div>

                        <div>
                            <label for="reportProblemDescription">Описание проблемы</label>
                            <textarea id="reportProblemDescription" required placeholder="Опишите, что вы пытались сделать и что пошло не так..."></textarea>
                        </div>

                        <div class="report-actions">
                            <button type="button" class="report-btn-secondary">Отмена</button>
                            <button type="submit" class="report-btn-primary">Отправить отчет</button>
                        </div>
                    </form>
                </div>

                <div id="reportSuccessMessage" class="report-success-message" style="display: none;">
                    <h3>✅ Спасибо!</h3>
                    <p>Мы получили ваш отчет и сразу займемся расследованием проблемы.</p>
                    <p>Мы будем держать вас в курсе по email, если вы его указали.</p>
                    <button class="report-btn-primary">Закрыть</button>
                </div>
            </div>
        `;

        // Добавляем элементы в DOM
        document.body.appendChild(widget);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Сохраняем ссылки на элементы
        this.widget = widget;
        this.overlay = overlay;
        this.popup = popup;
    }

    // Привязка событий
    bindEvents() {
        // Кнопка запуска виджета
        this.widget.querySelector('.report-widget-btn').addEventListener('click', () => this.startScreenshot());

        // События для инструментов
        this.overlay.querySelectorAll('.report-tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.closest('.report-tool-btn')));
        });

        // События для цветов
        this.overlay.querySelectorAll('.report-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectColor(e.target));
        });

        // Кнопки действий в toolbar
        const clearBtn = this.overlay.querySelector('.report-action-btn[title="Очистить"]');
        const undoBtn = this.overlay.querySelector('.report-action-btn[title="Отменить"]');
        const cancelBtn = this.overlay.querySelector('.report-cancel-btn');
        const saveBtn = this.overlay.querySelector('.report-save-btn');

        clearBtn.addEventListener('click', () => this.clearAnnotations());
        undoBtn.addEventListener('click', () => this.undoAnnotation());
        cancelBtn.addEventListener('click', () => this.cancelScreenshot());
        saveBtn.addEventListener('click', () => this.finishScreenshot());

        // События для попапа
        const closeBtn = this.popup.querySelector('.report-close');
        const cancelFormBtn = this.popup.querySelector('.report-btn-secondary');
        const form = this.popup.querySelector('.report-form');
        const successCloseBtn = this.popup.querySelector('#reportSuccessMessage .report-btn-primary');

        closeBtn.addEventListener('click', () => this.closeFeedback());
        cancelFormBtn.addEventListener('click', () => this.closeFeedback());
        form.addEventListener('submit', (e) => this.submitFeedback(e));
        successCloseBtn.addEventListener('click', () => this.closeFeedback());

        // События для canvas
        this.setupCanvasEvents();
    }

    // Настройка событий для canvas
    setupCanvasEvents() {
        const canvas = this.overlay.querySelector('#reportAnnotationCanvas');

        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch события для мобильных устройств
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
    }

    // Загрузка html2canvas если нужно
    async loadHtml2Canvas() {
        if (window.html2canvas) return Promise.resolve();

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    // Начало создания скриншота
    async startScreenshot() {
        try {
            await this.loadHtml2Canvas();

            this.overlay.classList.add('active');

            const canvas = this.overlay.querySelector('#reportAnnotationCanvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

            // Очищаем предыдущие аннотации
            this.annotations = [];
            this.clearCanvas();

        } catch (error) {
            console.error('Error starting screenshot:', error);
            alert('Ошибка при запуске инструмента скриншота');
        }
    }

    // Выбор инструмента
    selectTool(button) {
        this.overlay.querySelectorAll('.report-tool-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentTool = button.dataset.tool;
    }

    // Выбор цвета
    selectColor(button) {
        this.overlay.querySelectorAll('.report-color-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentColor = button.dataset.color;
    }

    // Очистка аннотаций
    clearAnnotations() {
        this.annotations = [];
        this.clearCanvas();
    }

    // Отмена последней аннотации
    undoAnnotation() {
        this.annotations.pop();
        this.redrawAnnotations();
    }

    // Отмена скриншота
    cancelScreenshot() {
        this.overlay.classList.remove('active');
    }

    // Завершение скриншота
    async finishScreenshot() {
        try {
            // Временно скрываем оверлей для скриншота
            this.overlay.style.display = 'none';

            const screenshot = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                scale: 1
            });

            // Создаем итоговый canvas с аннотациями
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = screenshot.width;
            finalCanvas.height = screenshot.height;
            const finalCtx = finalCanvas.getContext('2d');

            // Рисуем скриншот
            finalCtx.drawImage(screenshot, 0, 0);

            // Рисуем аннотации поверх
            const scaleX = screenshot.width / window.innerWidth;
            const scaleY = screenshot.height / window.innerHeight;

            this.annotations.forEach(annotation => {
                this.drawAnnotationOnContext(finalCtx, annotation, scaleX, scaleY);
            });

            // Конвертируем в base64
            const dataURL = finalCanvas.toDataURL('image/png');

            // Показываем попап с формой
            this.popup.querySelector('#reportScreenshotPreview').src = dataURL;
            this.popup.classList.add('active');
            this.overlay.classList.remove('active');

        } catch (error) {
            console.error('Error creating screenshot:', error);
            alert('Ошибка при создании скриншота');
            this.overlay.style.display = 'block';
        }
    }

    // Начало рисования
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;

        if (this.currentTool === 'pen') {
            this.annotations.push({
                tool: 'pen',
                color: this.currentColor,
                points: [{x: this.startX, y: this.startY}]
            });
        }
    }

    // Рисование
    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (this.currentTool === 'pen') {
            const currentAnnotation = this.annotations[this.annotations.length - 1];
            currentAnnotation.points.push({x: currentX, y: currentY});
            this.redrawAnnotations();
        } else {
            // Для других инструментов показываем предварительный просмотр
            this.redrawAnnotations();
            this.drawPreview(currentX, currentY);
        }
    }

    // Остановка рисования
    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.currentTool !== 'pen') {
            const rect = this.canvas.getBoundingClientRect();
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;

            this.annotations.push({
                tool: this.currentTool,
                color: this.currentColor,
                startX: this.startX,
                startY: this.startY,
                endX: endX,
                endY: endY
            });

            this.redrawAnnotations();
        }
    }

    // Предварительный просмотр
    drawPreview(currentX, currentY) {
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();

        switch (this.currentTool) {
            case 'arrow':
                this.drawArrow(this.ctx, this.startX, this.startY, currentX, currentY);
                break;
            case 'rectangle':
                this.ctx.rect(this.startX, this.startY, currentX - this.startX, currentY - this.startY);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(currentX - this.startX, 2) + Math.pow(currentY - this.startY, 2));
                this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                break;
        }

        this.ctx.stroke();
    }

    // Перерисовка всех аннотаций
    redrawAnnotations() {
        this.clearCanvas();
        this.annotations.forEach(annotation => {
            this.drawAnnotationOnContext(this.ctx, annotation, 1, 1);
        });
    }

    // Рисование аннотации на контексте
    drawAnnotationOnContext(ctx, annotation, scaleX = 1, scaleY = 1) {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = 3 * Math.max(scaleX, scaleY);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        switch (annotation.tool) {
            case 'arrow':
                this.drawArrow(ctx,
                    annotation.startX * scaleX, annotation.startY * scaleY,
                    annotation.endX * scaleX, annotation.endY * scaleY
                );
                break;
            case 'rectangle':
                ctx.rect(
                    annotation.startX * scaleX, annotation.startY * scaleY,
                    (annotation.endX - annotation.startX) * scaleX,
                    (annotation.endY - annotation.startY) * scaleY
                );
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow((annotation.endX - annotation.startX) * scaleX, 2) +
                    Math.pow((annotation.endY - annotation.startY) * scaleY, 2)
                );
                ctx.arc(annotation.startX * scaleX, annotation.startY * scaleY, radius, 0, 2 * Math.PI);
                break;
            case 'pen':
                if (annotation.points.length > 1) {
                    ctx.moveTo(annotation.points[0].x * scaleX, annotation.points[0].y * scaleY);
                    for (let i = 1; i < annotation.points.length; i++) {
                        ctx.lineTo(annotation.points[i].x * scaleX, annotation.points[i].y * scaleY);
                    }
                }
                break;
        }

        ctx.stroke();
    }

    // Рисование стрелки
    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Линия стрелки
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);

        // Наконечник стрелки
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    }

    // Очистка canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Отправка отчета
    async submitFeedback(event) {
        event.preventDefault();

        const formData = {
            problemType: this.popup.querySelector('#reportProblemType').value,
            userEmail: this.popup.querySelector('#reportUserEmail').value,
            description: this.popup.querySelector('#reportProblemDescription').value,
            screenshot: this.popup.querySelector('#reportScreenshotPreview').src,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        try {
            // Отключаем кнопку отправки
            const submitBtn = this.popup.querySelector('.report-btn-primary[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            // Здесь должна быть отправка на ваш сервер
            await this.sendReportToServer(formData);

            // Показываем сообщение об успехе
            this.popup.querySelector('#reportForm').style.display = 'none';
            this.popup.querySelector('#reportSuccessMessage').style.display = 'block';

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Ошибка при отправке отчета. Попробуйте еще раз.');

            // Возвращаем кнопку в исходное состояние
            const submitBtn = this.popup.querySelector('.report-btn-primary[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить отчет';
        }
    }

    // Отправка отчета на сервер (нужно реализовать)
    async sendReportToServer(data) {
        // Пример отправки на сервер
        if (this.options.apiEndpoint) {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Server response was not ok');
            }

            return response.json();
        } else {
            // Имитация отправки
            console.log('Report data:', data);
            return new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Закрытие попапа
    closeFeedback() {
        this.popup.classList.remove('active');

        // Сброс формы
        this.popup.querySelector('#reportForm').style.display = 'block';
        this.popup.querySelector('#reportSuccessMessage').style.display = 'none';
        this.popup.querySelector('.report-form').reset();

        const submitBtn = this.popup.querySelector('.report-btn-primary[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить отчет';
    }

    // Уничтожение виджета
    destroy() {
        if (this.widget) this.widget.remove();
        if (this.overlay) this.overlay.remove();
        if (this.popup) this.popup.remove();
    }
}

// Глобальная функция для инициализации виджета
window.ReportWidget = ReportWidget;

// Автоматическая инициализация если есть атрибут data-report-widget
document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-report-widget]');
    if (autoInit) {
        const options = {};

        // Читаем опции из data атрибутов
        if (autoInit.dataset.accentColor) options.accentColor = autoInit.dataset.accentColor;
        if (autoInit.dataset.buttonText) options.buttonText = autoInit.dataset.buttonText;
        if (autoInit.dataset.position) options.position = autoInit.dataset.position;
        if (autoInit.dataset.apiEndpoint) options.apiEndpoint = autoInit.dataset.apiEndpoint;

        new ReportWidget(options);
    }
});
