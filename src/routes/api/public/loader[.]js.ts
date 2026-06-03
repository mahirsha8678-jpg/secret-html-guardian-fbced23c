import { createFileRoute } from "@tanstack/react-router";

// GET /api/public/loader.js?id=<payload-id>
// Returns runtime JS that pulls the encrypted payload from Lovable Cloud and renders it in a sandboxed iframe.
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
        const id = url.searchParams.get("id") || "";

        if (!/^[0-9a-f-]{36}$/i.test(id)) {
          return new Response("throw new Error('INVALID_PAYLOAD_ID');", {
            status: 400,
            headers: { "Content-Type": "application/javascript; charset=utf-8" },
          });
        }

        const { getEncryptedPayload } = await import("@/lib/protectedPayloads.server");
        const row = await getEncryptedPayload(id);
        if (!row) {
          return new Response("throw new Error('PAYLOAD_NOT_FOUND');", {
            status: 404,
            headers: { "Content-Type": "application/javascript; charset=utf-8" },
          });
        }

        const p = row.payload;
        const k1 = row.k1;
        const k2 = row.k2;
        const dom = row.domainLock;

        const domainGuard = dom
          ? `var __al=${JSON.stringify(dom.toLowerCase())};if((location.hostname||'').toLowerCase()!==__al){document.documentElement.innerHTML='<div style=\\'font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#ff4444;text-align:center;padding:24px\\'><div><h1 style=\\'font-size:48px;margin:0 0 12px\\'>&#128274; DOMAIN LOCK</h1><p style=\\'opacity:.7\\'>Unauthorized domain detected</p></div></div>';throw new Error('DOMAIN_BLOCKED');}`
          : "";

        const js = `/*! MK_BRO_1 · ARS250 server-loader · do not modify */
(function(){
  try{
    ${domainGuard}
    function __mk_h(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36).toUpperCase();}
    var __mc=document.querySelector('meta[name="mk-protected-credit"]'),__ms=document.querySelector('meta[name="mk-signature"]');
    if(!__mc||!__ms)throw new Error('CREDIT_REMOVED');
    var __ct=__mc.getAttribute('content')||'',__cs=__mc.getAttribute('data-sign')||'',__sg=__ms.getAttribute('content')||'';
    if(__ct!==${JSON.stringify(row.creditText)}||__cs!==${JSON.stringify(row.creditHash)}||__sg!==${JSON.stringify(row.signature)}||__mk_h(__ct)!==__cs)throw new Error('CREDIT_TAMPERED');
    var __ck=__mk_h(__ct+'|'+__cs+'|'+__sg),__a=0,__b=0;
    for(var __i=0;__i<__ck.length;__i++){__a=(__a+__ck.charCodeAt(__i)*31)&0xff;__b=(__b^((__ck.charCodeAt(__i)<<(__i%5))&0xff))&0xff;}
    var CM1=__a||0x5a,CM2=__b||0xa5;
    var ENC=${JSON.stringify(p)},ALG='ARS250',K1=${k1},K2=${k2};
    function __b64bytes(s){var bin=atob(s),len=bin.length,bytes=new Uint8Array(len);for(var x=0;x<len;x+=32768){var end=Math.min(x+32768,len);for(var y=x;y<end;y++)bytes[y]=bin.charCodeAt(y)&255;}return bytes;}
    var raw=__b64bytes(ENC),L=raw.length,out=new Uint8Array(L);
    for(var i=0;i<L;i++){
      var rk=(K1^((K2+i)&0xff))&0xff;
      var cm=(CM1^((CM2+i)&0xff))&0xff;
      out[i]=raw[i]^rk^cm;
    }
    function __u8(bytes){try{return new TextDecoder('utf-8',{fatal:false}).decode(bytes);}catch(e){var s='',c=32768;for(var z=0;z<bytes.length;z+=c)s+=String.fromCharCode.apply(null,bytes.subarray(z,z+c));try{return decodeURIComponent(escape(s));}catch(_e){return s;}}}
    var html=__u8(out);
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
