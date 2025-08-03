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
