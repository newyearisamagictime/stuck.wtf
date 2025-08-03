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
.copy-save-widget *{box-sizing:border-box;margin:0;padding:0;font-family:Consolas,monospace;}
.copy-save-widget{width:500px;height:200px;border:1px solid #d9d9d9;position:relative;overflow:hidden;background:#fff;border-radius:8px;}
.copy-save-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
.copy-save-widget .scene-editor,.copy-save-widget .copied-msg,.copy-save-widget .saved-msg{opacity:0;}
.copy-save-widget .input-wrapper{display:flex;align-items:center;gap:8px;}
.copy-save-widget .code-input{width:300px;padding:6px 8px;border:1px solid #ccc;background:#fafafa;font-size:12px;border-radius:4px;}
.copy-save-widget .copy-btn,.copy-save-widget .save-btn{padding:6px 14px;border:none;border-radius:4px;background:#0069ed;color:#fff;cursor:pointer;transition:transform .1s ease;}
.copy-save-widget .copy-btn.clicked,.copy-save-widget .save-btn.clicked{transform:scale(0.9);}
.copy-save-widget .copied-msg,.copy-save-widget .saved-msg{margin-left:8px;color:#28a745;font-weight:600;transition:opacity .3s ease;user-select:none;}
.copy-save-widget .editor-window{width:90%;height:80%;background:#1e1e1e;color:#dcdcdc;border-radius:6px;padding:12px;position:relative;display:flex;flex-direction:column;}
.copy-save-widget .titlebar{background:#333;padding:4px 10px;margin:-12px -12px 10px;font-size:12px;color:#fff;border-top-left-radius:6px;border-top-right-radius:6px;}
.copy-save-widget .code{flex:1;font-size:12px;line-height:1.2;white-space:pre;overflow:hidden;}
.copy-save-widget .type-script{border-right:1px solid #dcdcdc;}
.copy-save-widget .save-btn{position:absolute;bottom:10px;right:10px;}
.copy-save-widget .saved-msg{position:absolute;bottom:14px;right:110px;}`;

        function copySaveWidget(selector, opts={}) {
            const el = typeof selector==='string'?document.querySelector(selector):selector;
            if(!el) return console.error('copySaveWidget: container not found',selector);
            injectStyles(STYLE_ID, CSS);
            el.innerHTML='';
            el.classList.add('copy-save-widget');
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
.report-issue-widget *{box-sizing:border-box;margin:0;padding:0;font-family:Consolas,monospace;}
.report-issue-widget{width:500px;height:200px;border:1px solid #d9d9d9;position:relative;overflow:hidden;background:#fff;border-radius:8px;}
.report-issue-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
.report-issue-widget .scene-overlay,.report-issue-widget .report-btn,.report-issue-widget .send-btn,.report-issue-widget .sent-msg{opacity:0;}
.report-issue-widget .page{width:90%;height:80%;border:1px solid #e6e6e6;background:#f7f7f7;padding:12px;position:relative;display:flex;flex-direction:column;gap:6px;}
.report-issue-widget .line{height:10px;background:#e0e0e0;border-radius:4px;}
.report-issue-widget .line.short{width:45%;}
.report-issue-widget .line.med{width:65%;}
.report-issue-widget .line.long{width:85%;}
.report-issue-widget .report-btn{position:absolute;bottom:10px;right:10px;padding:6px 12px;border:none;border-radius:4px;background:#d9534f;color:#fff;cursor:pointer;transition:transform .1s ease;}
.report-issue-widget .report-btn.clicked{transform:scale(0.9);}
.report-issue-widget .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;flex-direction:column;justify-content:center;align-items:center;}
.report-issue-widget .highlight{width:60%;height:40%;border:2px dashed #ffbf00;background:rgba(255,191,0,.15);}
.report-issue-widget .send-btn{margin-top:14px;padding:6px 16px;border:none;border-radius:4px;background:#0069ed;color:#fff;cursor:pointer;transition:transform .1s ease;}
.report-issue-widget .send-btn.clicked{transform:scale(0.9);}
.report-issue-widget .sent-msg{margin-top:12px;color:#28a745;font-weight:600;background:#fff;padding:2px 6px;border-radius:4px;transition:opacity .3s ease;user-select:none;}`;

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
.trigger-report-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',Consolas,monospace;}
.trigger-report-widget{width:500px;height:200px;border:1px solid #d9d9d9;position:relative;overflow:hidden;background:#fff;border-radius:8px;}
.trigger-report-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
/* ----- Dashboard card ----- */
.trigger-report-widget .checkbox-card{width:94%;height:84%;border:1px solid #e0e0e0;background:#fafafa;border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:8px;position:relative;}
.trigger-report-widget .scroll-area{flex:1;overflow-y:auto;padding-right:4px;}
.trigger-report-widget .trigger-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#333;padding:4px 0;}
.trigger-report-widget .trigger-item input{accent-color:#0069ed;cursor:pointer;}
.trigger-report-widget .time-input{display:inline-flex;align-items:center;gap:4px;font-size:12px;margin-left:8px;opacity:0;transition:opacity .3s ease;}
.trigger-report-widget .time-input input{width:50px;padding:2px 4px;border:1px solid #ccc;border-radius:4px;text-align:center;font-size:12px;}
/* ----- Store page mock ----- */
.trigger-report-widget .page-mock{width:92%;height:84%;border:1px solid #e6e6e6;background:#fff;padding:14px 16px;position:relative;display:flex;flex-direction:column;gap:8px;}
.trigger-report-widget .product{display:flex;gap:8px;align-items:center;}
.trigger-report-widget .thumb{width:26px;height:26px;background:#e0e0e0;border-radius:4px;}
.trigger-report-widget .product-info{flex:1;height:8px;background:#e0e0e0;border-radius:4px;}
.trigger-report-widget .total{height:10px;background:#e0e0e0;width:60%;border-radius:4px;}
.trigger-report-widget .field{height:12px;background:#e0e0e0;border-radius:4px;position:relative;}
.trigger-report-widget .field.error{background:#fbd6d6;border:1px solid #d9534f;}
.trigger-report-widget .error-msg{position:absolute;left:0;bottom:-16px;font-size:11px;color:#d9534f;}
/* ----- Report badge ----- */
.trigger-report-widget .badge{position:absolute;top:40%;right:-80px;padding:8px 14px;border:none;border-radius:4px 0 0 4px;background:#d9534f;color:#fff;font-size:11px;cursor:pointer;transition:right .4s ease,transform .1s ease;}
.trigger-report-widget .badge.show{right:0;}
.trigger-report-widget .badge.clicked{transform:scale(0.92);}
/* ----- Overlay & toolbar ----- */
.trigger-report-widget .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;flex-direction:column;justify-content:center;align-items:center;opacity:0;transition:opacity .4s ease;}
.trigger-report-widget .highlight{width:70%;height:44%;border:2px dashed #ffbf00;background:rgba(255,191,0,.15);}
.trigger-report-widget .tool-bar{display:flex;gap:8px;margin-top:10px;opacity:0;transition:opacity .3s ease;}
.trigger-report-widget .tool-icon{width:18px;height:18px;border-radius:3px;background:#fff;display:flex;justify-content:center;align-items:center;font-size:12px;color:#0069ed;}
.trigger-report-widget .send-btn{margin-top:12px;padding:6px 18px;border:none;border-radius:4px;background:#0069ed;color:#fff;font-size:12px;cursor:pointer;transition:transform .1s ease;opacity:0;}
.trigger-report-widget .send-btn.clicked{transform:scale(0.9);}
.trigger-report-widget .sent-msg{margin-top:10px;background:#28a745;color:#fff;font-weight:600;font-size:12px;padding:2px 8px;border-radius:4px;opacity:0;transition:opacity .3s ease;}`;

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
                <div class="tool-icon">✏️</div><div class="tool-icon">◻️</div><div class="tool-icon">🖍️</div>
              </div>
              <button class="send-btn">Send</button>
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
            const sentMsg     = el.querySelector('.sent-msg');

            const speed = opts.speedMultiplier?1/opts.speedMultiplier:1;

            /* ----- Helper functions ----- */
            function typeText(target, text, cb){
                let idx=0;target.value='';
                const iv=setInterval(()=>{target.value+=text[idx++];if(idx>text.length-1){clearInterval(iv);if(cb)cb();}},80*speed);
            }

            function reset(){
                dashboard.style.opacity=1;store.style.opacity=0;
                timeWrap.style.opacity=0;badge.classList.remove('show','clicked');badge.style.right='-80px';overlay.style.opacity=0;toolBar.style.opacity=0;sendBtn.style.opacity=0;sentMsg.style.opacity=0;highlight.style.opacity=0;chk.checked=false;timeInput.value='';
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
                // Slide badge in
                setTimeout(()=>{badge.classList.add('show');},4300*speed);
                // Click badge + overlay + toolbar
                setTimeout(()=>{badge.classList.add('clicked');overlay.style.opacity=1;highlight.style.opacity=1;toolBar.style.opacity=1;},5200*speed);
                // Show send button
                setTimeout(()=>{sendBtn.style.opacity=1;},5900*speed);
                // Click send
                setTimeout(()=>{sendBtn.classList.add('clicked');sentMsg.style.opacity=1;highlight.style.opacity=0.35;},6700*speed);
                // Fade overlay out
                setTimeout(()=>{overlay.style.opacity=0;toolBar.style.opacity=0;},8000*speed);
                // Fade widget out
                setTimeout(()=>{store.style.opacity=0;},8600*speed);
                // Restart
                setTimeout(loop,10000*speed);
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
