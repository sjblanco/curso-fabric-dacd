/* Vistas simuladas de Microsoft Fabric para los laboratorios.
   Cada módulo define window.LABX = [ {s: pantalla | [pantallas], ex: {t,d,code,out}} , ... ] en el mismo orden que su LAB.
   Las pantallas son representaciones simplificadas; la interfaz real puede variar con las actualizaciones de Microsoft. */
(function(){
const css=`
.fx{margin:12px 0 4px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--bg);font:14px/1.4 "Segoe UI","Source Sans 3",system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.fx *{box-sizing:border-box}
.fx-top{display:flex;align-items:center;gap:10px;padding:7px 12px;background:light-dark(#f3f2f1,#2b2730);border-bottom:1px solid var(--line);font-size:13px}
.fx-app{font-weight:700;display:flex;align-items:center;gap:6px}.fx-app:before{content:"";width:14px;height:14px;border-radius:3px;background:linear-gradient(135deg,#1aa39a,#3b7ddd)}
.fx-crumb{color:var(--soft);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fx-me{width:24px;height:24px;border-radius:50%;background:var(--pu);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700}
.fx-body{display:grid;grid-template-columns:68px minmax(0,1fr);min-height:220px}
.fx-nav{background:light-dark(#faf9f8,#221e27);border-right:1px solid var(--line);padding:8px 4px;display:flex;flex-direction:column;gap:6px;font-size:11px;text-align:center;color:var(--soft)}
.fx-nav span{padding:6px 2px;border-radius:6px;position:relative}.fx-nav span:before{content:"";display:block;width:18px;height:18px;margin:0 auto 3px;border-radius:5px;border:2px solid currentColor;opacity:.7}
.fx-nav span.on{background:light-dark(#e1dfdd,#3a3442);color:var(--ink);font-weight:700}
.fx-main{padding:10px 12px;display:grid;gap:10px;align-content:start;overflow:hidden}
.fx-h{font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.fx-h small{font-weight:400;color:var(--soft);font-size:12px}
.fx-rib{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.fx-b{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:6px;padding:4px 9px;font-size:13px;background:var(--bg);position:relative;white-space:nowrap}
.fx-b.pri{background:#117865;color:#fff;border-color:#117865}
.hi{outline:3px solid var(--or)!important;outline-offset:2px;border-radius:6px;animation:fxp 1.6s ease-in-out infinite}
@keyframes fxp{50%{outline-color:rgba(244,121,32,.35)}}
@media (prefers-reduced-motion:reduce){.hi{animation:none}}
.fx-n{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:50%;background:var(--or);color:#fff;font:700 12px/1 Montserrat,system-ui,sans-serif;font-style:normal;padding:0 5px;flex:none}
.fx table{border-collapse:collapse;width:100%;font-size:13px}
.fx th,.fx td{text-align:left;padding:5px 7px;border-bottom:1px solid var(--line);white-space:nowrap}
.fx th{color:var(--soft);font-weight:600;background:light-dark(#faf9f8,#221e27)}
.fx td.r,.fx th.r{text-align:right}
.fx-scroll{overflow-x:auto}
.fx-ty{display:inline-block;font-size:11px;border-radius:4px;padding:1px 6px;background:var(--panel);color:var(--soft)}
.fx-modal{border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--bg);box-shadow:0 8px 24px rgba(0,0,0,.12);max-width:460px;display:grid;gap:9px}
.fx-f{display:grid;gap:3px}.fx-f label{font-size:12px;color:var(--soft)}
.fx-in{border:1px solid var(--line);border-radius:6px;padding:5px 8px;display:flex;align-items:center;gap:6px;justify-content:space-between}
.fx-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px}
.fx-tile{border:1px solid var(--line);border-radius:8px;padding:8px;font-size:13px;display:flex;align-items:center;gap:6px;justify-content:space-between}
.fx-split{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,2fr);gap:10px}
@media(max-width:640px){.fx-split{grid-template-columns:minmax(0,1fr)}.fx-body{grid-template-columns:minmax(0,1fr)}.fx-nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line)}.fx-nav span{min-width:62px}}
.fx-tree{border:1px solid var(--line);border-radius:8px;padding:8px;font-size:13px;display:grid;gap:3px;align-content:start}
.fx-tree b{font-size:12px;color:var(--soft);margin-top:4px}
.fx-tree span{white-space:pre}
.fx-tree div{padding:3px 6px;border-radius:5px;display:flex;align-items:center;gap:6px;justify-content:space-between}
.fx-tree div.sel{background:light-dark(#e6f2ef,#1f3a34)}
.fx-ic{font-size:11px;color:var(--soft)}
.fx-menu{border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.12);background:var(--bg);display:grid;margin:2px 0 4px 14px;font-size:13px;max-width:220px}
.fx-menu div{padding:5px 10px}.fx-menu div+div{border-top:1px solid var(--line)}
.fx-code{margin:0;background:light-dark(#f7f7f9,#1b1820);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font:12.5px/1.5 Consolas,"SFMono-Regular",monospace;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--ink)}
.fx-out{margin:0;font:12.5px/1.45 Consolas,monospace;white-space:pre-wrap;color:var(--soft);padding:6px 10px;border-left:3px solid #117865;background:light-dark(#f3faf8,#16241f);border-radius:0 6px 6px 0}
.fx-err{border-left-color:#c4314b;background:light-dark(#fdf3f4,#2a1519);color:light-dark(#a4262c,#f1a7b0)}
.fx-cell{display:grid;grid-template-columns:28px minmax(0,1fr);gap:6px;align-items:start}
.fx-cell>i{font-style:normal;color:var(--soft);font-size:12px;padding-top:8px;text-align:right}
.fx-chain{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.fx-node{border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:13px;background:var(--bg);display:grid}
.fx-node small{color:var(--soft);font-size:11px}
.fx-arr{color:var(--soft)}
.fx-chips{display:flex;gap:6px;flex-wrap:wrap}.fx-chip{border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:12px;display:inline-flex;gap:5px;align-items:center}
.fx-chip.on{background:light-dark(#e6f2ef,#1f3a34);border-color:#117865}
.fx-bars{display:grid;gap:6px;font-size:12px}.fx-bars div{display:grid;grid-template-columns:90px 1fr 70px;gap:8px;align-items:center}.fx-bars i{display:block;height:16px;background:#3b7ddd;border-radius:3px}
.fx-pane{border:1px solid var(--line);border-radius:8px;padding:8px;font-size:13px;display:grid;gap:4px;align-content:start}
.fx-pane b{font-size:12px;color:var(--soft)}
.fx-pane div{display:flex;gap:6px;align-items:center;justify-content:space-between}
.fx-chk:before{content:"☐ ";color:var(--soft)}.fx-chk.on:before{content:"☑ ";color:#117865}
.fx-cop{border:1px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:6px;font-size:13px;background:light-dark(#f6f4fb,#231d2b)}
.fx-cop .q{justify-self:end;background:var(--pu);color:#fff;border-radius:10px 10px 2px 10px;padding:5px 9px;max-width:85%}
.fx figcaption,.fx-cap{padding:8px 12px;border-top:1px solid var(--line);font-size:13px;color:var(--soft);background:light-dark(#fffaf5,#241c16)}
.fx-cap b{color:var(--ink)}
.lvx{margin:12px 0 6px;border:1px dashed var(--or);border-radius:12px;padding:10px 12px;background:var(--orbg)}
.lvx h4{margin:0 0 4px;font:700 14px/1.2 Montserrat,system-ui,sans-serif;color:var(--or)}
.lvx p{margin:0 0 6px;font-size:15px}
.lvx details{margin-top:6px}.lvx summary{cursor:pointer;font-weight:700;font-size:14px;color:var(--pu)}
.lvh{margin:14px 0 2px;font:700 13px/1.2 Montserrat,system-ui,sans-serif;color:var(--soft);text-transform:uppercase;letter-spacing:.04em}
.lvnote{font-size:12px;color:var(--soft);margin:4px 0 0}
.check .fx span,.check .lvx span{font-size:inherit;color:inherit}
.check .fx b,.check .lvx b{display:inline}
.check .fx .fx-tree b,.check .fx .fx-pane b{display:block}
.check .fx label{display:block;padding:0;cursor:default;font-size:12px;color:var(--soft)}
.check .fx .fx-ty{font-size:11px;color:var(--soft)}
.check .fx .fx-crumb,.check .fx .fx-arr,.check .fx .fx-node small{color:var(--soft)}
.check .fx .fx-b.pri,.check .fx .fx-me,.check .fx .fx-n,.check .fx .fx-cop .q{color:#fff}
.check .fx-nav span{font-size:11px}
.fx-tree .fx-menu{display:grid;padding:0;margin-left:10px}.fx-tree .fx-menu div{display:block;padding:5px 10px}
.fx-tree .fx-menu div+div{border-top:1px solid var(--line)}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* "Texto|2" => texto con la llamada 2 resaltada */
const P=s=>{s=String(s==null?'':s);const m=s.match(/^(.*)\|(\d+)$/s);return m?{t:m[1],n:m[2]}:{t:s,n:''}};
const N=n=>n?`<i class="fx-n">${n}</i>`:'';
const btn=(s,cls)=>{const p=P(s);return `<span class="fx-b ${cls||''} ${p.n?'hi':''}">${E(p.t)}${N(p.n)}</span>`};
const cell=s=>{const p=P(s);return `${E(p.t)}${p.n?' '+N(p.n):''}`};
const hiw=(s,inner)=>{const p=P(s);return [p.n?'hi':'',p.t,p.n]};
const table=(cols,rows,num)=>`<div class="fx-scroll"><table><thead><tr>${cols.map((c,i)=>`<th class="${num&&num.includes(i)?'r':''}">${cell(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${num&&num.includes(i)?'r':''}${P(c).n?' hi':''}">${cell(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const NAV=['Inicio','Workspaces','OneLake','Monitor','Crear'];
const navOn={home:'Inicio',ws:'Workspaces',onelake:'OneLake',monitor:'Monitor',create:'Crear'};

const V={
 home:v=>`<div class="fx-h">${E(v.title||'Le damos la bienvenida a Fabric')}</div><div class="fx-tiles">${(v.tiles||[]).map(x=>{const p=P(x);return `<div class="fx-tile ${p.n?'hi':''}">${E(p.t)}${N(p.n)}</div>`}).join('')}</div>${v.badge?`<div style="justify-self:end">${btn(v.badge)}</div>`:''}`,
 items:v=>`<div class="fx-scroll"><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Propietario</th></tr></thead><tbody>${v.rows.map(r=>{const p=P(r[0]);return `<tr><td class="${p.n?'hi':''}">${E(p.t)} ${N(p.n)}</td><td><span class="fx-ty">${E(r[1])}</span></td><td>${E(r[2]||'Usted')}</td></tr>`}).join('')}</tbody></table></div>`,
 picker:v=>`<div class="fx-modal" style="max-width:none"><div class="fx-h">${E(v.title||'Nuevo elemento')}</div><div class="fx-in ${P(v.q).n?'hi':''}"><span>🔍 ${E(P(v.q).t)}</span>${N(P(v.q).n)}</div><div class="fx-tiles">${v.items.map(x=>{const p=P(x);return `<div class="fx-tile ${p.n?'hi':''}">${E(p.t)}${N(p.n)}</div>`}).join('')}</div></div>`,
 dialog:v=>`<div class="fx-modal"><div class="fx-h">${E(v.title)}</div>${(v.fields||[]).map(f=>{const p=P(f[1]);return `<div class="fx-f"><label>${E(f[0])}</label><div class="fx-in ${p.n?'hi':''}"><span>${E(p.t)}</span>${N(p.n)}</div></div>`}).join('')}${v.text?`<p style="margin:0;font-size:13px;color:var(--soft)">${E(v.text)}</p>`:''}<div style="display:flex;gap:6px;justify-content:flex-end">${(v.btns||['Cancelar','Crear']).map((b,i,a)=>btn(b,i===a.length-1?'pri':'')).join('')}</div></div>`,
 lake:v=>{const row=(x,sel)=>{const p=P(x);return `<div class="${p.n?'hi':''} ${sel?'sel':''}"><span>${E(p.t)}</span>${N(p.n)}</div>`};
   const menu=v.menu?`<div class="fx-menu">${v.menu.items.map(x=>{const p=P(x);return `<div class="${p.n?'hi':''}">${E(p.t)} ${N(p.n)}</div>`}).join('')}</div>`:'';
   const list=(arr,where)=>arr.map((x,i)=>row(x,v.sel===P(x).t)+(v.menu&&v.menu.at===where&&v.menu.row===i?menu:'')).join('');
   return `<div class="fx-split"><div class="fx-tree"><div class="sel"><span>📁 ${E(v.name||'Explorador')}</span></div><b>Tables</b>${list(v.tables||[],'tables')||'<div class="fx-ic">(vacío)</div>'}<b>Files</b>${list(v.files||[],'files')||'<div class="fx-ic">(vacío)</div>'}</div><div style="display:grid;gap:8px;align-content:start">${v.right||''}${v.grid?`<div class="fx-h" style="font-size:13px">${E(v.gridTitle||'Vista previa')}</div>`+table(v.grid.cols,v.grid.rows,v.grid.num):''}${v.msg?`<pre class="fx-out">${E(v.msg)}</pre>`:''}</div></div>`},
 sql:v=>`${v.tree?`<div class="fx-split"><div class="fx-tree">${v.tree.map(x=>x.startsWith('#')?`<b>${E(x.slice(1))}</b>`:`<div class="${P(x).n?'hi':''}"><span>${E(P(x).t)}</span>${N(P(x).n)}</div>`).join('')}</div><div style="display:grid;gap:8px;align-content:start">`:''}<pre class="fx-code ${v.codeN?'hi':''}">${E(v.code)}</pre>${v.codeN?'':''}${v.grid?table(v.grid.cols,v.grid.rows,v.grid.num):''}${v.msg?`<pre class="fx-out ${v.err?'fx-err':''}">${E(v.msg)}</pre>`:''}${v.tree?'</div></div>':''}`,
 nb:v=>`${v.lh?`<div class="fx-chips"><span class="fx-chip on">Lakehouse: ${E(v.lh)}</span><span class="fx-chip">PySpark (Python)</span></div>`:''}${v.cells.map((c,i)=>`<div class="fx-cell"><i>[${i+1}]</i><div style="display:grid;gap:4px"><pre class="fx-code ${c[2]?'hi':''}">${E(c[0])}</pre>${c[1]?`<pre class="fx-out ${c[3]?'fx-err':''}">${E(c[1])}</pre>`:''}</div></div>`).join('')}`,
 settings:v=>`<div class="fx-split"><div class="fx-tree">${v.tabs.map(x=>{const p=P(x);return `<div class="${p.n?'hi':''} ${v.on===p.t?'sel':''}"><span>${E(p.t)}</span>${N(p.n)}</div>`}).join('')}</div><div class="fx-pane"><b>${E(v.on)}</b>${(v.body||[]).map(r=>`<div><span>${E(r[0])}</span><span class="fx-ty">${cell(r[1])}</span></div>`).join('')}</div></div>`,
 lineage:v=>`<div class="fx-chain">${v.nodes.map((n,i)=>{const p=P(n[0]);return (i?'<span class="fx-arr">→</span>':'')+`<div class="fx-node ${p.n?'hi':''}"><span>${E(p.t)} ${N(p.n)}</span><small>${E(n[1])}</small></div>`}).join('')}</div>`,
 catalog:v=>`<div class="fx-in ${P(v.q||'').n?'hi':''}"><span>🔍 ${E(P(v.q||'Buscar').t)}</span>${N(P(v.q||'').n)}</div><div class="fx-chips">${(v.chips||[]).map(c=>{const p=P(c);return `<span class="fx-chip ${p.n?'on hi':''}">${E(p.t)} ${N(p.n)}</span>`}).join('')}</div>${table(['Nombre','Tipo','Workspace','Propietario'],v.rows)}`,
 access:v=>`<div class="fx-modal" style="max-width:none"><div class="fx-h">Administrar acceso</div>${v.add?`<div class="fx-split" style="grid-template-columns:1fr auto"><div class="fx-in ${P(v.add[0]).n?'hi':''}"><span>${E(P(v.add[0]).t)}</span>${N(P(v.add[0]).n)}</div>${btn(v.add[1])}</div>`:''}${table(['Persona','Rol'],v.people)}<div style="justify-self:end">${btn(v.ok||'Agregar','pri')}</div></div>`,
 report:v=>`<div class="fx-split" style="grid-template-columns:minmax(0,2fr) minmax(140px,.8fr)"><div class="fx-pane"><b>${E(v.title||'Gráfico')}</b><div class="fx-bars" style="display:grid">${v.bars.map(b=>{const mx=Math.max(...v.bars.map(x=>x[1]));return `<div><span>${E(b[0])}</span><i style="width:${Math.max(4,b[1]/mx*100)}%"></i><span style="text-align:right">${E(b[2]||b[1])}</span></div>`}).join('')}</div></div><div class="fx-pane"><b>Datos</b>${v.fields.map(f=>{const p=P(f);return `<div class="fx-chk ${p.t.startsWith('*')?'on':''} ${p.n?'hi':''}"><span>${E(p.t.replace(/^\*/,''))}</span>${N(p.n)}</div>`}).join('')}</div></div>`,
 pane:v=>`<div class="fx-split"><div class="fx-pane"><b>${E(v.lt)}</b>${v.left.map(f=>{const p=P(f);return `<div class="fx-chk ${p.t.startsWith('*')?'on':''} ${p.n?'hi':''}"><span>${E(p.t.replace(/^\*/,''))}</span>${N(p.n)}</div>`}).join('')}</div><div style="display:grid;gap:8px;align-content:start">${v.right||''}${v.grid?table(v.grid.cols,v.grid.rows,v.grid.num):''}${v.code?`<pre class="fx-code">${E(v.code)}</pre>`:''}</div></div>`,
 pq:v=>`<div class="fx-split" style="grid-template-columns:minmax(0,2fr) minmax(140px,.8fr)"><div style="display:grid;gap:8px;align-content:start">${v.formula?`<div class="fx-in"><span style="font-family:Consolas,monospace;font-size:12px">fx ${E(v.formula)}</span></div>`:''}${table(v.grid.cols,v.grid.rows,v.grid.num)}</div><div class="fx-pane"><b>Pasos aplicados</b>${v.steps.map(s=>{const p=P(s);return `<div class="${p.n?'hi':''}"><span>${E(p.t)}</span>${N(p.n)}</div>`}).join('')}${v.dest?`<b style="margin-top:6px">Destino de datos</b><div class="${P(v.dest).n?'hi':''}"><span>${E(P(v.dest).t)}</span>${N(P(v.dest).n)}</div>`:''}</div></div>`,
 diagram:v=>`<div class="fx-chain">${v.boxes.map((b,i)=>{const p=P(b[0]);return (i?`<span class="fx-arr">${E(v.link||'→')}</span>`:'')+`<div class="fx-node ${p.n?'hi':''}"><span>${E(p.t)} ${N(p.n)}</span><small>${E(b[1]||'')}</small></div>`}).join('')}</div>${v.grid?table(v.grid.cols,v.grid.rows,v.grid.num):''}`,
 copilot:v=>`<div class="fx-split" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)"><div style="display:grid;gap:8px;align-content:start">${v.left||''}</div><div class="fx-cop ${v.n?'hi':''}"><b>Copilot ${N(v.n)}</b><div class="q">${E(v.q)}</div><div>${E(v.a||'')}</div>${v.code?`<pre class="fx-code">${E(v.code)}</pre>`:''}${v.warn?`<small style="color:var(--soft)">${E(v.warn)}</small>`:''}</div></div>`,
 raw:v=>v.html
};

function screen(s){
  const view=(V[s.v]||V.raw)(s);
  return `<figure class="fx" role="img" aria-label="${E('Vista simulada: '+(s.cap||s.title||''))}">
  <div class="fx-top"><span class="fx-app">Fabric</span><span class="fx-crumb">${E((s.crumb||['DACD-Lab-SuNombre']).join(' › '))}</span><span class="fx-me">SN</span></div>
  <div class="fx-body"><nav class="fx-nav" aria-hidden="true">${NAV.map(n=>`<span class="${navOn[s.nav||'ws']===n?'on':''}">${n}</span>`).join('')}</nav>
  <div class="fx-main">${s.head?`<div class="fx-h">${cell(s.head)}${s.sub?`<small>${E(s.sub)}</small>`:''}</div>`:''}${s.rib?`<div class="fx-rib">${s.rib.map(b=>btn(b)).join('')}</div>`:''}${view}</div></div>
  ${s.cap?`<div class="fx-cap">${s.cap}</div>`:''}</figure>`}

function step(i){const X=(window.LABX||[])[i];if(!X)return'';
  const ss=[].concat(X.s||[]);
  let h='';
  if(ss.length)h+=`<div class="lvh">Así se ve en Fabric</div>`+ss.map(screen).join('')+`<p class="lvnote">Los números naranja siguen el orden del paso a paso. Pantalla simplificada: los nombres de menús pueden variar un poco según la versión de Fabric y el idioma.</p>`;
  if(X.ex){const x=X.ex;h+=`<div class="lvx"><h4>Ejemplo práctico: ${E(x.t)}</h4><p>${x.d}</p>${x.code?`<pre class="fx-code">${E(x.code)}</pre>`:''}${x.out?`<details><summary>Ver el resultado esperado</summary><pre class="fx-out">${E(x.out)}</pre></details>`:''}</div>`}
  return h}
window.LabVis={step,screen};
})();
