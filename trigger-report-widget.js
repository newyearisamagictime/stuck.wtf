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

            el.insertAdjacentHTML('afterbegin',`
        <div class="scene scene-copy">
          <div class="input-wrapper">
            <input class="code-input" readonly value="&lt;script src=&quot;widget.js&quot;&gt;&lt;/script&gt;" />
            <button class="copy-btn">Copy</button>
            <div class="copied-msg">✓ Copied</div>
          </div>
        </div>
        <div class="scene scene-editor">
          <div class="editor-window">
            <div class="titlebar">theme.html</div>
            <pre class="code">&lt;head&gt;\n  <span class="type-script"></span>\n&lt;/head&gt;\n&lt;body&gt;\n  ...\n&lt;/body&gt;</pre>
            <button class="save-btn">Save</button>
            <div class="saved-msg">✓ Saved</div>
          </div>
        </div>`);

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

            el.insertAdjacentHTML('afterbegin',`
        <div class="scene scene-page">
          <div class="page">
            <div class="line long"></div>
            <div class="line med"></div>
            <div class="line long"></div>
            <div class="line short"></div>
            <button class="report-btn">Report a problem</button>
          </div>
        </div>
        <div class="scene scene-overlay">
          <div class="overlay">
            <div class="highlight"></div>
            <button class="send-btn">Send</button>
            <div class="sent-msg">✓ Sent</div>
          </div>
        </div>`);

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

        function triggerReportWidget(selector, opts={}){
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('triggerReportWidget: container not found',selector);

            loadAssets().then(()=>{
                el.innerHTML='';
                el.classList.add('trigger-report-widget');
                if(opts.width) el.style.width=opts.width+'px';
                if(opts.height) el.style.height=opts.height+'px';

                /* ----- Build DOM ----- */
                el.insertAdjacentHTML('afterbegin',TEMPLATE_HTML);

                /* ----- Elements ----- */
                const dashboard   = el.querySelector('.scene-dashboard');
                const store       = el.querySelector('.scene-store');
                const scrollArea  = el.querySelector('.scroll-area');
                const chk         = el.querySelector('.highlight-item input');
                const timeWrap    = el.querySelector('.time-input');
                const timeInput   = timeWrap.querySelector('input');
                const badge       = el.querySelector('.badge');
                const overlay     = el.querySelector('.overlay');
                const highlight   = el.querySelector('.highlight');
                const toolBar     = el.querySelector('.tool-bar');
                const sendBtn     = el.querySelector('.send-btn');
                const btnText     = sendBtn.querySelector('.btn-text');
                const btnIcon     = sendBtn.querySelector('.fas.fa-check');
                const sentMsg     = el.querySelector('.sent-msg');

                const speed = opts.speedMultiplier?1/opts.speedMultiplier:1;

                /* ----- Helper functions ----- */
                function typeText(target, text, cb){
                    let idx=0;target.value='';
                    const iv=setInterval(()=>{target.value+=text[idx++];if(idx>text.length-1){clearInterval(iv);if(cb)cb();}},80*speed);
                }

                function reset(){
                    dashboard.style.opacity=1;store.style.opacity=0;
                    timeWrap.style.opacity=0;
                    badge.classList.remove('show','clicked');
                    // Убираем инлайн стиль для right, чтобы CSS класс мог работать
                    badge.style.removeProperty('right');
                    overlay.style.opacity=0;
                    toolBar.style.opacity=0;
                    sendBtn.style.opacity=0;
                    sendBtn.classList.remove('clicked','success');
                    btnText.style.display='inline';
                    btnIcon.style.display='none';
                    sentMsg.style.opacity=0;
                    highlight.style.opacity=0;
                    chk.checked=false;
                    timeInput.value='';
                }

                function loop(){
                    reset();
                    // Scroll to highlight checkbox
                    setTimeout(()=>{scrollArea.scrollTop=80;},700*speed);
                    // Check it
                    setTimeout(()=>{chk.checked=true;},1400*speed);
                    // Show time input then type "1 min"
                    setTimeout(()=>{timeWrap.style.opacity=1;typeText(timeInput,'1 min');},1800*speed);
                    // Fade to store scene
                    setTimeout(()=>{dashboard.style.opacity=0;store.style.opacity=1;},3500*speed);
                    // Slide badge in - используем класс вместо инлайн стиля
                    setTimeout(()=>{badge.classList.add('show');},4300*speed);
                    // Click badge + overlay + toolbar
                    setTimeout(()=>{badge.classList.add('clicked');overlay.style.opacity=1;highlight.style.opacity=1;toolBar.style.opacity=1;},5200*speed);
                    // Show send button
                    setTimeout(()=>{sendBtn.style.opacity=1;},5900*speed);
                    // Click send - изменяем кнопку на зеленую с галочкой
                    setTimeout(()=>{
                        sendBtn.classList.add('clicked','success');
                        btnText.style.display='none';
                        btnIcon.style.display='inline';
                        highlight.style.opacity=0.35;
                    },6700*speed);
                    // Fade overlay out
                    setTimeout(()=>{overlay.style.opacity=0;toolBar.style.opacity=0;},8500*speed);
                    // Fade widget out
                    setTimeout(()=>{store.style.opacity=0;},9100*speed);
                    // Restart
                    setTimeout(loop,10500*speed);
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
