import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ultimate HTML Obfuscator — Unbreakable Protection" },
      {
        name: "description",
        content:
          "Premium HTML/JS obfuscator with Chinese encryption, runtime isolation, domain lock & anti-inspect protection.",
      },
    ],
  }),
});

function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function utf8Encode(text: string) {
  return btoa(
    encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
}

function utf8Decode_src() {
  // returned as string for embedding in generated output
  return `function utf8Decode(b){return decodeURIComponent(Array.prototype.map.call(atob(b),function(c){return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)}).join(''))}`;
}

function checksum(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase();
}

function generate(rawHTML: string, domainLock: string) {
  const OWNER = "@MK_BRO_1";
  const SIGNATURE = "MKIRAJ9619_HTMLOBF_PROTECTED";
  const timestamp = new Date().toLocaleString();
  const CREDIT_TEXT = `PROTECTED_BY_${OWNER}_${SIGNATURE}`;
  const CREDIT_HASH = checksum(CREDIT_TEXT);

  const headerComment = `<!--\n  ====================================================\n   PROTECTED BY ULTIMATE HTML OBFUSCATOR\n   Owner: ${OWNER}\n   Signature: ${SIGNATURE}\n   Generated: ${timestamp}\n  ====================================================\n-->\n`;

  // Triple base64 layered encoding of the raw payload
  const l1 = utf8Encode(rawHTML);
  const l2 = utf8Encode(l1);
  const l3 = utf8Encode(l2);

  // Chinese cipher: XOR 0x91, shift to CJK range
  let chinese = "";
  for (let i = 0; i < l3.length; i++) {
    chinese += String.fromCharCode((l3.charCodeAt(i) ^ 0x91) + 0x4e00);
  }

  // Escape for JS string literal
  const chineseLiteral = JSON.stringify(chinese);

  const v = {
    payload: "_" + randomString(8),
    decode: "_" + randomString(8),
    iframe: "_" + randomString(8),
    blob: "_" + randomString(8),
    url: "_" + randomString(8),
    raw: "_" + randomString(8),
  };

  const domainCheck = domainLock
    ? `(function(){var allowed=${JSON.stringify(domainLock.toLowerCase())};var host=(location.hostname||'').toLowerCase();if(host!==allowed){document.documentElement.innerHTML='<div style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#ff4444;text-align:center;padding:24px"><div><h1 style="font-size:48px;margin:0 0 12px">🔒 DOMAIN LOCK</h1><p style="opacity:.7">Unauthorized domain detected</p></div></div>';throw new Error('DOMAIN BLOCKED');}})();`
    : "";

  const runtime = `
${utf8Decode_src()}
${domainCheck}
(function(){
  function __mkHash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36).toUpperCase();}
  function __violation(msg){document.documentElement.innerHTML='<div style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#08080b;color:#ff4d4d;text-align:center;padding:24px"><div style="max-width:620px"><div style="font-size:54px;margin-bottom:14px">🚫</div><h1 style="font-size:42px;line-height:1.05;margin:0 0 12px;letter-spacing:-.03em">VIOLATION DETECTED</h1><p style="font-size:18px;margin:0;color:#ffd1d1">Credit removed or protected file modified.</p><p style="font-size:13px;margin-top:16px;color:#8f8f98">'+msg+'</p></div></div>';throw new Error(msg);}
  var credit=document.querySelector('meta[name="mk-protected-credit"]');
  if(!credit || credit.getAttribute('content')!==${JSON.stringify(CREDIT_TEXT)} || credit.getAttribute('data-sign')!==${JSON.stringify(CREDIT_HASH)} || __mkHash(credit.getAttribute('content')||'')!==credit.getAttribute('data-sign')){
    __violation('CREDIT_REMOVED_OR_TAMPERED');
  }
  var badge=document.getElementById('mk-protected-credit');
  if(!badge || badge.textContent!==${JSON.stringify(CREDIT_TEXT)} || badge.getAttribute('data-sign')!==${JSON.stringify(CREDIT_HASH)}){
    __violation('CREDIT_BADGE_REMOVED_OR_TAMPERED');
  }
  if(document.documentElement.outerHTML.indexOf(${JSON.stringify(SIGNATURE)})===-1){
    document.documentElement.innerHTML='<div style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#ff4444;text-align:center;padding:24px"><div><h1 style="font-size:48px;margin:0 0 12px">⚠ CODE BLOCKED</h1><p style="opacity:.7">Protected signature removed</p></div></div>';
    throw new Error('CREDIT REMOVED');
  }
  var ${v.raw}=${chineseLiteral};
  var ${v.payload}='';
  for(var i=0;i<${v.raw}.length;i++){
    ${v.payload}+=String.fromCharCode((${v.raw}.charCodeAt(i)-0x4E00)^0x91);
  }
  var ${v.decode}=utf8Decode(utf8Decode(utf8Decode(${v.payload})));
  var ${v.blob}=new Blob([${v.decode}],{type:'text/html'});
  var ${v.url}=URL.createObjectURL(${v.blob});
  var ${v.iframe}=document.createElement('iframe');
  ${v.iframe}.src=${v.url};
  ${v.iframe}.setAttribute('sandbox','allow-scripts allow-forms allow-same-origin allow-popups allow-modals');
  document.body.appendChild(${v.iframe});
  // Anti-inspect
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('keydown',function(e){
    if(e.keyCode===123) e.preventDefault();
    if(e.ctrlKey&&e.shiftKey&&(e.keyCode===73||e.keyCode===74||e.keyCode===67)) e.preventDefault();
    if(e.ctrlKey&&(e.keyCode===85||e.keyCode===83)) e.preventDefault();
  });
})();
`.trim();

  const out = `${headerComment}<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="mk-protected-credit" content="${CREDIT_TEXT}" data-sign="${CREDIT_HASH}">
<title>Protected</title>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#fff;}iframe{width:100%;height:100%;border:none;display:block;}</style>
</head>
<body>
<div id="mk-protected-credit" data-sign="${CREDIT_HASH}" style="position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;user-select:none">${CREDIT_TEXT}</div>
<script>
${runtime}
</script>
</body>
</html>`;

  return out;
}

function Index() {
  const [source, setSource] = useState("");
  const [domain, setDomain] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const outRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    if (!source.trim()) {
      alert("অনুগ্রহ করে আগে HTML কোড দিন");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      try {
        setOutput(generate(source, domain));
      } catch (err) {
        alert("Encryption failed: " + (err as Error).message);
      } finally {
        setGenerating(false);
      }
    }, 60);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protected.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-obf-bg text-obf-fg">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40 bg-obf-glow1" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 bg-obf-glow2" />
        <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full blur-3xl opacity-25 bg-obf-glow3" />
      </div>
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-obf-grid opacity-[0.07]" />

      <header className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-obf-accent flex items-center justify-center shadow-obf-glow">
              <span className="text-obf-bg font-bold text-lg">⌬</span>
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] text-obf-muted uppercase">MK · Obfuscator</p>
              <p className="text-sm font-semibold">Ultimate Protection v3</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-obf-border bg-obf-card/60 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-obf-muted">Runtime isolated · Sandboxed</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {/* Hero */}
        <section className="text-center mt-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-obf-border bg-obf-card/60 backdrop-blur mb-6">
            <span className="text-xs text-obf-muted">🔐 Triple-layer Base64 · Chinese cipher · Iframe sandbox</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] bg-clip-text text-transparent bg-obf-headline">
            Ultimate HTML<br />Obfuscator
          </h1>
          <p className="mt-5 text-obf-muted max-w-xl mx-auto text-sm sm:text-base">
            আপনার HTML / JS কোডকে অরক্ষনীয় বানান — Chinese encryption,
            runtime isolation এবং protected loader একসাথে।
          </p>
        </section>

        {/* Input card */}
        <section className="rounded-3xl border border-obf-border bg-obf-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-obf-card">
          <div className="grid gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-obf-muted mb-2">
                <span>🌐</span> Domain Lock <span className="text-obf-muted/60 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="w-full px-4 py-3 rounded-xl bg-obf-input border border-obf-border focus:border-obf-accent focus:outline-none focus:ring-2 focus:ring-obf-accent/30 transition placeholder:text-obf-muted/60"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-obf-muted mb-2">
                <span>📝</span> আপনার RAW HTML / JS কোড
              </label>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                spellCheck={false}
                placeholder={`<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`}
                className="w-full h-72 px-4 py-3 rounded-xl bg-obf-input border border-obf-border focus:border-obf-accent focus:outline-none focus:ring-2 focus:ring-obf-accent/30 transition font-mono text-sm placeholder:text-obf-muted/40 resize-y"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="group relative w-full py-4 rounded-xl font-semibold tracking-wide text-obf-bg bg-obf-accent hover:opacity-95 active:scale-[0.99] transition shadow-obf-glow disabled:opacity-60"
            >
              <span className="relative z-10">
                {generating ? "🔒 ENCRYPTING…" : "⚡ GENERATE PROTECTED HTML"}
              </span>
            </button>
          </div>
        </section>

        {/* Output card */}
        {output && (
          <section className="mt-8 rounded-3xl border border-obf-border bg-obf-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-obf-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-widest text-obf-muted">
                <span>📦</span> Protected Output
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-obf-accent/15 text-obf-accent border border-obf-accent/30">
                  {(output.length / 1024).toFixed(1)} KB
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-obf-border hover:border-obf-accent hover:text-obf-accent transition"
                >
                  {copied ? "✓ COPIED" : "COPY"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-obf-accent text-obf-bg hover:opacity-90 transition"
                >
                  ↓ DOWNLOAD
                </button>
              </div>
            </div>
            <textarea
              ref={outRef}
              value={output}
              readOnly
              className="w-full h-72 px-4 py-3 rounded-xl bg-obf-input border border-obf-border font-mono text-xs resize-y focus:outline-none"
            />
          </section>
        )}

        {/* Features */}
        <section className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { i: "🧬", t: "Chinese Cipher", d: "XOR + CJK range mapping for opaque payloads." },
            { i: "🛡️", t: "Runtime Sandbox", d: "Iframe-isolated execution via blob URLs." },
            { i: "🔒", t: "Domain Lock", d: "Bind output to a single host. Anywhere else: blocked." },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-2xl border border-obf-border bg-obf-card/50 backdrop-blur p-5 hover:border-obf-accent/50 transition"
            >
              <div className="text-2xl mb-2">{f.i}</div>
              <div className="font-semibold mb-1">{f.t}</div>
              <p className="text-xs text-obf-muted leading-relaxed">{f.d}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs text-obf-muted">
          Designed by <span className="text-obf-accent font-semibold">@MK_BRO_1</span> · Advanced Runtime Protection
        </footer>
      </main>
    </div>
  );
}
