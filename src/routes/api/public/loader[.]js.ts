import { createFileRoute } from "@tanstack/react-router";

// GET /api/public/loader.js?p=<b64>&k1=&k2=&r=&d=<optional-domain-lock>
// Returns runtime JS that decrypts payload and renders inside sandboxed iframe.
export const Route = createFileRoute("/api/public/loader.js")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const p = url.searchParams.get("p") || "";
        const k1 = parseInt(url.searchParams.get("k1") || "0", 10) || 0;
        const k2 = parseInt(url.searchParams.get("k2") || "0", 10) || 0;
        const rot = parseInt(url.searchParams.get("r") || "0", 10) || 0;
        const dom = url.searchParams.get("d") || "";

        const domainGuard = dom
          ? `var __al=${JSON.stringify(dom.toLowerCase())};if((location.hostname||'').toLowerCase()!==__al){document.documentElement.innerHTML='<div style=\\'font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#ff4444;text-align:center;padding:24px\\'><div><h1 style=\\'font-size:48px;margin:0 0 12px\\'>&#128274; DOMAIN LOCK</h1><p style=\\'opacity:.7\\'>Unauthorized domain detected</p></div></div>';throw new Error('DOMAIN_BLOCKED');}`
          : "";

        const js = `/*! MK_BRO_1 · server-loader · do not modify */
(function(){
  try{
    ${domainGuard}
    var ENC=${JSON.stringify(p)};
    var K1=${k1},K2=${k2},ROT=${rot};
    // URL-safe base64 -> binary string
    var b=ENC.replace(/-/g,'+').replace(/_/g,'/');
    while(b.length%4)b+='=';
    var raw=atob(b);
    // Reverse CJK shift + rolling XOR
    var dec='';
    for(var i=0;i<raw.length;i++){
      var rk=(K1^((K2+i)&0xff))&0xff;
      var cc=raw.charCodeAt(i);
      // raw is char-coded after subtracting ROT (we stored as 8-bit safe via base64 of XOR bytes)
      dec+=String.fromCharCode(cc^rk);
    }
    // dec is base64-of-utf8 of the original HTML (triple wrapped)
    function u8d(s){return decodeURIComponent(Array.prototype.map.call(atob(s),function(c){return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)}).join(''))}
    var html=u8d(u8d(u8d(dec)));
    // Anti-inspect
    try{document.addEventListener('contextmenu',function(e){e.preventDefault();});
    document.addEventListener('keydown',function(e){
      if(e.keyCode===123)e.preventDefault();
      if(e.ctrlKey&&e.shiftKey&&(e.keyCode===73||e.keyCode===74||e.keyCode===67))e.preventDefault();
      if(e.ctrlKey&&(e.keyCode===85||e.keyCode===83))e.preventDefault();
    });}catch(e){}
    // Console neutralization
    try{['log','warn','info','debug','trace','table','dir'].forEach(function(m){try{window.console[m]=function(){}}catch(e){}});}catch(e){}
    // DevTools viewport trap
    try{setInterval(function(){var w=window.outerWidth-window.innerWidth,h=window.outerHeight-window.innerHeight;if(w>220||h>220){document.documentElement.innerHTML='<div style=\\'font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#08080b;color:#ff4d4d;text-align:center\\'><div><div style=\\'font-size:54px\\'>&#128683;</div><h1>DEVTOOLS DETECTED</h1></div></div>';try{window.stop&&window.stop()}catch(e){}}},1200);}catch(e){}
    var blob=new Blob([html],{type:'text/html'});
    var ifr=document.createElement('iframe');
    ifr.src=URL.createObjectURL(blob);
    ifr.setAttribute('sandbox','allow-scripts allow-forms allow-same-origin allow-popups allow-modals');
    ifr.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:none;margin:0;padding:0';
    (document.body||document.documentElement).appendChild(ifr);
  }catch(e){
    document.documentElement.innerHTML='<div style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#08080b;color:#ff4d4d;text-align:center;padding:24px"><div><div style="font-size:54px">&#128683;</div><h1>PAYLOAD TAMPERED</h1><p style="color:#8f8f98;font-size:13px">'+(e&&e.message||'unknown')+'</p></div></div>';
  }
})();
`;

        return new Response(js, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "X-MK-Protected": "@MK_BRO_1",
          },
        });
      },
    },
  },
});
