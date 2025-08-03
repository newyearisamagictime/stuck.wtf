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
.action-report-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans', sans-serif;}
.action-report-widget{width:500px;height:200px;border:1px solid #e2e8f0;position:relative;overflow:hidden;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);}
/* ----- Toast ----- */
.action-report-widget .toast{position:absolute;top:12px;right:-260px;width:240px;padding:12px 14px;background:#ffffff;border-radius:10px;box-shadow:0 10px 25px rgb(0 0 0 / 0.15);display:flex;gap:10px;align-items:center;transition:right .5s ease,opacity .3s ease;opacity:0;z-index:3;border:1px solid #e2e8f0;}
.action-report-widget .toast.show{right:12px;opacity:1;}
.action-report-widget .toast.synced{background:#16a34a;color:#ffffff;border-color:#16a34a;}
.action-report-widget .toast .thumb{width:48px;height:32px;background:#cbd5e1;border-radius:6px;flex-shrink:0;}
.action-report-widget .toast .text{font-size:13px;line-height:1.3;display:flex;flex-direction:column;}
.action-report-widget .toast .title{font-weight:600;color:#334155;}
.action-report-widget .toast.synced .title{color:#ffffff;}
/* ----- Side panel ----- */
.action-report-widget .panel{position:absolute;top:0;right:-300px;width:260px;height:100%;background:#ffffff;box-shadow:-4px 0 15px rgb(0 0 0 / 0.15);border-left:4px solid #c90f0f;display:flex;flex-direction:column;padding:16px;gap:10px;transition:right .5s ease;z-index:2;}
.action-report-widget .panel.show{right:0;}
.action-report-widget .screenshot{width:100%;height:78px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;}
/* Tabs */
.action-report-widget .tabs{display:flex;gap:8px;font-size:13px;margin-top:4px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;}
.action-report-widget .tab{cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .2s ease;color:#64748b;font-weight:500;}
.action-report-widget .tab:hover{background:#f1f5f9;color:#334155;}
.action-report-widget .tab.active{color:#c90f0f;background:#fef2f2;border-bottom:2px solid #c90f0f;}
/* Console */
.action-report-widget .console{font-size:12px;background:#1e293b;color:#e2e8f0;padding:8px;border-radius:8px;height:38px;overflow:hidden;display:none;white-space:pre;line-height:1.4;font-family:'Fira Code', 'Consolas', monospace;}
.action-report-widget .console.active{display:block;}
.action-report-widget .console .error{color:#f87171;}
/* Chat */
.action-report-widget .chat{display:none;flex-direction:column;gap:8px;font-size:12px;margin-top:6px;}
.action-report-widget .chat.show{display:flex;}
.action-report-widget .bubble{max-width:78%;padding:8px 12px;border-radius:12px;opacity:0;transition:opacity .3s ease;font-size:12px;line-height:1.4;}
.action-report-widget .bubble.user{background:#f1f5f9;color:#334155;align-self:flex-start;border:1px solid #e2e8f0;}
.action-report-widget .bubble.dev{background:#c90f0f;color:#ffffff;align-self:flex-end;}
.action-report-widget .bubble.show{opacity:1;}
/* Integrations (single Jira) */
.action-report-widget .integration-wrap{display:none;justify-content:center;margin-top:8px;}
.action-report-widget .integration-wrap.show{display:flex;}
.action-report-widget .integration{position:relative;width:36px;height:36px;border-radius:50%;background:#0052cc;display:flex;justify-content:center;align-items:center;transition:transform .25s ease;box-shadow:0 4px 12px rgb(0 82 204 / 0.3);}
.action-report-widget .integration.bounce{transform:scale(1.15);}
.action-report-widget .integration img{width:60%;height:60%;}
.action-report-widget .integration::after{content:'✓';position:absolute;top:-6px;right:-6px;background:#16a34a;color:#ffffff;font-size:11px;width:18px;height:18px;border-radius:50%;display:none;font-weight:600;box-shadow:0 2px 4px rgb(0 0 0 / 0.2);}
.action-report-widget .integration.success::after{display:flex;align-items:center;justify-content:center;}`;

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
