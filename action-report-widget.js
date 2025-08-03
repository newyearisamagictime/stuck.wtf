/* =====================================================================
     * Stuck.wtf Widget Library v2.3  (Action‑Report tweaks based on feedback)
     * ---------------------------------------------------------------------
     *  ✓ copySaveWidget()      — "Copy & Save"
     *  ✓ reportIssueWidget()   — shopper flow «Report a problem»
     *  ✓ triggerReportWidget() — dashboard trigger + shopper flow
     *  ✓ actionReportWidget()  — toast → side‑panel with console, chat, Jira push
     * ---------------------------------------------------------------------
     *  One JS include → each widget injects its own scoped CSS (<style id="…">)
     *  Call widgetFn(selector, { width, height, speedMultiplier })
     * ===================================================================== */

(function (global) {
    "use strict";

    /* ========== UTILITIES ===================================================== */
    function injectStyles(id, css) {
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id;
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    /* ==========================================================================
     * PREVIOUS WIDGETS (v2.1) preserved — not repeated here for brevity
     * They are assumed already attached on the page.
     * ======================================================================= */

    /* ==========================================================================
     * ACTION‑REPORT WIDGET  (toast → panel)  – updated v2.3
     * ======================================================================= */
    (function(){
        const STYLE_ID = 'action-report-style';
        let htmlCache = null;
        let cssCache = null;

        async function actionReportWidget(selector, opts={}){
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('actionReportWidget: container not found',selector);

            const htmlPath = opts.htmlPath || 'action-report-widget.html';
            const cssPath = opts.cssPath || 'action-report-widget.css';

            try {
                if(!htmlCache || !cssCache){
                    const [css, html] = await Promise.all([
                        fetch(cssPath).then(r=>r.text()),
                        fetch(htmlPath).then(r=>r.text())
                    ]);
                    cssCache = css;
                    htmlCache = html;
                }

                injectStyles(STYLE_ID, cssCache);
                el.innerHTML='';
                el.classList.add('action-report-widget');
                if(opts.width) el.style.width=opts.width+'px';
                if(opts.height) el.style.height=opts.height+'px';

                /* ----- Build DOM ----- */
                el.insertAdjacentHTML('afterbegin', htmlCache);

                /* Elements refs */
                const screenshot   = el.querySelector('.screenshot');
                const scrTab       = el.querySelector('.tab-scr');
                const conTab       = el.querySelector('.tab-con');
                const chatTab      = el.querySelector('.tab-chat');
                const consoleBox   = el.querySelector('.console');
                const chat         = el.querySelector('.chat');
                const bubbles      = Array.from(el.querySelectorAll('.bubble'));
                const content      = el.querySelector('.content');

                /* Speed multiplier */
                const S = opts.speedMultiplier?1/opts.speedMultiplier:1;

                /* Reset */
                function reset(){
                    scrTab.classList.add('active');
                    conTab.classList.remove('active');
                    chatTab.classList.remove('active');
                    screenshot.style.display='flex';
                    consoleBox.classList.remove('active');
                    chat.classList.remove('show');
                    bubbles.forEach(b=>b.classList.remove('show'));
                    if(content) content.scrollTop = 0;
                }

                /* Loop sequence */
                function loop(){
                    reset();
                    /* 1) show screenshot for a moment */
                    setTimeout(()=>{
                        scrTab.classList.remove('active');
                        conTab.classList.add('active');
                        screenshot.style.display='none';
                        consoleBox.classList.add('active');
                    },2000*S);
                    /* 2) switch to chat tab */
                    setTimeout(()=>{
                        conTab.classList.remove('active');
                        chatTab.classList.add('active');
                        consoleBox.classList.remove('active');
                        chat.classList.add('show');
                        bubbles[0].classList.add('show');
                        if(content) content.scrollTop = content.scrollHeight;
                        setTimeout(()=>{bubbles[1].classList.add('show');if(content) content.scrollTop = content.scrollHeight;},800*S);
                    },4000*S);
                    /* 3) restart */
                    setTimeout(loop,8000*S);
                }
                loop();
            } catch (e) {
                console.error('actionReportWidget:', e);
            }
        }
        global.actionReportWidget = actionReportWidget;
    })();

})(window);

/* =====================================================================
 * Quick demo (remove in production)
 * <div id="demo"></div>
 * <script src="widgetLib.js"><\/script>
* <script>
*   actionReportWidget('#demo', { width: 540, height: 220 });
* <\/script>
* ===================================================================== */
