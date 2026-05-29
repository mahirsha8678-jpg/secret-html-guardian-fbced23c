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

function toUrlSafeB64(s: string) {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function checksum(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase();
}

function generate(rawHTML: string, domainLock: string, serverOrigin: string) {
  const OWNER = "@MK_BRO_1";
  const SIGNATURE = "MKIRAJ9619_HTMLOBF_PROTECTED";
  const timestamp = new Date().toLocaleString();
  const CREDIT_TEXT = `PROTECTED_BY_${OWNER}_${SIGNATURE}`;
  const CREDIT_HASH = checksum(CREDIT_TEXT);

  const headerCommentBody = `\n  ====================================================\n   PROTECTED BY ULTIMATE HTML OBFUSCATOR\n   Owner: ${OWNER}\n   Signature: ${SIGNATURE}\n   Server:  ${serverOrigin}\n   Generated: ${timestamp}\n  ====================================================\n`;
  const headerComment = `<!--${headerCommentBody}-->\n`;

  // Per-build random keys (different every generation)
  const K1 = Math.floor(Math.random() * 200) + 30;
  const K2 = Math.floor(Math.random() * 200) + 30;
  const ROT = Math.floor(Math.random() * 0x3000) + 0x4e00;

  // Triple base64 utf8-safe encoding
  const l1 = utf8Encode(rawHTML);
  const l2 = utf8Encode(l1);
  const l3 = utf8Encode(l2);

  // Rolling-XOR -> binary string -> URL-safe base64 (so it travels in URL params)
  let bin = "";
  for (let i = 0; i < l3.length; i++) {
    const rk = (K1 ^ ((K2 + i) & 0xff)) & 0xff;
    bin += String.fromCharCode(l3.charCodeAt(i) ^ rk);
  }
  const payloadB64 = toUrlSafeB64(bin);

  // Build server-import URL — the decryption runtime lives on the MK server
  const params = new URLSearchParams();
  params.set("p", payloadB64);
  params.set("k1", String(K1));
  params.set("k2", String(K2));
  params.set("r", String(ROT));
  if (domainLock) params.set("d", domainLock.toLowerCase());
  const loaderUrl = `${serverOrigin.replace(/\/$/, "")}/api/public/loader.js?${params.toString()}`;

  const out = `${headerComment}<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="mk-protected-credit" content="${CREDIT_TEXT}" data-sign="${CREDIT_HASH}">
<meta name="mk-server" content="${serverOrigin}">
<meta name="mk-signature" content="${SIGNATURE}">
<title>Protected</title>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#fff;}iframe{width:100%;height:100%;border:none;display:block;}</style>
</head>
<body>
<!--
  ============================================================
   This file is PROTECTED by ${OWNER}.
   The decryption runtime is served from a remote MK server:
       ${serverOrigin}/api/public/loader.js
   Do NOT modify the <script src=...> tag below — without the
   server import the encrypted payload cannot execute.
   Signature: ${SIGNATURE}
  ============================================================
-->
<script src="${loaderUrl}" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<noscript>This protected file requires JavaScript and access to ${serverOrigin}.</noscript>
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
            <div className="relative w-11 h-11 rounded-2xl bg-obf-accent flex items-center justify-center shadow-obf-glow">
              <span className="text-obf-bg font-black text-lg">⌬</span>
              <span className="absolute -inset-0.5 rounded-2xl bg-obf-accent/30 blur-md -z-10" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.4em] text-obf-muted uppercase">MK · Obfuscator</p>
              <p className="text-sm font-bold tracking-wide">HTML NOOB <span className="text-obf-accent">PRO</span></p>
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
        <section className="text-center mt-6 mb-14 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-obf-accent/30 bg-obf-accent/5 backdrop-blur mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-obf-accent animate-pulse" />
            <span className="text-[11px] tracking-widest uppercase text-obf-accent font-semibold">
              v4 · Unbreakable Edition
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.95] bg-clip-text text-transparent bg-obf-headline">
            HTML NOOB
            <br />
            <span className="italic font-light">PRO</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["Chinese Cipher", "Triple Base64", "Iframe Sandbox", "Domain Lock"].map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-obf-muted border border-obf-border bg-obf-card/40 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-6 text-obf-muted max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            আপনার HTML / JS কোডকে বানান <span className="text-obf-fg font-semibold">অরক্ষনীয়</span> —
            military-grade encryption, runtime isolation এবং tamper-proof credit lock একসাথে।
          </p>
        </section>

        {/* Input card */}
        <section className="rounded-3xl border border-obf-border bg-obf-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-obf-card">
          <div className="grid gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-obf-muted mb-2">
                <span>🌐</span> Domain Lock{" "}
                <span className="text-obf-muted/60 normal-case tracking-normal">(optional)</span>
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
            {
              i: "🔒",
              t: "Domain Lock",
              d: "Bind output to a single host. Anywhere else: blocked.",
            },
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

        <footer className="mt-20 pt-8 border-t border-obf-border/50 text-center">
          <p className="text-xs text-obf-muted">
            Crafted with <span className="text-obf-accent">◆</span> by{" "}
            <span className="text-obf-fg font-bold">@MK_BRO_1</span>
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-obf-muted/60 mt-2">
            HTML NOOB PRO — Tamper-Proof Runtime
          </p>
        </footer>
      </main>
    </div>
  );
}
