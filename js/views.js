'use strict';
/* ---------- ui state + render ---------- */
const ui={view:'home',dogId:null,tab:'profil',litterId:null,filter:'all'};
const NAV=[['home','Azi',IC.home],['dogs','Câini',IC.paw],['litters','Cuiburi',IC.nest],['calendar','Calendar',IC.cal],['shows','Expoziții',IC.ribbon],['settings','Setări',IC.gear]];
function renderNav(late){
  const cur=ui.view==='dog'?'dogs':ui.view==='litter'?'litters':ui.view;
  const b=(v,l,ic)=>`<button data-act="nav" data-v="${v}" ${cur===v?'aria-current="page"':''}>${I(ic)}<span>${l}</span>${v==='home'&&late?`<span class="dot">${late}</span>`:''}</button>`;
  const items=isOwnerRole()?NAV.filter(n=>n[0]!=='litters'):NAV;
  $('#nav').innerHTML=items.map(n=>b(...n)).join('');$('#tabbar').innerHTML=items.slice(0,5).map(n=>b(...n)).join('');
}
const isOwnerRole=()=>S.account?.role==='owner';
let lastVK='',enterT;
function render(){
  const R=reminders();const late=R.filter(r=>diff(today(),r.due)<=0).length;
  const locked=!!(!Store.ready||!S.account||ui.locked);document.body.classList.toggle('locked',locked);
  const vk=locked?'welcome':ui.view+':'+(ui.dogId||'')+':'+(ui.litterId||'')+':'+ui.tab;const vw=$('#view');
  if(vk!==lastVK){vw.classList.remove('enter');void vw.offsetWidth;vw.classList.add('enter');lastVK=vk;clearTimeout(enterT);enterT=setTimeout(()=>vw.classList.remove('enter'),900)}
  if(locked){vw.innerHTML=vWelcome();hydrate();return}
  renderNav(late);
  const v=ui.view;let h='';
  if(v==='home')h=vHome(R);else if(v==='dogs')h=vDogs();else if(v==='dog')h=vDog(R);else if(v==='litters')h=vLitters();
  else if(v==='litter')h=vLitter();else if(v==='calendar')h=vCal(R);else if(v==='shows')h=vShows();else h=vSettings();
  if(['dogs','litters','calendar','shows','settings'].includes(v))h=`<button class="back" data-act="back" data-v="home">${I(IC.back)} Înapoi</button>`+h;
  $('#view').innerHTML=h;hydrate();
}
function hydrate(){document.querySelectorAll('img[data-photo]').forEach(async img=>{const d=await Store.getPhoto(img.dataset.photo);if(d){img.src=d;img.hidden=false;const ph=img.nextElementSibling;if(ph&&ph.classList.contains('ph'))ph.remove()}})}
function avatar(dog,cls=''){return `<span class="av ${cls}" style="--h:${hue(dog.name+dog.breed)}">${dog.photoId?`<img data-photo="${esc(dog.photoId)}" alt="" hidden><span class="ph">${esc((dog.name||'?')[0])}</span>`:esc((dog.name||'?')[0])}</span>`}
const sexSym=s=>s==='F'?'<span class="sex F">♀</span>':s==='M'?'<span class="sex M">♂</span>':'<span class="sex">?</span>';

/* home */
function vHome(R){
  const T=today(),hr=new Date().getHours();const hi=hr<11?'Bună dimineața':hr<18?'Bună ziua':'Bună seara';
  const urgent=R.filter(r=>diff(T,r.due)<=14);
  const preg=S.litters.filter(L=>!L.whelped&&L.matings?.length&&diff(L.matings[0],T)<=75);
  const nests=S.litters.filter(L=>L.whelped&&diff(L.whelped,T)<=90);
  const own=S.dogs.filter(d=>d.status==='activ');const pups=nests.reduce((a,L)=>a+L.puppies.length,0);
  const yr=String(new Date().getFullYear());const wins=S.dogs.reduce((a,d)=>a+(d.shows||[]).filter(s=>s.date.startsWith(yr)).length,0);
  const late=R.filter(r=>diff(T,r.due)<0).length;
  let h=S.sample?`<div class="banner"><p><b>Canisă exemplu.</b> Datele de mai jos sunt demonstrative. Tot ce adaugi sau modifici se salvează privat, doar pentru tine.</p><button class="btn sm" data-act="clearSample">Pornește cu o canisă goală</button></div>`:'';
  if(!S.dogs.length)return h+`<div class="hello"><p class="eyebrow">${FW.format(new Date())}</p><h1>${hi}${S.kennel.owner?', '+esc(S.kennel.owner):''}</h1></div>
    <div class="panel empty big"><h3>Începe cu primul câine</h3><p>Adaugă datele din pedigree, microcipul și vaccinurile. Afix îți amintește apoi de rapeluri, deparazitări și călduri.</p><p style="margin-top:16px;justify-content:center" class="row-actions"><button class="btn" data-act="claim">Am un cod de la crescător</button><button class="btn primary" data-act="addDog">${I(IC.plus)} Adaugă un câine</button></p></div>`;
  const heroDog=S.dogs.find(d=>d.photoId);const heroImg=S.sample?'smp-hero':heroDog?.photoId;
  const attn=new Set([...REM.values()].filter(r=>r.dogId&&diff(T,r.due)<=3).map(r=>r.dogId));
  h+=`<section class="hero">${heroImg?`<img data-photo="${esc(heroImg)}" alt="" hidden>`:''}<div class="in"><p class="eyebrow">${FW.format(new Date())}</p><h1>${hi}${S.kennel.owner?', '+esc(S.kennel.owner):''}</h1>${S.kennel.name?`<p class="kn">${esc(S.kennel.name)}</p>`:''}
  <div class="facts"><span class="glass"><b>${own.length}</b> câini activi</span>${preg.length?`<span class="glass"><b>${preg.length}</b> ${preg.length===1?'gestație':'gestații'}</span>`:''}${pups?`<span class="glass"><b>${pups}</b> pui</span>`:''}<span class="glass"><b>${wins}</b> rezultate în ${yr}</span>${late?`<span class="glass bad"><b>${late}</b> ${late===1?'întârziere':'întârzieri'}</span>`:''}</div></div></section>
  <div class="stories">${own.map(d=>`<button class="story${attn.has(d.id)?' alert':''}" data-act="dog" data-id="${d.id}"><span class="ringw">${avatar(d)}</span>${esc(d.name)}</button>`).join('')}<button class="story add" data-act="addDog"><span class="ringw"><span class="av">${I(IC.plus)}</span></span>Adaugă</button></div>
  <div class="grid2"><section class="panel"><div class="sec-h"><h2>De făcut în următoarele 14 zile</h2><button class="btn sm ghost" data-act="nav" data-v="calendar">Tot calendarul</button></div>
  <div class="rems">${urgent.length?urgent.map(r=>remRow(r)).join(''):'<p class="empty">Nimic urgent. Toate vaccinurile și deparazitările sunt la zi.</p>'}</div></section>
  <div class="stack">${preg.map(pregCard).join('')}${nests.map(nestCard).join('')}
  ${!preg.length&&!nests.length&&!isOwnerRole()?`<div class="panel"><h2>Nicio gestație activă</h2><p class="muted" style="margin:6px 0 12px">Înregistrează o montă și Afix calculează data fătării și pașii până atunci.</p><button class="btn" data-act="addLitter">${I(IC.plus)} Montă nouă</button></div>`:''}</div></div>`;
  return h;
}
function ring(pct,big,small){return `<div class="ringp" style="--p:${pct.toFixed(1)}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="bgc" cx="32" cy="32" r="28"/><circle class="fg" cx="32" cy="32" r="28" pathLength="100"/></svg><div class="c"><b>${big}</b><small>${small}</small></div></div>`}
function pairAv(L){const dam=dogById(L.damId),sire=dogById(L.sireId);return `<div class="pair">${dam?avatar(dam):''}${sire?avatar(sire):`<span class="av" style="--h:${hue(L.sireExt||'x')}">${esc((L.sireExt||'?').replace(/^(Multi |Ch\. |Grand )+/,'')[0]||'?')}</span>`}</div>`}
function pregCard(L){const T=today(),dam=dogById(L.damId),day=diff(L.matings[0],T),due=addDays(L.matings[0],63),left=63-day;
  return `<button class="card" data-act="litter" data-id="${L.id}"><div class="cardrow"><div>${pairAv(L)}<p class="eyebrow">Gestație · ziua ${day} din ~63</p><h3>${esc(dam?.name||'—')} × ${esc(sireName(L))}</h3></div>
  ${ring(Math.min(100,Math.max(0,day/63*100)),left>0?left:0,left>0?'zile rămase':'iminent')}</div>
  <div class="track"><div class="fill" style="width:${Math.min(100,Math.max(0,day/63*100))}%"></div>${PREG.map(m=>`<i class="${day>=m.day?'past':''}" style="left:${m.day/63*100}%"></i>`).join('')}</div>
  <p class="muted" style="font-size:13px">Fătare estimată <b style="color:var(--ink)">${fmt(due)}</b> · interval normal ${fmtS(addDays(L.matings[0],58))} – ${fmtS(addDays(L.matings[0],68))}</p></button>`}
function nestCard(L){const T=today(),dam=dogById(L.damId),age=diff(L.whelped,T),m=L.puppies.filter(p=>p.sex==='M').length,f=L.puppies.filter(p=>p.sex==='F').length;
  return `<button class="card" data-act="litter" data-id="${L.id}"><div class="cardrow"><div>${pairAv(L)}<p class="eyebrow">Cuib · ${ageStr(L.whelped)}</p><h3>${esc(dam?.name||'—')} × ${esc(sireName(L))}</h3></div>
  <div class="count"><b>${L.puppies.length}</b><small>pui · ${m} ♂ ${f} ♀</small></div></div>
  ${L.puppies.some(p=>p.photoId)?`<div class="pair" style="margin:12px 0 0">${L.puppies.filter(p=>p.photoId).slice(0,4).map(p=>`<span class="av" style="--h:${collarC(p.collar)};box-shadow:0 0 0 2px ${collarC(p.collar)}"><img data-photo="${esc(p.photoId)}" alt="" hidden><span class="ph"></span></span>`).join('')}</div>`:''}
  ${L.puppies.some(p=>p.weights?.length>1)?`<div class="chartbox mini">${weightChart(L,true)}</div>`:''}
  <div class="collars">${L.puppies.map(p=>`<span class="collar" style="--c:${collarC(p.collar)}" title="${esc(p.collar)}"></span>`).join('')}</div></button>`}

/* weight chart */
function weightChart(L,mini){
  const pups=L.puppies.filter(p=>p.weights?.length);if(!pups.length)return '';
  const W=mini?400:360,Hh=mini?110:250,pl0=mini?4:40,pr=mini?4:10,pt=mini?6:10,pb=mini?6:26;
  let maxD=7,maxG=500;for(const p of pups)for(const w of p.weights){maxD=Math.max(maxD,diff(L.whelped,w.date));maxG=Math.max(maxG,w.g)}
  const step=maxG>4000?1000:maxG>1600?500:maxG>800?200:100;maxG=Math.ceil(maxG*1.05/step)*step;
  const x=d=>pl0+(W-pl0-pr)*d/maxD,y=g=>pt+(Hh-pt-pb)*(1-g/maxG);
  let s=`<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Curba de creștere a puilor">`;
  if(!mini){for(let g=0;g<=maxG;g+=step){s+=`<line x1="${pl0}" x2="${W-pr}" y1="${y(g)}" y2="${y(g)}" stroke="var(--line)" stroke-width="1"/><text x="${pl0-8}" y="${y(g)+4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${g>=1000?(g/1000).toString().replace('.',',')+' kg':g+' g'}</text>`}
    for(let d=0;d<=maxD;d+=7)s+=`<text x="${x(d)}" y="${Hh-8}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${d===0?'naștere':'ziua '+d}</text>`}
  for(const p of pups){const pts=[...p.weights].sort((a,b)=>a.date<b.date?-1:1).map(w=>[x(diff(L.whelped,w.date)),y(w.g)]);const c=collarC(p.collar);const stroke=p.collar==='Alb'?'var(--ink-3)':p.collar==='Negru'?'var(--ink)':c;
    s+=`<polyline points="${pts.map(q=>q.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${mini?1.6:2}" stroke-linejoin="round" stroke-linecap="round"${p.collar==='Alb'?' stroke-dasharray="4 3"':' class="ln" pathLength="1"'}/>`;
    const e=pts[pts.length-1];if(!mini)s+=`<circle cx="${e[0]}" cy="${e[1]}" r="3.6" fill="${stroke}" stroke="var(--surface)" stroke-width="1.5"/>`}
  return s+'</svg>'}
function pupStats(p,L){const ws=[...(p.weights||[])].sort((a,b)=>a.date<b.date?-1:1);const last=ws[ws.length-1],prev=ws[ws.length-2];
  const bw=Number(p.birthWeight)||ws[0]?.g;let flag='',delta='';
  if(last&&prev){const dd=Math.max(1,diff(prev.date,last.date));const per=(last.g-prev.g)/dd;delta=(per>=0?'+':'')+Math.round(per)+' g/zi';
    const age=diff(L.whelped,last.date);
    if(last.g<prev.g&&(age>2||(bw&&last.g<bw*0.9)))flag='<span class="pill bad">Scădere în greutate</span>';}
  if(last&&bw){const age=diff(L.whelped,last.date);if(age>=10&&age<=16&&last.g<bw*2)flag+='<span class="pill warn">Nu și-a dublat greutatea</span>'}
  return {last,prev,delta,flag,mult:last&&bw?(last.g/bw).toFixed(1).replace('.',','):null}}

/* dogs */
function vDogs(){
  const f=ui.filter;const list=S.dogs.filter(d=>f==='all'?d.status==='activ':f==='F'||f==='M'?d.sex===f&&d.status==='activ':d.status!=='activ');
  const fc=(k,l)=>`<button class="fchip" data-act="filter" data-f="${k}" aria-pressed="${f===k}">${l}</button>`;
  return `<div class="vh"><div><h1>Câinii mei</h1><p class="sub">${S.dogs.filter(d=>d.status==='activ').length} activi${S.kennel.name?' în '+esc(S.kennel.name):''}</p></div><div class="row-actions"><button class="btn" data-act="claim">Am un cod de transfer</button><button class="btn primary" data-act="addDog">${I(IC.plus)} Adaugă câine</button></div></div>
  <div class="filters">${fc('all','Toți activi')}${fc('F','Femele')}${fc('M','Masculi')}${fc('out','Retrași / plecați')}</div>
  ${list.length?`<div class="dogs">${list.map((d,i)=>dogCard(d,i)).join('')}</div>`:'<div class="panel empty">Niciun câine în această listă.</div>'}`}
function dogCard(d,i=0){const late=[...REM.values()].filter(r=>r.dogId===d.id&&diff(today(),r.due)<0).length;
  const pills=[];if(isPregnant(d)){const L=S.litters.find(L=>L.damId===d.id&&!L.whelped);pills.push(`<span class="pill acc">Gestantă · ziua ${diff(L.matings[0],today())}</span>`)}
  const nest=S.litters.find(L=>L.damId===d.id&&L.whelped&&diff(L.whelped,today())<=60);if(nest)pills.push(`<span class="pill acc">Alăptează ${nest.puppies.length} pui</span>`);
  if(d.titles)pills.push(`<span class="pill gold">${esc(d.titles.split(',')[0])}</span>`);
  if(d.status!=='activ')pills.push(`<span class="pill">${esc(d.status)}</span>`);
  const sx=d.sex==='F'?'♀ Femelă':d.sex==='M'?'♂ Mascul':'';
  return `<button class="dcard" data-act="dog" data-id="${d.id}" style="--i:${i}"><div class="dphoto" style="--h:${hue(d.name+d.breed)}">${d.photoId?`<img data-photo="${esc(d.photoId)}" alt="${esc(d.name)}" hidden>`:`<span class="ini">${esc((d.name||'?')[0])}</span>`}<span class="shade"></span>
  <div class="dtop">${sx?`<span class="glass">${sx}</span>`:'<span></span>'}${late?`<span class="glass bad">${late} ${late===1?'întârziere':'întârzieri'}</span>`:''}</div>
  <div class="dname"><b>${esc(d.name)}</b><span>${esc(d.regName||d.breed||'')}</span></div></div>
  <div class="dmeta"><span>${esc(d.breed||'')}${d.dob?' · '+ageStr(d.dob):''}</span>${pills.length?`<div class="pills">${pills.join('')}</div>`:''}</div></button>`}

function vDog(R){const d=dogById(ui.dogId);if(!d){ui.view='dogs';return vDogs()}
  const tabs=[['profil','Profil'],['sanatate','Sănătate'],['expo','Expoziții'],['repro','Reproducție'],['docs','Documente']];
  const pills=[];if(isPregnant(d))pills.push('<span class="pill acc">Gestantă</span>');(d.titles||'').split(',').filter(Boolean).forEach(t=>pills.push(`<span class="pill gold">${esc(t.trim())}</span>`));
  let h=`<button class="back" data-act="back" data-v="dogs">${I(IC.back)} Câinii mei</button>
  <div class="dhero" style="--h:${hue(d.name+d.breed)}">${d.photoId?`<img class="bgimg" data-photo="${esc(d.photoId)}" alt="" hidden>`:''}
  <button class="ph-btn" data-act="dogPhoto" aria-label="Schimbă fotografia"><span class="big">${d.photoId?`<img data-photo="${esc(d.photoId)}" alt="${esc(d.name)}" hidden><span class="ph">${esc((d.name||'?')[0])}</span>`:esc((d.name||'?')[0])}</span><span class="cam">${I(IC.cam)}</span></button>
  <div><p class="eyebrow" style="color:rgba(255,255,255,.75)">${esc(d.breed||'')}${d.dob?' · '+ageStr(d.dob):''}</p><h1>${esc(d.name)} ${sexSym(d.sex)}</h1><p class="rn">${esc(d.regName||'')}</p>${d.color?`<p class="sub">${esc(d.color)}</p>`:''}${pills.length?`<div class="pills">${pills.join('')}</div>`:''}</div></div>
  <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${ui.tab===k}" data-act="tab" data-t="${k}">${l}</button>`).join('')}</div>`;
  const t=ui.tab;
  if(t==='profil')h+=dogProfil(d);else if(t==='sanatate')h+=dogHealth(d,R);else if(t==='expo')h+=dogShows(d);else if(t==='repro')h+=dogRepro(d);else h+=dogDocs(d);
  return h}
function dogProfil(d){const row=(k,v,cls='')=>`<div><dt>${k}</dt><dd class="${cls}">${v||'—'}</dd></div>`;
  const chip=String(d.chip||'').replace(/\D/g,'');
  return `<div class="cert"><div class="cert-top"><div><p class="eyebrow">Fișa de identitate</p><h2>${esc(d.regName||d.name)}</h2></div><button class="btn sm" data-act="editDog">${I(IC.edit)} Editează</button></div>
  <dl class="dl">${row('Microcip',`<span class="chipno">${fmtChip(d.chip)}</span>${chip.startsWith('642')&&chip.length===15?' <span class="pill" style="margin-left:4px">RO</span>':''}`)}${row('Nr. pedigree / registru',esc(d.pedigreeNo),'mono')}${row('Pașaport',esc(d.passport),'mono')}${row('Tatuaj',esc(d.tattoo),'mono')}
  ${row('Data nașterii',d.dob?fmt(d.dob)+' <span class="muted">('+ageStr(d.dob)+')</span>':'')}${row('Sex',d.sex==='F'?'Femelă':d.sex==='M'?'Mascul':'')}${row('Culoare',esc(d.color))}${row('Rasă',esc(d.breed))}
  ${row('Crescător',esc(d.breeder))}${row('Proprietar',esc(d.owner||S.kennel.owner))}${row('Titluri',esc(d.titles))}${row('Statut',esc(d.status))}</dl>
  <div class="lineage"><div class="M"><dt class="eyebrow">Tată</dt><dd style="margin:2px 0 0;font-weight:500">${esc(d.sire||'—')}</dd></div><div class="F"><dt class="eyebrow">Mamă</dt><dd style="margin:2px 0 0;font-weight:500">${esc(d.dam||'—')}</dd></div></div>
  ${d.notes?`<p style="margin-top:18px;position:relative;max-width:65ch;color:var(--ink-2)">${esc(d.notes)}</p>`:''}</div>${originCard(d)}`}
function originCard(d){const o=d.origin;if(!o)return '';const k=o.kennel||{};
  return `<section class="panel origin" style="margin-top:16px"><p class="eyebrow">Primit prin Afix · ${fmt(o.transferredAt)}</p><h2 style="margin-top:4px">De la ${esc(k.name||'crescător')}</h2>
  <dl class="dl" style="margin-top:12px">${k.owner?`<div><dt>Crescător</dt><dd>${esc(k.owner)}</dd></div>`:''}${k.city?`<div><dt>Localitate</dt><dd>${esc(k.city)}</dd></div>`:''}${k.phone?`<div><dt>Telefon</dt><dd class="mono" style="user-select:all">${esc(k.phone)}</dd></div>`:''}${k.email?`<div><dt>E-mail</dt><dd style="user-select:all">${esc(k.email)}</dd></div>`:''}${k.club?`<div><dt>Club</dt><dd>${esc(k.club)}</dd></div>`:''}
  ${o.food?`<div><dt>Hrana actuală</dt><dd>${esc(o.food)}</dd></div>`:''}${o.feeding?`<div><dt>Rația zilnică</dt><dd>${esc(o.feeding)}</dd></div>`:''}</dl>
  ${(o.parentTests||[]).length?`<p style="margin-top:14px;font-size:14px"><b>Testele părinților:</b> <span class="muted">${o.parentTests.map(esc).join(' · ')}</span></p>`:''}
  ${o.message?`<blockquote>${esc(o.message)}</blockquote>`:''}</section>`}
function dogHealth(d,R){const mine=R.filter(r=>r.dogId===d.id&&r.type!=='heat');
  const sec=kind=>{const items=(d.health||[]).filter(h=>h.kind===kind).sort((a,b)=>a.date<b.date?1:-1);
    return `<section class="panel"><div class="sec-h"><h2>${HEALTH[kind].plural}</h2><button class="btn sm" data-act="addHealth" data-k="${kind}">${I(IC.plus)} Adaugă</button></div>
    <div class="list">${items.length?items.map(h=>`<button class="li" data-act="editHealth" data-id="${h.id}"><span class="date">${fmt(h.date)}</span><span><span class="t">${esc(h.sub)}</span>${h.result?` · <b>${esc(h.result)}</b>`:''}<br><span class="s">${esc(h.product||'')}${h.notes?' · '+esc(h.notes):''}</span></span>${h.next?`<span class="pill ${stat(h.next)==='late'?'bad':stat(h.next)==='later'?'':'warn'}">următorul ${fmtS(h.next)}</span>`:'<span></span>'}</button>`).join(''):'<p class="empty">Nimic înregistrat încă.</p>'}</div></section>`};
  const ws=[...(d.weights||[])].sort((a,b)=>a.date<b.date?-1:1);
  return `${mine.length?`<section class="panel"><div class="sec-h"><h2>Urmează</h2></div><div class="rems">${mine.map(r=>remRow(r,false)).join('')}</div></section>`:''}
  ${sec('vaccin')}${sec('depInt')}${sec('depExt')}${sec('test')}${sec('vet')}
  <section class="panel"><div class="sec-h"><h2>Greutate</h2><button class="btn sm" data-act="addWeight">${I(IC.plus)} Cântărire</button></div>
  ${ws.length>1?`<div class="chartbox mini">${sparkKg(ws)}</div>`:''}
  <div class="list">${ws.length?[...ws].reverse().map((w,i)=>`<button class="li" data-act="editWeight" data-i="${ws.length-1-i}"><span class="date">${fmt(w.date)}</span><span class="t">${fmtKg(w.kg)}</span><span></span></button>`).join(''):'<p class="empty">Nicio cântărire.</p>'}</div></section>`}
function sparkKg(ws){const W=600,H=90,p=8;const ks=ws.map(w=>Number(w.kg));let mn=Math.min(...ks),mx=Math.max(...ks);if(mx-mn<1){mn-=.5;mx+=.5}
  const t0=pd(ws[0].date),t1=pd(ws[ws.length-1].date);const x=d=>p+(W-2*p)*((pd(d)-t0)/Math.max(1,t1-t0)),y=k=>p+(H-2*p-14)*(1-(k-mn)/(mx-mn));
  const pts=ws.map(w=>`${x(w.date).toFixed(1)},${y(w.kg).toFixed(1)}`).join(' ');const e=ws[ws.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evoluția greutății"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/><circle cx="${x(e.date)}" cy="${y(e.kg)}" r="4" fill="var(--accent)"/><text x="${p}" y="${H-2}" font-size="11" fill="var(--ink-3)">${fmtS(ws[0].date)}</text><text x="${W-p}" y="${H-2}" font-size="11" text-anchor="end" fill="var(--ink-3)">${fmtKg(e.kg)} · ${fmtS(e.date)}</text></svg>`}
function tally(shows){const c={};for(const s of shows)for(const t of s.titles||[])c[t]=(c[t]||0)+1;const order=SHOW_TITLES.filter(t=>c[t]);
  return order.length?`<div class="tally">${order.map(t=>`<span><b>${c[t]}</b>${esc(t)}</span>`).join('')}</div>`:''}
function showRow(s,dog){return `<button class="li" data-act="editShow" data-id="${s.id}" data-dog="${dog.id}"><span class="ribbon ${s.place==='1'?'p1':''}">${esc(s.place||'—')}</span>
  <span><span class="t">${esc(s.name)}</span>${dog&&ui.view==='shows'?` · <b>${esc(dog.name)}</b>`:''}<br><span class="s">${fmt(s.date)} · ${esc(s.cls||'')} · ${esc(s.grade||'')}${s.judge?' · arbitru '+esc(s.judge):''}</span></span>
  <span class="pills" style="justify-content:flex-end">${(s.titles||[]).map(t=>`<span class="pill gold">${esc(t)}</span>`).join('')}</span></button>`}
function dogShows(d){const shows=[...(d.shows||[])].sort((a,b)=>a.date<b.date?1:-1);
  return `<section class="panel"><div class="sec-h"><h2>Rezultate în ring</h2><button class="btn sm" data-act="addShow">${I(IC.plus)} Rezultat nou</button></div>${tally(shows)}
  <div class="list">${shows.length?shows.map(s=>showRow(s,d)).join(''):'<p class="empty">Niciun rezultat. Adaugă primul concurs.</p>'}</div></section>`}
function dogRepro(d){
  if(d.sex==='M'){const ls=S.litters.filter(L=>L.sireId===d.id);
    return `<section class="panel"><div class="sec-h"><h2>Monte și cuiburi</h2><button class="btn sm" data-act="addLitter">${I(IC.plus)} Montă nouă</button></div><div class="list">${ls.length?ls.map(litRow).join(''):'<p class="empty">Nicio montă înregistrată.</p>'}</div></section>`}
  const hs=[...(d.heats||[])].sort((a,b)=>a.start<b.start?1:-1);const ls=S.litters.filter(L=>L.damId===d.id);
  const next=hs[0]?addDays(hs[0].start,Number(d.heatInterval||S.kennel.heatInterval||180)):null;
  return `<section class="panel"><div class="sec-h"><h2>Călduri</h2><button class="btn sm" data-act="addHeat">${I(IC.plus)} Călduri noi</button></div>
  ${next&&!isPregnant(d)?`<p style="margin-bottom:8px">Următoarele călduri estimate: <b>${fmt(next)}</b> <span class="muted">(${rel(next)}, interval ${d.heatInterval||S.kennel.heatInterval||180} zile)</span></p>`:''}
  <div class="list">${hs.length?hs.map(x=>`<button class="li" data-act="editHeat" data-id="${x.id}"><span class="date">${fmt(x.start)}</span><span><span class="t">${x.end?pl(diff(x.start,x.end)+1,'zi','zile'):'în curs'}</span>${x.prog?`<br><span class="s">Progesteron: ${esc(x.prog)}</span>`:''}${x.notes?`<br><span class="s">${esc(x.notes)}</span>`:''}</span><span></span></button>`).join(''):'<p class="empty">Nicio perioadă de călduri notată.</p>'}</div></section>
  <section class="panel"><div class="sec-h"><h2>Gestații și cuiburi</h2><button class="btn sm" data-act="addLitter">${I(IC.plus)} Montă nouă</button></div><div class="list">${ls.length?ls.map(litRow).join(''):'<p class="empty">Niciun cuib încă.</p>'}</div></section>`}
function litRow(L){const dam=dogById(L.damId);return `<button class="li" data-act="litter" data-id="${L.id}"><span class="date">${fmt(L.whelped||L.matings?.[0])}</span><span><span class="t">${esc(dam?.name||'—')} × ${esc(sireName(L))}</span><br><span class="s">${L.whelped?pl(L.puppies.length,'pui','pui')+' · născuți '+fmt(L.whelped):'gestație · fătare estimată '+fmt(addDays(L.matings[0],63))}</span></span><span class="pill ${L.whelped?'':'acc'}">${L.whelped?'născut':'gestație'}</span></button>`}
function dogDocs(d){const docs=d.docs||[];
  return `<section class="panel"><div class="sec-h"><h2>Documente și fotografii</h2></div><p class="muted" style="margin:-4px 0 14px;max-width:62ch">Pedigree (față și verso), pașaport, certificate de campion, rezultate HD/ED, contracte. Le ai la tine la orice expoziție sau control.</p>
  <div class="docs">${docs.map(x=>`<button class="doc" data-act="viewDoc" data-id="${x.id}"><div class="thumb"><img data-photo="${esc(x.photoId)}" alt="${esc(x.label)}" hidden><span class="ph muted">${I(IC.doc)}</span></div><div class="cap">${esc(x.label)}<small>${fmt(x.date)}</small></div></button>`).join('')}
  <button class="adddoc" data-act="addDoc">${I(IC.cam)}<span>Adaugă document</span></button></div></section>`}

/* litters */
function vLitters(){const ls=[...S.litters].sort((a,b)=>(b.whelped||b.matings?.[0]||'')<(a.whelped||a.matings?.[0]||'')?-1:1);
  return `<div class="vh"><div><h1>Cuiburi</h1><p class="sub">Monte, gestații, fătări și creșterea fiecărui pui</p></div><button class="btn primary" data-act="addLitter">${I(IC.plus)} Montă nouă</button></div>
  ${ls.length?`<div class="dogs">${ls.map(L=>L.whelped?nestCard(L):pregCard(L)).join('')}</div>`:'<div class="panel empty big"><h3>Niciun cuib încă</h3><p>Înregistrează o montă: Afix calculează ziua fătării și îți amintește de ecografie, radiografie și temperatura femelei.</p></div>'}`}
function vLitter(){const L=litterById(ui.litterId);if(!L){ui.view='litters';return vLitters()}
  const T=today(),dam=dogById(L.damId);
  let h=`<button class="back" data-act="back" data-v="litters">${I(IC.back)} Cuiburi</button>
  <div class="vh"><div><p class="eyebrow">${L.whelped?'Cuib născut '+fmt(L.whelped)+' · '+ageStr(L.whelped):'Gestație · ziua '+diff(L.matings[0],T)}</p><h1>${esc(dam?.name||'—')} × ${esc(sireName(L))}</h1>
  <p class="sub">Monte: ${(L.matings||[]).map(fmt).join(', ')}${L.notes?' · '+esc(L.notes):''}</p></div>
  <div class="row-actions"><button class="btn" data-act="editLitter">${I(IC.edit)} Editează</button>${L.whelped?`<button class="btn" data-act="addPuppy">${I(IC.plus)} Pui</button><button class="btn primary" data-act="weigh" data-id="${L.id}">${I(IC.scale)} Cântărire</button>`:`<button class="btn primary" data-act="whelp" data-id="${L.id}">Înregistrează fătarea</button>`}</div></div>`;
  const tasks=(L.whelped?PUPT:PREG).map(m=>{const key='L:'+L.id+':'+m.k,due=addDays(L.whelped||L.matings[0],m.day),dn=S.done[key];
    return `<li class="${dn?'done':''}"><button class="check ${dn?'on':''}" data-act="task" data-key="${key}" aria-label="Bifează">${I(IC.check)}</button><span class="t">${esc(m.t)}</span><span class="d">${dn?'făcut '+fmtS(dn):fmtS(due)+(!dn&&diff(T,due)<0?' <b style="color:var(--bad)">!</b>':'')}</span></li>`}).join('');
  if(!L.whelped){const day=diff(L.matings[0],T);
    h+=`<div class="grid2"><section class="panel"><div class="cardrow"><div><p class="eyebrow">Fătare estimată</p><h2 style="font-size:28px">${fmt(addDays(L.matings[0],63))}</h2><p class="muted">interval normal ${fmt(addDays(L.matings[0],58))} – ${fmt(addDays(L.matings[0],68))}</p></div><div class="count"><b>${Math.max(0,63-day)}</b><small>zile rămase</small></div></div>
    <div class="track"><div class="fill" style="width:${Math.min(100,day/63*100)}%"></div>${PREG.map(m=>`<i class="${day>=m.day?'past':''}" style="left:${m.day/63*100}%"></i>`).join('')}</div>
    <p class="muted" style="font-size:13px;margin-top:10px;max-width:60ch">Durata gestației se calculează de la prima montă. Dacă ai data ovulației din testul de progesteron, fătarea are loc de obicei la 63 de zile (±1) de la ovulație.</p></section>
    <section class="panel"><h2>Pașii gestației</h2><ul class="milestones">${tasks}</ul></section></div>`;return h}
  const pups=L.puppies;const lastW=pups.map(p=>pupStats(p,L).last?.g).filter(Boolean);const avg=lastW.length?lastW.reduce((a,b)=>a+b,0)/lastW.length:null;
  h+=`<section class="panel"><div class="kv"><div><small>Pui</small><b>${pups.length}</b></div><div><small>Masculi / femele</small><b>${pups.filter(p=>p.sex==='M').length} / ${pups.filter(p=>p.sex==='F').length}</b></div><div><small>Greutate medie azi</small><b>${fmtG(avg)}</b></div><div><small>Rezervați / vânduți</small><b>${pups.filter(p=>p.status==='Rezervat').length} / ${pups.filter(p=>p.status==='Vândut').length}</b></div></div>
  ${pups.some(p=>p.weights?.length>1)?`<div class="sec-h" style="margin-top:18px"><h2>Curba de creștere</h2><span class="muted" style="font-size:13px">ultima cântărire ${fmt(lastWeigh(L))}</span></div><div class="chartbox">${weightChart(L)}</div>
  <div class="legend">${pups.map(p=>`<span><span class="collar" style="--c:${collarC(p.collar)}"></span>${esc(p.collar)}${p.name?' · '+esc(p.name):''}</span>`).join('')}</div>`:''}</section>
  <div class="sec-h" style="margin-top:22px"><h2>Puii</h2><button class="btn sm" data-act="addPuppy">${I(IC.plus)} Adaugă pui</button></div>
  ${pups.length?`<div class="pups">${pups.map(p=>{const st=pupStats(p,L);return `<button class="pup" data-act="editPuppy" data-id="${p.id}">${p.photoId?`<span class="pupav" style="--c:${collarC(p.collar)}"><img data-photo="${esc(p.photoId)}" alt="" hidden></span>`:`<span class="collar lg" style="--c:${collarC(p.collar)}"></span>`}
    <div style="min-width:0"><div class="n">${esc(p.collar)}${p.name?' · '+esc(p.name):''} ${sexSym(p.sex)}</div><div class="s">${esc(p.color||'')} · la naștere ${fmtG(Number(p.birthWeight)||null)}</div></div>
    <div class="w"><b>${fmtG(st.last?.g)}</b><small class="${st.delta.startsWith('-')?'down':'up'}">${st.delta||''}${st.mult?' · ×'+st.mult:''}</small></div>
    <div class="foot"><span class="pill ${pupPill(p.status)}">${esc(p.status)}</span>${p.buyer?`<span class="pill">${esc(p.buyer)}</span>`:''}${(t=>t?`<span class="pill ${t.claimedAt?'ok':'acc'}">${t.claimedAt?'Fișă transferată':'Cod de transfer trimis'}</span>`:'')(S.transfers.find(t=>t.pupId===p.id))}${st.flag}</div></button>`}).join('')}</div>`:'<div class="panel empty">Adaugă puii cu zgărdița colorată, sexul și greutatea la naștere.</div>'}
  <section class="panel" style="margin-top:16px"><h2>Programul puilor</h2><ul class="milestones">${tasks}</ul></section>`;
  return h}

/* calendar */
function vCal(R){const T=today();const late=R.filter(r=>r.due<T);const fut=R.filter(r=>r.due>=T&&diff(T,r.due)<=365);
  const groups={};for(const r of fut){const k=r.due.slice(0,7);(groups[k]=groups[k]||[]).push(r)}
  return `<div class="vh"><div><h1>Calendar</h1><p class="sub">Vaccinuri, deparazitări, călduri, gestații și pui, calculate automat din istoric</p></div></div>
  ${late.length?`<section class="panel month"><h3 style="color:var(--bad)">Întârziate</h3><div class="rems">${late.map(r=>remRow(r)).join('')}</div></section>`:''}
  ${Object.keys(groups).length?Object.entries(groups).map(([k,rs])=>`<section class="panel month"><h3>${FM.format(pd(k+'-01'))}</h3><div class="rems">${rs.map(r=>remRow(r)).join('')}</div></section>`).join(''):'<div class="panel empty">Nimic programat. Adaugă vaccinuri și deparazitări pe fișa fiecărui câine.</div>'}`}

/* shows */
function vShows(){const all=[];for(const d of S.dogs)for(const s of d.shows||[])all.push([s,d]);all.sort((a,b)=>a[0].date<b[0].date?1:-1);
  const yr=String(new Date().getFullYear());const thisYr=all.filter(([s])=>s.date.startsWith(yr)).map(x=>x[0]);
  return `<div class="vh"><div><h1>Expoziții</h1><p class="sub">Toate rezultatele canisei, cu titlurile câștigate</p></div><button class="btn primary" data-act="addShowAny">${I(IC.plus)} Rezultat nou</button></div>
  <section class="panel"><div class="sec-h"><h2>Titluri în ${yr}</h2></div>${tally(thisYr)||'<p class="muted">Niciun titlu anul acesta.</p>'}</section>
  <section class="panel"><div class="sec-h"><h2>Istoric</h2></div><div class="list">${all.length?all.map(([s,d])=>showRow(s,d)).join(''):'<p class="empty">Niciun rezultat.</p>'}</div></section>`}

/* settings */
function vSettings(){const k=S.kennel;
  const own=isOwnerRole();const trs=[...(S.transfers||[])].reverse();
  return `<div class="vh"><div><h1>Setări</h1><p class="sub">Contul, ${own?'':'canisa, transferurile '}și datele tale</p></div></div>
  <section class="panel"><div class="sec-h"><h2>Contul tău</h2></div>${whoRow()}
  <p class="muted" style="font-size:13.5px;margin:10px 0 12px">${own?'Proprietar':'Crescător'} din ${fmt(S.account?.since)}. ${Store.mode==='cloud'?'Intri cu un cod primit pe e-mail; Afix nu folosește parole.':'Nu ești conectat la un cont: datele stau doar în acest browser.'}</p>
  <div class="row-actions"><button class="btn" data-act="role" data-r="${own?'breeder':'owner'}" data-switch="1">Treci pe profil de ${own?'crescător':'proprietar'}</button><button class="btn ghost" data-act="logout">Ieși din cont</button></div></section>
  ${own?'':`<section class="panel"><div class="sec-h"><h2>${esc(k.name||'Canisa mea')}</h2><button class="btn sm" data-act="editKennel">${I(IC.edit)} Editează</button></div>
  <dl class="dl" style="margin-top:4px"><div><dt>Afix</dt><dd>${esc(k.affix||'—')}</dd></div><div><dt>Crescător</dt><dd>${esc(k.owner||'—')}</dd></div><div><dt>Localitate</dt><dd>${esc(k.city||'—')}</dd></div><div><dt>Club</dt><dd>${esc(k.club||'—')}</dd></div><div><dt>Telefon</dt><dd>${esc(k.phone||'—')}</dd></div><div><dt>E-mail</dt><dd>${esc(k.email||'—')}</dd></div><div><dt>Interval călduri implicit</dt><dd>${k.heatInterval||180} zile</dd></div></dl></section>
  <section class="panel"><div class="sec-h"><h2>Transferuri către proprietari</h2><span class="pill acc">${PRICE} lei / cățel</span></div>
  <p class="muted" style="font-size:13.5px;margin:-2px 0 10px;max-width:62ch">Din fișa unui pui din cuib alegi „Transferă fișa”. Noul proprietar primește un cod și, după activare, are în telefon tot istoricul cățelului.</p>
  <div class="list">${trs.length?trs.map(t=>`<button class="li" data-act="showCode" data-code="${esc(t.code)}"><span class="date">${fmt(t.createdAt)}</span><span><span class="t">${esc(t.label)}</span><br><span class="s mono">${esc(t.code)} · plătește ${t.payer==='breeder'?'crescătorul':'proprietarul'}</span></span><span class="pill ${t.claimedAt?'ok':'warn'}">${t.claimedAt?'activat '+fmtS(t.claimedAt.slice(0,10)):'în așteptare'}</span></button>`).join(''):'<p class="empty">Niciun transfer încă.</p>'}</div></section>`}
  <section class="panel"><h2>Datele tale</h2>
  <div class="setting-row"><p><b>Unde se salvează</b>${Store.mode==='cloud'?'În contul tău Afix, pe servere din Uniunea Europeană. Le vezi doar tu, de pe orice telefon pe care intri în cont.':'Doar în acest browser, pe acest dispozitiv.'}</p></div>
  <div class="setting-row"><p><b>Copie de siguranță</b>Descarcă toate datele, inclusiv fotografiile, într-un fișier JSON.</p><button class="btn" data-act="export">Exportă</button></div>
  <div class="setting-row"><p><b>Restaurează</b>Încarcă un fișier exportat anterior. Înlocuiește datele actuale.</p><button class="btn" data-act="import">Importă</button></div>
  <div class="setting-row"><p><b>${S.sample?'Canisa exemplu':'Șterge tot'}</b>${S.sample?'Înlocuiește datele demonstrative cu o canisă goală.':'Șterge toți câinii, cuiburile și rezultatele.'}</p><button class="btn danger" data-act="clearSample">${S.sample?'Pornește de la zero':'Șterge datele'}</button></div>
  ${!S.sample?'<div class="setting-row"><p><b>Vezi exemplul</b>Încarcă din nou canisa demonstrativă.</p><button class="btn" data-act="loadSample">Încarcă exemplul</button></div>':''}</section>`}
