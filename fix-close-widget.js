/* =====================================================================
 * Fix Close Widget - Ticket → done, toast, "All fixed!", confetti
 * ===================================================================== */

(function (global) {
    "use strict";

    const STYLE_ID = 'fix-close-style';

    function injectStyles(id, css) {
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id;
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    const CSS = `/* ===== Fix & Close ===== */
.fix-close-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',Consolas,monospace;}
.fix-close-widget{width:500px;height:200px;border:1px solid #d9d9d9;position:relative;overflow:hidden;background:#fff;border-radius:8px;}
/* Kanban board */
.fix-close-widget .board{display:flex;width:100%;height:100%;background:#fafafa;border-radius:6px;overflow:hidden;}
.fix-close-widget .col{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;border-right:1px dashed #ddd;}
.fix-close-widget .col:last-child{border-right:none;}
.fix-close-widget .col:nth-child(even){background:#f3f3f3;}
.fix-close-widget .col-title{font-size:11px;font-weight:600;color:#444;margin-top:6px;margin-bottom:8px;}
.fix-close-widget .ticket{width:78%;padding:6px 8px;background:#fff;border:1px solid #ccc;border-left:4px solid #f0ad4e;border-radius:4px;font-size:11px;box-shadow:0 2px 4px rgba(0,0,0,.05);position:absolute;top:44px;left:10%;transform:translateX(0);transition:transform .7s ease;}
.fix-close-widget .ticket.resolved{border-left-color:#28a745;}
/* Toast */
.fix-close-widget .toast{position:absolute;top:12px;right:-260px;width:240px;padding:8px 10px;background:#0069ed;color:#fff;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,.18);font-size:12px;display:flex;gap:6px;align-items:center;transition:right .5s ease,opacity .3s ease;opacity:0;z-index:3;}
.fix-close-widget .toast.show{right:12px;opacity:1;}
/* Chat panel */
.fix-close-widget .chat{position:absolute;inset:0;padding:14px 16px;background:#fff;display:flex;flex-direction:column;gap:8px;opacity:0;transition:opacity .5s ease;}
.fix-close-widget .bubble{max-width:78%;padding:4px 8px;border-radius:10px;font-size:11px;}
.fix-close-widget .bubble.user{background:#f1f1f1;align-self:flex-start;}
.fix-close-widget .bubble.dev{background:#0069ed;color:#fff;align-self:flex-end;}
.fix-close-widget .bubble.fixed{background:#28a745;color:#fff;align-self:center;font-weight:600;}
.fix-close-widget .cta{margin-top:auto;align-self:center;padding:6px 16px;background:#0069ed;color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;opacity:0;transition:opacity .3s ease;}
/* Confetti */
.fix-close-widget .confetti{position:absolute;width:6px;height:6px;border-radius:1px;opacity:0;}
@keyframes drop{to{transform:translateY(220px) rotate(720deg);opacity:1;}}
/* Response badge */
.fix-close-widget .badge{position:absolute;left:8px;bottom:8px;font-size:10px;background:rgba(0,0,0,.7);color:#fff;padding:2px 6px;border-radius:4px;opacity:0;transition:opacity .3s ease;}`;

    function fixCloseWidget(selector, opts = {}) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) {
            console.error('fixCloseWidget: container not found', selector);
            return;
        }

        injectStyles(STYLE_ID, CSS);
        el.innerHTML = '';
        el.classList.add('fix-close-widget');

        if (opts.width) el.style.width = opts.width + 'px';
        if (opts.height) el.style.height = opts.height + 'px';

        el.insertAdjacentHTML('afterbegin', `
        <div class="board">
          <div class="col col-backlog"><div class="col-title">Backlog</div></div>
          <div class="col col-progress"><div class="col-title">In Progress</div></div>
          <div class="col col-done"><div class="col-title">Done</div></div>
          <div class="ticket">#‑123 Checkout 500 error</div>
        </div>
        <div class="toast">🛠️ Bug patched & ticket closed</div>
        <div class="chat">
          <div class="bubble user">Hi, I'm stuck on payment 😕</div>
          <div class="bubble dev">Thanks! I'm on it.</div>
          <div class="bubble fixed">All fixed! 🎉</div>
          <button class="cta">Continue checkout</button>
        </div>
        <div class="badge">⏱️ Response time: 5m 12s</div>`);

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
