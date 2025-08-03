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

        const CSS = `/* ===== Action Report ===== */
.action-report-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',Consolas,monospace;}
.action-report-widget{width:500px;height:200px;border:1px solid #d9d9d9;position:relative;overflow:hidden;background:#fff;border-radius:8px;}
/* ----- Toast ----- */
.action-report-widget .toast{position:absolute;top:12px;right:-260px;width:240px;padding:8px 10px;background:#fff;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,.18);display:flex;gap:8px;align-items:center;transition:right .5s ease,opacity .3s ease;opacity:0;z-index:3;}
.action-report-widget .toast.show{right:12px;opacity:1;}
.action-report-widget .toast.synced{background:#28a745;color:#fff;}
.action-report-widget .toast .thumb{width:48px;height:32px;background:#e0e0e0;border-radius:4px;flex-shrink:0;}
.action-report-widget .toast .text{font-size:12px;line-height:1.1;display:flex;flex-direction:column;}
.action-report-widget .toast .title{font-weight:600;}
/* ----- Side panel ----- */
.action-report-widget .panel{position:absolute;top:0;right:-300px;width:260px;height:100%;background:#fff;box-shadow:-2px 0 8px rgba(0,0,0,.12);border-left:4px solid #0069ed;display:flex;flex-direction:column;padding:10px;gap:6px;transition:right .5s ease;z-index:2;}
.action-report-widget .panel.show{right:0;}
.action-report-widget .screenshot{width:100%;height:78px;background:#f0f0f0;border-radius:4px;}
/* Tabs */
.action-report-widget .tabs{display:flex;gap:6px;font-size:12px;margin-top:2px;}
.action-report-widget .tab{cursor:pointer;padding:2px 4px;}
.action-report-widget .tab.active{color:#0069ed;border-bottom:2px solid #0069ed;}
/* Console */
.action-report-widget .console{font-size:11px;background:#1e1e1e;color:#dcdcdc;padding:4px;border-radius:4px;height:38px;overflow:hidden;display:none;white-space:pre;line-height:1.3;}
.action-report-widget .console.active{display:block;}
.action-report-widget .console .error{color:#d9534f;}
/* Chat */
.action-report-widget .chat{display:none;flex-direction:column;gap:6px;font-size:11px;margin-top:4px;}
.action-report-widget .chat.show{display:flex;}
.action-report-widget .bubble{max-width:78%;padding:4px 8px;border-radius:10px;opacity:0;transition:opacity .3s ease;}
.action-report-widget .bubble.user{background:#f1f1f1;align-self:flex-start;}
.action-report-widget .bubble.dev{background:#0069ed;color:#fff;align-self:flex-end;}
.action-report-widget .bubble.show{opacity:1;}
/* Integrations (single Jira) */
.action-report-widget .integration-wrap{display:none;justify-content:center;margin-top:6px;}
.action-report-widget .integration-wrap.show{display:flex;}
.action-report-widget .integration{position:relative;width:32px;height:32px;border-radius:50%;background:#0052cc;display:flex;justify-content:center;align-items:center;transition:transform .25s ease;}
.action-report-widget .integration.bounce{transform:scale(1.15);}
.action-report-widget .integration img{width:60%;height:60%;}
.action-report-widget .integration::after{content:'✓';position:absolute;top:-6px;right:-6px;background:#28a745;color:#fff;font-size:11px;width:16px;height:16px;border-radius:50%;display:none;}
.action-report-widget .integration.success::after{display:block;}`;

        function actionReportWidget(selector, opts={}){
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('actionReportWidget: container not found',selector);
            injectStyles(STYLE_ID, CSS);
            el.innerHTML='';
            el.classList.add('action-report-widget');
            if(opts.width) el.style.width=opts.width+'px';
            if(opts.height) el.style.height=opts.height+'px';

            /* ----- Build DOM ----- */
            el.insertAdjacentHTML('afterbegin',`
        <div class="toast">
          <div class="thumb"></div>
          <div class="text"><span class="title">New bug report</span><span class="sub">Click to view</span></div>
        </div>
        <div class="panel">
          <div class="screenshot"></div>
          <div class="tabs"><span class="tab tab-scr active">Screenshot</span><span class="tab tab-con">Console</span><span class="tab tab-ses">Session</span></div>
          <pre class="console"><span class="error">GET /checkout 500 (Internal Server Error)</span></pre>
          <div class="chat">
            <div class="bubble user">Hi, I’m stuck on payment 😕</div>
            <div class="bubble dev">Thanks! I’m on it.</div>
          </div>
          <div class="integration-wrap">
            <div class="integration jira"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/jira.svg" alt="Jira"></div>
          </div>
        </div>`);

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

            /* Speed multiplier */
            const S = opts.speedMultiplier?1/opts.speedMultiplier:1;

            /* Reset */
            function reset(){
                toast.classList.remove('show','synced');toast.style.right='-260px';toast.style.opacity='0';toast.querySelector('.title').textContent='New bug report';toast.querySelector('.sub').textContent='Click to view';
                panel.classList.remove('show');
                scrTab.classList.add('active');conTab.classList.remove('active');consoleBox.classList.remove('active'); // we start in Screenshot tab
                chat.classList.remove('show');bubbles.forEach(b=>b.classList.remove('show'));
                integWrap.classList.remove('show');jiraIcon.classList.remove('bounce','success');
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
                setTimeout(()=>{chat.classList.add('show');bubbles[0].classList.add('show');},3400*S);
                setTimeout(()=>{bubbles[1].classList.add('show');},4200*S);
                /* 5) Show Jira icon with bounce */
                setTimeout(()=>{integWrap.classList.add('show');jiraIcon.classList.add('bounce','success');},5400*S);
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
