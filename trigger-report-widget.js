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

        const CSS = `/* ===== Copy Save ===== */
.trigger-report-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans', sans-serif;}
.trigger-report-widget{width:500px;height:200px;border:1px solid #e2e8f0;position:relative;overflow:hidden;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);}
.trigger-report-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
.trigger-report-widget .scene-editor,.trigger-report-widget .copied-msg,.trigger-report-widget .saved-msg{opacity:0;}
.trigger-report-widget .input-wrapper{display:flex;align-items:center;gap:12px;}
.trigger-report-widget .code-input{width:300px;padding:10px 12px;border:1px solid #cbd5e1;background:#f8fafc;font-size:13px;border-radius:8px;color:#334155;font-family:'Noto Sans', sans-serif;transition:border-color .2s ease;}
.trigger-report-widget .code-input:focus{outline:none;border-color:#c90f0f;box-shadow:0 0 0 3px rgb(201 15 15 / 0.1);}
.trigger-report-widget .copy-btn,.trigger-report-widget .save-btn{padding:10px 16px;border:none;border-radius:8px;background:#c90f0f;color:#ffffff;cursor:pointer;transition:all .2s ease;font-weight:500;font-size:13px;font-family:'Noto Sans', sans-serif;}
.trigger-report-widget .copy-btn:hover,.trigger-report-widget .save-btn:hover{background:#b10e0e;transform:translateY(-1px);box-shadow:0 4px 12px rgb(201 15 15 / 0.4);}
.trigger-report-widget .copy-btn.clicked,.trigger-report-widget .save-btn.clicked{transform:scale(0.95);box-shadow:0 2px 8px rgb(201 15 15 / 0.3);}
.trigger-report-widget .copied-msg,.trigger-report-widget .saved-msg{margin-left:8px;color:#16a34a;font-weight:600;transition:opacity .3s ease;user-select:none;font-size:13px;}
.trigger-report-widget .editor-window{width:90%;height:80%;background:#1e293b;color:#e2e8f0;border-radius:12px;padding:16px;position:relative;display:flex;flex-direction:column;box-shadow:0 10px 25px rgb(0 0 0 / 0.3);}
.trigger-report-widget .titlebar{background:#374151;padding:8px 12px;margin:-16px -16px 12px;font-size:13px;color:#f1f5f9;border-top-left-radius:12px;border-top-right-radius:12px;font-weight:500;}
.trigger-report-widget .code{flex:1;font-size:13px;line-height:1.4;white-space:pre;overflow:hidden;color:#e2e8f0;}
.trigger-report-widget .type-script{border-right:2px solid #c90f0f;color:#c90f0f;font-weight:600;}
.trigger-report-widget .save-btn{position:absolute;bottom:12px;right:12px;}
.trigger-report-widget .saved-msg{position:absolute;bottom:16px;right:120px;}`;

        function copySaveWidget(selector, opts={}) {
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('copySaveWidget: container not found',selector);
            injectStyles(STYLE_ID, CSS);
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

        const CSS=`/* ===== Report Issue ===== */
.report-issue-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans', sans-serif;}
.report-issue-widget{width:500px;height:200px;border:1px solid #e2e8f0;position:relative;overflow:hidden;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);}
.report-issue-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
.report-issue-widget .scene-overlay,.report-issue-widget .report-btn,.report-issue-widget .send-btn,.report-issue-widget .sent-msg{opacity:0;}
.report-issue-widget .page{width:90%;height:80%;border:1px solid #e2e8f0;background:#f8fafc;padding:16px;position:relative;display:flex;flex-direction:column;gap:8px;border-radius:8px;}
.report-issue-widget .line{height:12px;background:#cbd5e1;border-radius:6px;}
.report-issue-widget .line.short{width:45%;}
.report-issue-widget .line.med{width:65%;}
.report-issue-widget .line.long{width:85%;}
.report-issue-widget .report-btn{position:absolute;bottom:12px;right:12px;padding:8px 16px;border:none;border-radius:8px;background:#c90f0f;color:#ffffff;cursor:pointer;transition:all .2s ease;font-weight:500;font-size:13px;font-family:'Noto Sans', sans-serif;}
.report-issue-widget .report-btn:hover{background:#b10e0e;transform:translateY(-1px);box-shadow:0 4px 12px rgb(201 15 15 / 0.4);}
.report-issue-widget .report-btn.clicked{transform:scale(0.95);box-shadow:0 2px 8px rgb(201 15 15 / 0.3);}
.report-issue-widget .overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;justify-content:center;align-items:center;}
.report-issue-widget .highlight{width:60%;height:40%;border:2px dashed #f59e0b;background:rgba(245,158,11,.15);border-radius:8px;}
.report-issue-widget .send-btn{margin-top:16px;padding:10px 20px;border:none;border-radius:8px;background:#c90f0f;color:#ffffff;cursor:pointer;transition:all .2s ease;font-weight:500;font-size:13px;font-family:'Noto Sans', sans-serif;}
.report-issue-widget .send-btn:hover{background:#b10e0e;transform:translateY(-1px);box-shadow:0 4px 12px rgb(201 15 15 / 0.4);}
.report-issue-widget .send-btn.clicked{transform:scale(0.95);box-shadow:0 2px 8px rgb(201 15 15 / 0.3);}
.report-issue-widget .sent-msg{margin-top:12px;color:#16a34a;font-weight:600;background:#ffffff;padding:6px 12px;border-radius:8px;transition:opacity .3s ease;user-select:none;font-size:13px;box-shadow:0 2px 4px rgb(0 0 0 / 0.1);}`;

        function reportIssueWidget(selector,opts={}){
            const el=typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('reportIssueWidget: container not found',selector);
            injectStyles(STYLE_ID,CSS);
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

        const CSS=`/* ===== Trigger + Report Scene ===== */
.trigger-report-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans', sans-serif;}
.trigger-report-widget{width:500px;height:200px;border:1px solid #e2e8f0;position:relative;overflow:hidden;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);}
.trigger-report-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
/* ----- Dashboard card ----- */
.trigger-report-widget .checkbox-card{width:94%;height:84%;border:1px solid #e2e8f0;background:#f8fafc;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;position:relative;}
.trigger-report-widget .scroll-area{flex:1;overflow-y:auto;padding-right:4px;}
.trigger-report-widget .trigger-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#334155;padding:6px 0;}
.trigger-report-widget .trigger-item input{accent-color:#c90f0f;cursor:pointer;}
.trigger-report-widget .time-input{display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-left:12px;opacity:0;transition:opacity .3s ease;}
.trigger-report-widget .time-input input{width:60px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:6px;text-align:center;font-size:13px;background:#ffffff;}
/* ----- Store page mock ----- */
.trigger-report-widget .page-mock{width:92%;height:84%;border:1px solid #e2e8f0;background:#ffffff;padding:16px;position:relative;display:flex;flex-direction:column;gap:10px;border-radius:12px;}
.trigger-report-widget .product{display:flex;gap:10px;align-items:center;}
.trigger-report-widget .thumb{width:30px;height:30px;background:#cbd5e1;border-radius:6px;}
.trigger-report-widget .product-info{flex:1;height:10px;background:#cbd5e1;border-radius:6px;}
.trigger-report-widget .total{height:12px;background:#cbd5e1;width:60%;border-radius:6px;}
.trigger-report-widget .field{height:14px;background:#cbd5e1;border-radius:6px;position:relative;}
.trigger-report-widget .field.error{background:#fecaca;border:1px solid #ef4444;}
.trigger-report-widget .error-msg{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);font-size:14px;color:#ef4444;font-weight:600;background:#ffffff;padding:8px 16px;border-radius:8px;box-shadow:0 2px 8px rgba(239, 68, 68, 0.2);z-index:5;}
/* ----- Report badge (вертикальная кнопка) ----- */
.trigger-report-widget .badge{position:absolute;top:50%;right:-80px;transform:translateY(-50%);padding:12px 6px;border:none;border-radius:8px 0 0 8px;background:#c90f0f;color:#ffffff;font-size:14px;cursor:pointer;transition:all .4s ease;font-weight:600;font-family:'Noto Sans', sans-serif;writing-mode:vertical-lr;text-orientation:mixed;box-shadow:-2px 0 10px rgba(0,0,0,0.1);}
.trigger-report-widget .badge.show{right:0;}
.trigger-report-widget .badge.clicked{transform:translateY(-50%) scale(0.95);box-shadow:0 2px 8px rgb(201 15 15 / 0.3);}
.trigger-report-widget .badge:hover{background:#b10e0e;transform:translateY(-50%) translateX(-3px);}
/* ----- Overlay & toolbar ----- */
.trigger-report-widget .overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;justify-content:center;align-items:center;opacity:0;transition:opacity .4s ease;z-index:10;}
.trigger-report-widget .highlight{width:70%;height:44%;border:2px dashed #f59e0b;background:rgba(245,158,11,.15);border-radius:8px;}
.trigger-report-widget .tool-bar{display:flex;gap:10px;margin-top:12px;opacity:0;transition:opacity .3s ease;}
.trigger-report-widget .tool-icon{width:28px;height:28px;border-radius:6px;background:#ffffff;display:flex;justify-content:center;align-items:center;font-size:14px;color:#c90f0f;box-shadow:0 2px 4px rgb(0 0 0 / 0.1);cursor:pointer;transition:all 0.2s ease;}
.trigger-report-widget .tool-icon:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgb(0 0 0 / 0.15);}
.trigger-report-widget .send-btn{margin-top:16px;padding:10px 20px;border:none;border-radius:8px;background:#c90f0f;color:#ffffff;font-size:13px;cursor:pointer;transition:all .3s ease;opacity:0;font-weight:500;font-family:'Noto Sans', sans-serif;display:flex;align-items:center;gap:6px;}
.trigger-report-widget .send-btn:hover{background:#b10e0e;transform:translateY(-1px);box-shadow:0 4px 12px rgb(201 15 15 / 0.4);}
.trigger-report-widget .send-btn.clicked{background:#16a34a;transform:scale(0.95);box-shadow:0 2px 8px rgb(22 163 74 / 0.3);}
.trigger-report-widget .send-btn.success{background:#16a34a;}
.trigger-report-widget .sent-msg{display:none;}`;

        function triggerReportWidget(selector, opts={}){
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('triggerReportWidget: container not found',selector);

            injectStyles(STYLE_ID,CSS);
            el.innerHTML='';
            el.classList.add('trigger-report-widget');
            if(opts.width) el.style.width=opts.width+'px';
            if(opts.height) el.style.height=opts.height+'px';

            /* ----- Build DOM ----- */
            el.insertAdjacentHTML('afterbegin',`
        <div class="scene scene-dashboard">
          <div class="checkbox-card">
            <div class="scroll-area">
              <label class="trigger-item"><input type="checkbox"> Checkout errors</label>
              <label class="trigger-item"><input type="checkbox"> 404 pages</label>
              <label class="trigger-item"><input type="checkbox"> Custom events</label>
              <label class="trigger-item highlight-item"><input type="checkbox"> Too long on one page
                <span class="time-input">Time: <input type="text" value=""></span>
              </label>
              <label class="trigger-item"><input type="checkbox"> Unusual number of clicks</label>
            </div>
          </div>
        </div>
        <div class="scene scene-store">
          <div class="page-mock">
            <div class="product"><div class="thumb"></div><div class="product-info"></div></div>
            <div class="product"><div class="thumb"></div><div class="product-info"></div></div>
            <div class="total"></div>
            <div class="field"></div>
            <div class="field error"></div>
            <div class="error-msg">Internal server error</div>
            <div class="field"></div>
            <button class="badge">Report a problem</button>
            <div class="overlay">
              <div class="highlight"></div>
              <div class="tool-bar">
                <div class="tool-icon"><i class="fas fa-pencil-alt"></i></div>
                <div class="tool-icon"><i class="far fa-square"></i></div>
                <div class="tool-icon"><i class="fas fa-highlighter"></i></div>
                <div class="tool-icon"><i class="fas fa-arrow-right"></i></div>
              </div>
              <button class="send-btn"><span class="btn-text">Send</span><i class="fas fa-check" style="display:none;"></i></button>
              <div class="sent-msg">✓ Sent</div>
            </div>
          </div>
        </div>`);

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
