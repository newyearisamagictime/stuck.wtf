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
                const toast        = el.querySelector('.toast');
                const panel        = el.querySelector('.panel');
                const scrTab       = el.querySelector('.tab-scr');
                const conTab       = el.querySelector('.tab-con');
                const consoleBox   = el.querySelector('.console');
                const chat         = el.querySelector('.chat');
                const bubbles      = Array.from(el.querySelectorAll('.bubble'));
                const integWrap    = el.querySelector('.integration-wrap');
                const jiraIcon     = integWrap.querySelector('.integration');
                const content      = el.querySelector('.content');

                /* Speed multiplier */
                const S = opts.speedMultiplier?1/opts.speedMultiplier:1;

                /* Reset */
                function reset(){
                    toast.classList.remove('show','synced');toast.style.right='-260px';toast.style.opacity='0';toast.querySelector('.title').textContent='New bug report';toast.querySelector('.sub').textContent='Click to view';
                    panel.classList.remove('show');
                    scrTab.classList.add('active');conTab.classList.remove('active');consoleBox.classList.remove('active'); // we start in Screenshot tab
                    chat.classList.remove('show');bubbles.forEach(b=>b.classList.remove('show'));
                    integWrap.classList.remove('show');jiraIcon.classList.remove('bounce','success');
                    if(content) content.scrollTop = 0;
                }

                /* Loop sequence */
                function loop(){
                    reset();
                    /* 1) Toast slides in */
                    setTimeout(()=>{toast.classList.add('show');},600*S);
                    /* 2) Open panel */
                    setTimeout(()=>{toast.classList.remove('show');panel.classList.add('show');},2000*S);
                    /* 3) Switch to console tab (error already present) */
                    setTimeout(()=>{
                        scrTab.classList.remove('active');conTab.classList.add('active');consoleBox.classList.add('active');
                    },2600*S);
                    /* 4) Show chat bubbles staggered */
                    setTimeout(()=>{chat.classList.add('show');bubbles[0].classList.add('show');if(content) content.scrollTop = content.scrollHeight;},3400*S);
                    setTimeout(()=>{bubbles[1].classList.add('show');if(content) content.scrollTop = content.scrollHeight;},4200*S);
                    /* 5) Show Jira icon with bounce */
                    setTimeout(()=>{integWrap.classList.add('show');jiraIcon.classList.add('bounce','success');if(content) content.scrollTop = content.scrollHeight;},5400*S);
                    /* 6) Close panel */
                    setTimeout(()=>{panel.classList.remove('show');},6800*S);
                    /* 7) Toast synced */
                    setTimeout(()=>{
                        toast.querySelector('.title').textContent='Report synced';toast.querySelector('.sub').textContent='';toast.classList.add('synced','show');
                    },7200*S);
                    /* 8) Toast slide out */
                    setTimeout(()=>{toast.classList.remove('show');},8400*S);
                    /* 9) Immediate restart */
                    setTimeout(loop,8500*S);
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
