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
        const followBubble = el.querySelector('.bubble.dev.followup');
        const thanksBubble = el.querySelector('.bubble.thanks');
        const badge = el.querySelector('.badge');

        const COL_POS = [3, 36, 69];

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
            ticket.getAnimations().forEach(a => a.cancel());
            ticket.style.left = COL_POS[0] + '%';
            ticket.style.top = '44px';
            ticket.style.transform = 'scale(1)';
            ticket.classList.remove('progress', 'done');
            ticket.classList.add('backlog');
            toast.classList.remove('show');
            toast.style.right = '-260px';
            toast.style.opacity = 0;
            chat.style.opacity = 0;
            followBubble.style.opacity = 0;
            thanksBubble.style.opacity = 0;
            badge.style.opacity = 0;
        }

        function arc(from, to) {
            return ticket.animate([
                { left: from + '%', top: '44px' },
                { left: (from + to) / 2 + '%', top: '10px' },
                { left: to + '%', top: '44px' }
            ], { duration: 1200 * S, easing: 'ease-in-out', fill: 'forwards' }).finished;
        }

        function loop() {
            reset();
            ticket.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.06)' },
                { transform: 'scale(1)' }
            ], { duration: 1100 * S });
            setTimeout(() => {
                arc(COL_POS[0], COL_POS[1]).then(() => {
                    ticket.classList.remove('backlog');
                    ticket.classList.add('progress');
                    return arc(COL_POS[1], COL_POS[2]).then(() => {
                        ticket.classList.remove('progress');
                        ticket.classList.add('done');
                    });
                });
            }, 1300 * S);
            setTimeout(() => { toast.classList.add('show'); }, 3700 * S);
            setTimeout(() => {
                toast.classList.remove('show');
                chat.style.opacity = 1;
                badge.style.opacity = 0;
            }, 4600 * S);
            setTimeout(() => { followBubble.style.opacity = 1; }, 5700 * S);
            setTimeout(() => {
                thanksBubble.style.opacity = 1;
            }, 6200 * S);
            setTimeout(() => {
                launchConfetti();
            }, 6700 * S);
            setTimeout(() => { chat.style.opacity = 0; }, 8200 * S);
            setTimeout(() => { reset(); loop(); }, 8300 * S);
        }
        loop();
    }

    global.fixCloseWidget = fixCloseWidget;

})(window);
