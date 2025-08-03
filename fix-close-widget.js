/* =====================================================================
 * Fix Close Widget - Ticket → done, toast, "All fixed!", confetti
 * ===================================================================== */

(function (global) {
    "use strict";

    const STYLE_ID = 'fix-close-style';
    let htmlPromise;
    let cssLoaded = false;

    function injectStyles(id, css) {
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id;
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    function loadHTML() {
        if (!htmlPromise) {
            htmlPromise = fetch('fix-close-widget.html').then(r => r.text());
        }
        return htmlPromise;
    }

    function loadCSS() {
        if (cssLoaded) return Promise.resolve();
        return fetch('fix-close-widget.css')
            .then(r => r.text())
            .then(css => {
                injectStyles(STYLE_ID, css);
                cssLoaded = true;
            });
    }

    async function fixCloseWidget(selector, opts = {}) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) {
            console.error('fixCloseWidget: container not found', selector);
            return;
        }

        const [html] = await Promise.all([loadHTML(), loadCSS()]);

        el.innerHTML = '';
        el.classList.add('fix-close-widget');

        if (opts.width) el.style.width = opts.width + 'px';
        if (opts.height) el.style.height = opts.height + 'px';

        el.insertAdjacentHTML('afterbegin', html);

        const ticket = el.querySelector('.ticket');
        const toast = el.querySelector('.toast');
        const chat = el.querySelector('.chat');
        const fixedBubble = el.querySelector('.bubble.fixed');
        const cta = el.querySelector('.cta');
        const badge = el.querySelector('.badge');

        function launchConfetti() {
            const colors = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#4CAF50'];
            for (let i = 0; i < 16; i++) {
                const conf = document.createElement('div');
                conf.className = 'confetti';
                conf.style.background = colors[i % colors.length];
                conf.style.left = Math.random() * 100 + '%';
                conf.style.top = '-10px';
                conf.style.transform = `rotate(${Math.random() * 360}deg)`;
                conf.style.animation = `drop ${1.3 + Math.random() * 0.5}s linear forwards`;
                el.appendChild(conf);
                setTimeout(() => conf.remove(), 2400);
            }
        }

        const S = opts.speedMultiplier ? 1 / opts.speedMultiplier : 1;

        function reset() {
            ticket.style.transform = 'translateX(0)';
            ticket.classList.remove('resolved');
            toast.classList.remove('show');
            toast.style.right = '-260px';
            toast.style.opacity = 0;
            chat.style.opacity = 0;
            fixedBubble.style.opacity = 0;
            cta.style.opacity = 0;
            badge.style.opacity = 0;
        }

        function loop() {
            reset();
            ticket.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.06)' },
                { transform: 'scale(1)' }
            ], { duration: 1100 * S });
            setTimeout(() => {
                ticket.classList.add('resolved');
                ticket.style.transform = 'translateX(200%)';
            }, 1300 * S);
            setTimeout(() => { toast.classList.add('show'); }, 2400 * S);
            setTimeout(() => {
                toast.classList.remove('show');
                chat.style.opacity = 1;
            }, 3300 * S);
            setTimeout(() => {
                fixedBubble.style.opacity = 1;
                launchConfetti();
            }, 4300 * S);
            setTimeout(() => { cta.style.opacity = 1; }, 5400 * S);
            setTimeout(() => { chat.style.opacity = 0; }, 6900 * S);
            setTimeout(() => { badge.style.opacity = 1; }, 7500 * S);
            setTimeout(loop, 7600 * S);
        }
        loop();
    }

    global.fixCloseWidget = fixCloseWidget;

})(window);
