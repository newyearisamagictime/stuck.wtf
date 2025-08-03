/* =====================================================================
    * Stuck.wtf Widget Library v2.1  (enhanced timing & UX)
    * ---------------------------------------------------------------------
    *  ✓ copySaveWidget()      — animates "Copy & Save"
    *  ✓ reportIssueWidget()   — shopper clicks "Report a problem" in‑store
    *  ✓ triggerReportWidget() — dashboard trigger setup + shopper flow
    * ---------------------------------------------------------------------
    *  One JS include → self‑injecting scoped CSS; call widgetFn(selector,…)
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
     * 1) COPY‑SAVE WIDGET  (unchanged)
     * ======================================================================= */
    (function(){
        const STYLE_ID = 'copy-save-style';
        if (global.copySaveWidget) return; // already defined (keep previous impl)


        function copySaveWidget(selector, opts={}) {
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('copySaveWidget: container not found',selector);
            el.innerHTML='';
            el.classList.add('trigger-report-widget');
            if(opts.width) el.style.width=opts.width+'px';
            if(opts.height) el.style.height=opts.height+'px';

            const sceneCopy   = el.querySelector('.scene-copy');
            const sceneEditor = el.querySelector('.scene-editor');
            const copyBtn     = el.querySelector('.copy-btn');
            const copiedMsg   = el.querySelector('.copied-msg');
            const saveBtn     = el.querySelector('.save-btn');
            const savedMsg    = el.querySelector('.saved-msg');
            const typeSpan    = el.querySelector('.type-script');
            const tag         = '<script src="widget.js"></'+'script>';

            const T = opts.speedMultiplier ? 1/opts.speedMultiplier : 1; // slow‑down multiplier

            function reset(){
                sceneCopy.style.opacity=1;sceneEditor.style.opacity=0;
                copyBtn.classList.remove('clicked');saveBtn.classList.remove('clicked');
                copiedMsg.style.opacity=0;savedMsg.style.opacity=0;typeSpan.textContent='';
            }
            function loop(){
                reset();
                setTimeout(()=>{copyBtn.classList.add('clicked');copiedMsg.style.opacity=1;},1000*T);
                setTimeout(()=>{sceneCopy.style.opacity=0;sceneEditor.style.opacity=1;},2200*T);
                setTimeout(()=>{let i=0;const t=setInterval(()=>{typeSpan.textContent=tag.slice(0,i++);if(i>tag.length)clearInterval(t);},50*T);},2500*T);
                setTimeout(()=>{saveBtn.classList.add('clicked');savedMsg.style.opacity=1;},5200*T);
                setTimeout(()=>{sceneEditor.style.opacity=0;},6700*T);
                setTimeout(loop,8200*T);
            }
            loop();
        }
        global.copySaveWidget = copySaveWidget;
    })();

    /* ==========================================================================
     * 2) REPORT‑ISSUE WIDGET  (unchanged visual, slightly slower)
     * ======================================================================= */
    (function(){
        const STYLE_ID='report-issue-style';
        if (global.reportIssueWidget) return; // already defined


        function reportIssueWidget(selector,opts={}){
            const el=typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('reportIssueWidget: container not found',selector);
            el.innerHTML='';
            el.classList.add('report-issue-widget');
            if(opts.width) el.style.width=opts.width+'px';
            if(opts.height) el.style.height=opts.height+'px';


            const scenePage=el.querySelector('.scene-page');
            const sceneOverlay=el.querySelector('.scene-overlay');
            const reportBtn=el.querySelector('.report-btn');
            const sendBtn=el.querySelector('.send-btn');
            const sentMsg=el.querySelector('.sent-msg');
            const highlight=el.querySelector('.highlight');

            function reset(){
                scenePage.style.opacity=1;sceneOverlay.style.opacity=0;
                reportBtn.style.opacity=0;sendBtn.style.opacity=0;sentMsg.style.opacity=0;highlight.style.opacity=0;
                reportBtn.classList.remove('clicked');sendBtn.classList.remove('clicked');
            }
            function loop(){
                reset();
                setTimeout(()=>{reportBtn.style.opacity=1;},1000);
                setTimeout(()=>{reportBtn.classList.add('clicked');sceneOverlay.style.opacity=1;highlight.style.opacity=1;},2000);
                setTimeout(()=>{sendBtn.style.opacity=1;},2700);
                setTimeout(()=>{sendBtn.classList.add('clicked');sentMsg.style.opacity=1;highlight.style.opacity=0.3;},3500);
                setTimeout(()=>{sceneOverlay.style.opacity=0;},4700);
                setTimeout(()=>{scenePage.style.opacity=0;},5300);
                setTimeout(loop,6700);
            }
            loop();
        }
        global.reportIssueWidget = reportIssueWidget;
    })();

    /* ==========================================================================
     * 3) TRIGGER‑REPORT WIDGET  (improved as per feedback)
     * ======================================================================= */
    (function(){
        const STYLE_ID='trigger-report-style';
        const HTML_URL='trigger-report-widget.html';
        const CSS_URL='trigger-report-widget.css';
        let TEMPLATE_HTML=null;

        function loadAssets(){
            const cssPromise=document.getElementById(STYLE_ID)
                ? Promise.resolve()
                : fetch(CSS_URL).then(r=>r.text()).then(css=>injectStyles(STYLE_ID,css));
            const htmlPromise=TEMPLATE_HTML
                ? Promise.resolve()
                : fetch(HTML_URL).then(r=>r.text()).then(html=>{TEMPLATE_HTML=html;});
            return Promise.all([cssPromise, htmlPromise]);
        }

        function triggerReportWidget(selector, opts = {}) {
            const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!el) return console.error('triggerReportWidget: container not found', selector);

            loadAssets().then(async () => {
                el.innerHTML = '';
                el.classList.add('trigger-report-widget');
                if (opts.width) el.style.width = opts.width + 'px';
                if (opts.height) el.style.height = opts.height + 'px';

                /* ----- Build DOM ----- */
                el.insertAdjacentHTML('afterbegin', TEMPLATE_HTML);

                /* ----- Elements ----- */
                const dashboard = el.querySelector('.scene-dashboard');
                const store = el.querySelector('.scene-store');
                const scrollArea = el.querySelector('.scroll-area');
                const chk = el.querySelector('.highlight-item input');
                const timeWrap = el.querySelector('.time-input');
                const timeInput = timeWrap.querySelector('input');
                const badge = el.querySelector('.badge');
                const overlay = el.querySelector('.overlay');
                const highlight = el.querySelector('.highlight');
                const toolBar = el.querySelector('.tool-bar');
                const sendBtn = el.querySelector('.send-btn');
                const btnText = sendBtn.querySelector('.btn-text');
                const btnIcon = sendBtn.querySelector('.fas.fa-check');
                const sentMsg = el.querySelector('.sent-msg');

                const speed = opts.speedMultiplier ? 1 / opts.speedMultiplier : 1;
                const delay = ms => new Promise(res => setTimeout(res, ms * speed));

                /* ----- Helper functions ----- */
                function typeText(target, text) {
                    let idx = 0;
                    target.value = '';
                    const iv = setInterval(() => {
                        target.value += text[idx++];
                        if (idx > text.length - 1) clearInterval(iv);
                    }, 80 * speed);
                }

                function reset() {
                    [store, timeWrap, overlay, toolBar, sendBtn, sentMsg, highlight].forEach(el => el.style.opacity = 0);
                    dashboard.style.opacity = 1;
                    badge.classList.remove('show', 'clicked');
                    // Убираем инлайн стиль для right, чтобы CSS класс мог работать
                    badge.style.removeProperty('right');
                    sendBtn.classList.remove('clicked', 'success');
                    btnText.style.display = 'inline';
                    btnIcon.style.display = 'none';
                    chk.checked = false;
                    timeInput.value = '';
                }

                async function loop() {
                    reset();
                    await delay(700); // Scroll to highlight checkbox
                    scrollArea.scrollTop = 80;
                    await delay(700); // Check it
                    chk.checked = true;
                    await delay(400); // Show time input then type "1 min"
                    timeWrap.style.opacity = 1;
                    typeText(timeInput, '1 min');
                    await delay(1700); // Fade to store scene
                    dashboard.style.opacity = 0;
                    store.style.opacity = 1;
                    await delay(800); // Slide badge in
                    badge.classList.add('show');
                    await delay(900); // Click badge + overlay + toolbar
                    badge.classList.add('clicked');
                    overlay.style.opacity = 1;
                    highlight.style.opacity = 1;
                    toolBar.style.opacity = 1;
                    await delay(700); // Show send button
                    sendBtn.style.opacity = 1;
                    await delay(800); // Click send
                    sendBtn.classList.add('clicked', 'success');
                    btnText.style.display = 'none';
                    btnIcon.style.display = 'inline';
                    highlight.style.opacity = 0.35;
                    await delay(1800); // Fade overlay out
                    overlay.style.opacity = 0;
                    toolBar.style.opacity = 0;
                    await delay(600); // Fade widget out
                    store.style.opacity = 0;
                    await delay(1400); // Restart
                    loop();
                }
                loop();
            });
        }
        global.triggerReportWidget = triggerReportWidget;
    })();

})(window);

/* =====================================================================
 * Quick demo (remove in production)
 *
 * <div id="demo"></div>
 * <script src="widgetLib.js"><\/script>
* <script>
*   triggerReportWidget('#demo');
* <\/script>
* ===================================================================== */
