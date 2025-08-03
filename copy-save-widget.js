/* =====================================================================
 * Copy Save Widget - Animates "Copy & Save" workflow
 * ===================================================================== */

(function (global) {
    "use strict";

    /* Style injection */
    const STYLE_ID = 'copy-save-style';

    function injectStyles(id, css) {
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id;
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    const CSS = `/* ===== Copy Save ===== */
.copy-save-widget *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans', sans-serif;}
.copy-save-widget{width:500px;height:200px;border:1px solid #e2e8f0;position:relative;overflow:hidden;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);}
.copy-save-widget .scene{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;transition:opacity .5s ease;}
.copy-save-widget .scene-editor,.copy-save-widget .copied-msg,.copy-save-widget .saved-msg{opacity:0;}
.copy-save-widget .input-wrapper{display:flex;align-items:center;gap:12px;}
.copy-save-widget .code-input{width:300px;padding:10px 12px;border:1px solid #cbd5e1;background:#f8fafc;font-size:13px;border-radius:8px;color:#334155;font-family:'Noto Sans', sans-serif;transition:border-color .2s ease;}
.copy-save-widget .code-input:focus{outline:none;border-color:#c90f0f;box-shadow:0 0 0 3px rgb(201 15 15 / 0.1);}
.copy-save-widget .copy-btn,.copy-save-widget .save-btn{padding:10px 16px;border:none;border-radius:8px;background:#c90f0f;color:#ffffff;cursor:pointer;transition:all .2s ease;font-weight:500;font-size:13px;font-family:'Noto Sans', sans-serif;}
.copy-save-widget .copy-btn:hover,.copy-save-widget .save-btn:hover{background:#b10e0e;transform:translateY(-1px);box-shadow:0 4px 12px rgb(201 15 15 / 0.4);}
.copy-save-widget .copy-btn.clicked,.copy-save-widget .save-btn.clicked{transform:scale(0.95);box-shadow:0 2px 8px rgb(201 15 15 / 0.3);}
.copy-save-widget .copied-msg,.copy-save-widget .saved-msg{margin-left:8px;color:#16a34a;font-weight:600;transition:opacity .3s ease;user-select:none;font-size:13px;}
.copy-save-widget .editor-window{width:90%;height:80%;background:#1e293b;color:#e2e8f0;border-radius:12px;padding:16px;position:relative;display:flex;flex-direction:column;box-shadow:0 10px 25px rgb(0 0 0 / 0.3);}
.copy-save-widget .titlebar{background:#374151;padding:8px 12px;margin:-16px -16px 12px;font-size:13px;color:#f1f5f9;border-top-left-radius:12px;border-top-right-radius:12px;font-weight:500;}
.copy-save-widget .code{flex:1;font-size:13px;line-height:1.4;white-space:pre;overflow:hidden;color:#e2e8f0;}
.copy-save-widget .type-script{border-right:2px solid #c90f0f;color:#c90f0f;font-weight:600;}
.copy-save-widget .save-btn{position:absolute;bottom:12px;right:12px;}
.copy-save-widget .saved-msg{position:absolute;bottom:16px;right:120px;}`;

    function copySaveWidget(selector, opts = {}) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return console.error('copySaveWidget: container not found', selector);

        injectStyles(STYLE_ID, CSS);
        el.innerHTML = '';
        el.classList.add('copy-save-widget');

        if (opts.width) el.style.width = opts.width + 'px';
        if (opts.height) el.style.height = opts.height + 'px';

        el.insertAdjacentHTML('afterbegin', `
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

        const sceneCopy = el.querySelector('.scene-copy');
        const sceneEditor = el.querySelector('.scene-editor');
        const copyBtn = el.querySelector('.copy-btn');
        const copiedMsg = el.querySelector('.copied-msg');
        const saveBtn = el.querySelector('.save-btn');
        const savedMsg = el.querySelector('.saved-msg');
        const typeSpan = el.querySelector('.type-script');
        const tag = '<script src="widget.js"></' + 'script>';

        const T = opts.speedMultiplier ? 1 / opts.speedMultiplier : 1;

        function reset() {
            sceneCopy.style.opacity = 1;
            sceneEditor.style.opacity = 0;
            copyBtn.classList.remove('clicked');
            saveBtn.classList.remove('clicked');
            copiedMsg.style.opacity = 0;
            savedMsg.style.opacity = 0;
            typeSpan.textContent = '';
        }

        function loop() {
            reset();
            setTimeout(() => { copyBtn.classList.add('clicked'); copiedMsg.style.opacity = 1; }, 1000 * T);
            setTimeout(() => { sceneCopy.style.opacity = 0; sceneEditor.style.opacity = 1; }, 2200 * T);
            setTimeout(() => {
                let i = 0;
                const t = setInterval(() => {
                    typeSpan.textContent = tag.slice(0, i++);
                    if (i > tag.length) clearInterval(t);
                }, 50 * T);
            }, 2500 * T);
            setTimeout(() => { saveBtn.classList.add('clicked'); savedMsg.style.opacity = 1; }, 5200 * T);
            setTimeout(() => { sceneEditor.style.opacity = 0; }, 6700 * T);
            setTimeout(loop, 8200 * T);
        }
        loop();
    }

    global.copySaveWidget = copySaveWidget;

})(window);
