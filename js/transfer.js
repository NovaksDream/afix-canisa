'use strict';
/* ---------- puppy transfer ---------- */
const PRICE=19;
const APP_URL='https://claude.ai/artifact/MbBFEnWLtz7v4MisvnkP2a';
const CODE_AB='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function genCode(){const r=crypto.getRandomValues(new Uint8Array(8));let s='';for(const b of r)s+=CODE_AB[b%CODE_AB.length];return 'AFX-'+s.slice(0,4)+'-'+s.slice(4)}
const normCode=v=>{let s=String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!s.startsWith('AFX'))s='AFX'+s;return s};
const fmtCode=s=>s.slice(0,3)+'-'+s.slice(3,7)+'-'+s.slice(7,11);
const te=new TextEncoder(),td=new TextDecoder();
const b64=buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function codeKeys(code){const base=await crypto.subtle.importKey('raw',te.encode(normCode(code)),'PBKDF2',false,['deriveKey','deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:te.encode('afix-transfer-id-v1'),iterations:150000,hash:'SHA-256'},base,128);
  const id=[...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('afix-transfer-key-v1'),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  return {id,key}}
async function seal(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12));return {iv:b64(iv),ct:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(obj))))}}
/* Transfer storage: Supabase table "transfers" (read and claimed only through
   the get_transfer / claim_transfer functions), or this browser when offline. */
const TR={
  get cloud(){return Store.mode==='cloud'},
  async put(id,doc){
    if(this.cloud){const {error}=await Store.sb.from('transfers').insert({id,ciphertext:doc.ct,iv:doc.iv,payer:doc.payer,created_by:Store.user.id});if(error)throw error;return}
    localStorage.setItem('afix-tr-'+id,JSON.stringify(doc))},
  async get(id){
    if(this.cloud){const {data,error}=await Store.sb.rpc('get_transfer',{p_id:id});if(error)throw error;const r=Array.isArray(data)?data[0]:data;
      return r?{ct:r.ciphertext,iv:r.iv,payer:r.payer,paid:r.paid,claimedAt:r.claimed_at}:null}
    try{const r=localStorage.getItem('afix-tr-'+id);return r?JSON.parse(r):null}catch(e){return null}},
  async mark(id,patch){
    if(this.cloud){const {data,error}=await Store.sb.rpc('claim_transfer',{p_id:id});if(error)throw error;
      if(!data)throw {msg:'Activarea nu a fost permisă: codul a fost deja folosit sau plata nu a fost confirmată.'};return}
    const d=await this.get(id);if(d)localStorage.setItem('afix-tr-'+id,JSON.stringify(Object.assign(d,patch)))}
};
async function buildPackage(L,p,o){const dam=dogById(L.damId),sire=dogById(L.sireId);const dn=k=>S.done['L:'+L.id+':'+k];
  const health=[];for(const k of ['dep2','dep4','dep6','dep8'])if(dn(k))health.push({id:uid(),kind:'depInt',sub:'Suspensie',date:dn(k),next:'',product:'',notes:'Deparazitare de pui, la crescător'});
  if(dn('vac1'))health.push({id:uid(),kind:'vaccin',sub:'Polivalent (DHPPi+L)',date:dn('vac1'),next:'',product:'',notes:'Primul vaccin de pui, la crescător'});
  if(dn('chip'))health.push({id:uid(),kind:'vet',sub:'Control de rutină',date:dn('chip'),next:'',product:'',result:'Microcipare și carnet de sănătate',notes:''});
  const tests=[];const tt=(dog,who)=>{for(const h of dog?.health||[])if(h.kind==='test'&&h.result)tests.push(who+': '+h.sub.replace(/ \(.*\)/,'')+' '+h.result)};tt(sire,'Tată');tt(dam,'Mamă');
  const planned=[];if(o.nextVac)planned.push({id:uid(),due:o.nextVac,title:'Rapel vaccin de pui',sub:'programat de crescător'});
  if(o.nextDep)planned.push({id:uid(),due:o.nextDep,title:'Deparazitare internă',sub:'programată de crescător; la pui, la 2 săptămâni până la 3 luni'});
  planned.push({id:uid(),due:addDays(L.whelped,84),title:'Vaccin antirabic (de la 12 săptămâni)',sub:'obligatoriu, apoi anual'});
  let photo=p.photoId?await Store.getPhotoData(p.photoId):null;if(photo&&photo.length>150000)photo=null;
  return {v:1,createdAt:today(),payer:o.payer,newOwner:o.newOwner||'',
    pup:{name:p.name||'',collar:p.collar,sex:p.sex,color:p.color,dob:L.whelped,chip:p.chip||'',birthWeight:p.birthWeight,weights:(p.weights||[]).map(w=>({date:w.date,kg:Math.round(w.g/10)/100})),photo},
    breed:dam?.breed||sire?.breed||'',sire:sire?(sire.regName||sire.name):(L.sireExt||''),dam:dam?(dam.regName||dam.name):'',parentTests:tests,health,planned,
    kennel:{name:S.kennel.name,affix:S.kennel.affix,owner:S.kennel.owner,city:S.kennel.city,club:S.kennel.club,phone:S.kennel.phone,email:S.kennel.email},food:o.food||'',feeding:o.feeding||'',message:o.message||''}}
function transferForm(L,p){const dn=k=>S.done['L:'+L.id+':'+k];const T=today();
  let nv=dn('vac1')?addDays(dn('vac1'),21):addDays(L.whelped,45);if(nv<T)nv=addDays(T,7);
  const lastDep=['dep8','dep6','dep4','dep2'].map(dn).find(Boolean);let nd=lastDep?addDays(lastDep,14):addDays(L.whelped,56);if(nd<T)nd=addDays(T,3);
  openForm({title:'Transferă fișa · pui '+p.collar.toLowerCase(),intro:`Generezi un cod unic pentru noul proprietar. După activare, primește în Afix fișa completă: identitate, microcip, părinți și testele lor, ${pl((p.weights||[]).length,'cântărire','cântăriri')} de la naștere, tratamente și mementouri. Tarif: <b>${PRICE} lei</b>, o singură dată.`,
    fields:[{k:'newOwner',label:'Noul proprietar',half:true},{k:'payer',label:`Cine plătește cei ${PRICE} lei`,type:'select',half:true,options:[['owner','Noul proprietar, la activare'],['breeder','Eu, crescătorul (inclus în preț)']]},
      {k:'nextVac',label:'Următorul vaccin programat',type:'date',half:true},{k:'nextDep',label:'Următoarea deparazitare',type:'date',half:true},
      {k:'food',label:'Hrana actuală',half:true,placeholder:'ex: hrană uscată pentru pui de talie mare'},{k:'feeding',label:'Rația zilnică',half:true,placeholder:'ex: 4 mese × 70 g'},
      {k:'message',label:'Mesaj pentru noul proprietar',type:'textarea',placeholder:'Obiceiuri, sfaturi pentru primele zile, ce să aducă la preluare'}],
    values:{newOwner:p.buyer,payer:'owner',nextVac:nv,nextDep:nd},saveLabel:'Generează codul',
    onSave:async out=>{if(out.payer==='breeder')paySheet({title:'Plătește transferul',item:'Fișa digitală · pui '+p.collar.toLowerCase(),onPay:()=>createTransfer(L,p,out,true)});else await createTransfer(L,p,out,false)}})}
async function createTransfer(L,p,out,paid){const code=genCode();const pkg=await buildPackage(L,p,out);const {id,key}=await codeKeys(code);
  let box=await seal(key,pkg);if(box.ct.length>240000){pkg.pup.photo=null;box=await seal(key,pkg)}
  try{await TR.put(id,Object.assign({v:1,payer:out.payer,paid:!!paid,createdAt:new Date().toISOString(),claimedAt:null},box))}catch(e){console.warn(e);throw {msg:'Codul nu a putut fi salvat. Încearcă din nou.'}}
  const dam=dogById(L.damId);const t={code,id,pupId:p.id,litterId:L.id,label:'Pui '+p.collar.toLowerCase()+(p.name?' ('+p.name+')':'')+' · '+(dam?.name||'')+' × '+sireName(L),newOwner:out.newOwner||'',createdAt:today(),payer:out.payer,claimedAt:null};
  S.transfers.push(t);if(p.status==='Disponibil')p.status='Rezervat';save();codeSheet(t)}
function bindSheet(){onModalOpen();$('#modal').querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);const sc=$('#modal').querySelector('[data-scrim]');if(sc)sc.addEventListener('mousedown',e=>{if(e.target===sc)closeModal()})}
async function copyText(txt,el){try{await navigator.clipboard.writeText(txt);toast('Copiat')}catch(e){if(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}toast('Selectat: apasă Ctrl+C / Copiază')}}
function paySheet(o){FORM={pay:true};
  $('#modal').innerHTML=`<div class="scrim" data-scrim><div class="sheet" style="max-width:480px"><header><h2>${esc(o.title)}</h2><button class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header>
  <div class="sbody" id="payBody"><div class="price"><div><span>${esc(o.item)}</span><br><span>plată unică, fără abonament</span></div><b>${PRICE} lei</b></div>
  <ul class="incl">${['Fișa de identitate: microcip, rasă, părinți','Testele de sănătate ale părinților','Curba de creștere de la naștere','Vaccinuri și deparazitări făcute la crescător','Mementouri pentru următoarele tratamente','Datele de contact ale crescătorului'].map(x=>`<li>${I(IC.check)}<span>${x}</span></li>`).join('')}</ul>
  <p class="fine"><span class="pill warn">Demonstrație</span> Plata este simulată. În versiunea publică se face prin procesatorul de plăți (card, Apple Pay, Google Pay); Afix nu vede și nu păstrează datele cardului.</p></div>
  <footer id="payFoot"><span class="sp"></span><button class="btn ghost" data-close>Renunță</button><button class="btn primary" id="payBtn">Plătește ${PRICE} lei</button></footer></div></div>`;
  bindSheet();
  $('#payBtn').onclick=()=>{const b=$('#payBtn');b.disabled=true;b.textContent='Se procesează…';
    setTimeout(()=>{$('#payBody').innerHTML=`<div class="paid"><span class="ok">${I(IC.check)}</span>Plată confirmată · ${PRICE} lei</div>`;$('#payFoot').hidden=true;
      setTimeout(async()=>{try{await o.onPay()}catch(e){console.warn(e);closeModal();toast(e&&e.msg||'Ceva nu a mers. Încearcă din nou.')}},900)},1200)}}
function codeSheet(t){if(!t)return;FORM={code:true};const link=APP_URL+'#'+t.code;const pupL=t.label.split(' · ')[0];
  const msg=`Bună${t.newOwner?', '+t.newOwner:''}! Fișa digitală a cățelului tău (${pupL.toLowerCase()}) de la ${S.kennel.name||'canisa noastră'} te așteaptă în Afix.\n\n1. Deschide: ${link}\n2. Alege „Am primit un cățel”\n3. Introdu codul: ${t.code}\n\nAi acolo microcipul, părinții, cântăririle, vaccinurile și mementourile pentru următoarele tratamente.`;
  $('#modal').innerHTML=`<div class="scrim" data-scrim><div class="sheet" style="max-width:520px"><header><h2>Cod de transfer</h2><button class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header>
  <div class="sbody"><div class="pills"><span class="pill ${t.claimedAt?'ok':'warn'}">${t.claimedAt?'Activat pe '+fmt(t.claimedAt.slice(0,10)):'Așteaptă activarea'}</span><span class="pill">${esc(pupL)}</span><span class="pill ${t.payer==='breeder'?'ok':''}">${t.payer==='breeder'?'Plătit de tine':'Plătește proprietarul: '+PRICE+' lei'}</span></div>
  <div class="codebox" id="codeTxt">${esc(t.code)}</div>
  <div class="qr" id="qr"></div><p class="fine" style="text-align:center;margin:-4px auto 0">Noul proprietar scanează codul QR la predarea cățelului sau primește mesajul de mai jos.</p>
  <div class="msgbox" id="msgTxt">${esc(msg)}</div></div>
  <footer><button class="btn" id="cpCode">Copiază codul</button><button class="btn" id="cpMsg">Copiază mesajul</button><span class="sp"></span><button class="btn primary" data-close>Gata</button></footer></div></div>`;
  bindSheet();
  try{if(window.QRCode)new QRCode($('#qr'),{text:link,width:168,height:168,colorDark:'#17201D',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});else $('#qr').hidden=true}catch(e){$('#qr').hidden=true}
  $('#cpCode').onclick=()=>copyText(t.code,$('#codeTxt'));$('#cpMsg').onclick=()=>copyText(msg,$('#msgTxt'))}
function claimForm(pre){openForm({title:'Am primit un cățel',intro:'Introdu codul primit de la crescător, din mesaj sau de pe fișa de la predare. Îl poți scrie cu sau fără cratime.',
  fields:[{k:'code',label:'Cod de transfer',required:true,mono:true,placeholder:'AFX-XXXX-XXXX',validate:v=>normCode(v).length===11?null:'Codul are forma AFX-XXXX-XXXX.'}],values:{code:pre||''},saveLabel:'Caută fișa',
  onSave:async out=>{const code=fmtCode(normCode(out.code));const {id,key}=await codeKeys(code);let doc;
    try{doc=await TR.get(id)}catch(e){throw {msg:'Nu am putut verifica codul acum. Încearcă din nou.'}}
    if(!doc)throw {field:'code',msg:'Nu am găsit acest cod. Verifică literele și cifrele.'};
    if(doc.claimedAt)throw {field:'code',msg:'Codul a fost deja activat pe '+fmt(doc.claimedAt.slice(0,10))+'.'};
    let pkg;try{pkg=JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(doc.iv)},key,unb64(doc.ct))))}catch(e){throw {field:'code',msg:'Codul nu se potrivește cu nicio fișă.'}}
    pendingCode='';previewSheet({code,id,doc,pkg})}})}
function previewSheet(x){FORM={preview:true};const {pkg,doc}=x,p=pkg.pup,k=pkg.kennel||{};const mustPay=doc.payer!=='breeder'&&!doc.paid;
  const nm=p.name||('Puiul cu zgărdiță '+String(p.collar||'').toLowerCase());
  $('#modal').innerHTML=`<div class="scrim" data-scrim><div class="sheet" style="max-width:520px"><header><h2>Fișa e gata</h2><button class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header>
  <div class="sbody"><div class="pv"><span class="av" style="--h:${hue(nm)}">${p.photo?`<img src="${p.photo}" alt="">`:esc(nm[0])}</span><div><p class="eyebrow">De la ${esc(k.name||'crescător')}</p><h3>${esc(nm)} ${sexSym(p.sex)}</h3><p class="muted">${esc(pkg.breed||'')} · născut ${fmt(p.dob)} (${ageStr(p.dob)})</p></div></div>
  <ul class="incl"><li>${I(IC.check)}<span>Tată: <b>${esc(pkg.sire||'—')}</b> · Mamă: <b>${esc(pkg.dam||'—')}</b></span></li>
  ${pkg.parentTests?.length?`<li>${I(IC.check)}<span>${pl(pkg.parentTests.length,'test de sănătate','teste de sănătate')} ale părinților</span></li>`:''}
  <li>${I(IC.check)}<span>${pl(p.weights?.length||0,'cântărire','cântăriri')} de la naștere${p.chip?' · microcip '+esc(p.chip):''}</span></li>
  <li>${I(IC.check)}<span>${pl(pkg.health?.length||0,'tratament înregistrat','tratamente înregistrate')} și ${pl(pkg.planned?.length||0,'memento','mementouri')} programate</span></li>
  ${pkg.message?`<li>${I(IC.check)}<span>Un mesaj de la crescător</span></li>`:''}</ul>
  ${mustPay?`<div class="price"><div><span>Activarea fișei digitale</span><br><span>plată unică, fără abonament</span></div><b>${PRICE} lei</b></div>`:`<p class="pill ok" style="align-self:flex-start">Activarea a fost plătită de crescător</p>`}</div>
  <footer><span class="sp"></span><button class="btn ghost" data-close>Mai târziu</button><button class="btn primary" id="actBtn">${mustPay?'Plătește și activează':'Activează fișa'}</button></footer></div></div>`;
  bindSheet();
  $('#actBtn').onclick=async()=>{if(mustPay)paySheet({title:'Activează fișa',item:'Fișa digitală · '+nm,onPay:()=>completeClaim(x)});else{$('#actBtn').disabled=true;try{await completeClaim(x)}catch(e){console.warn(e);toast(e&&e.msg||'Activarea nu a reușit. Încearcă din nou.');$('#actBtn').disabled=false}}}}
async function completeClaim({code,id,pkg}){const p=pkg.pup;
  const fresh=await TR.get(id);if(fresh&&fresh.claimedAt)throw {msg:'Codul a fost deja activat.'};
  await TR.mark(id,{claimedAt:new Date().toISOString(),paid:true});
  let photoId='';if(p.photo){photoId=uid();await Store.putPhoto(photoId,p.photo)}
  if(!S.account){if(S.sample){const keep=S.transfers;S=emptyState()}S.account={role:'owner',since:today()}}
  const d={id:uid(),name:p.name||'Cățelul meu',regName:'',breed:pkg.breed||'',sex:p.sex,dob:p.dob,color:p.color||'',chip:p.chip||'',tattoo:'',passport:'',pedigreeNo:'',sire:pkg.sire||'',dam:pkg.dam||'',breeder:pkg.kennel?.name||'',owner:'',titles:'',status:'activ',notes:'',photoId,
    health:pkg.health||[],weights:p.weights||[],shows:[],heats:[],docs:[],planned:pkg.planned||[],
    origin:{kennel:pkg.kennel||{},message:pkg.message||'',food:pkg.food||'',feeding:pkg.feeding||'',parentTests:pkg.parentTests||[],transferredAt:today(),code}};
  S.dogs.push(d);
  ui.locked=false;ui.view='dog';ui.dogId=d.id;ui.tab='profil';save();closeModal();toast(`Bine ai venit acasă, ${d.name}!`);
  if(!p.name)setTimeout(()=>dogForm(d),700)}
let lastRefresh=0;
async function refreshTransfers(){if(!Store.ready||!(S.transfers||[]).some(t=>!t.claimedAt)||Date.now()-lastRefresh<20000)return;lastRefresh=Date.now();let ch=false;
  for(const t of S.transfers){if(t.claimedAt)continue;try{const d=await TR.get(t.id);if(d&&d.claimedAt){t.claimedAt=d.claimedAt;const L=litterById(t.litterId);const p=L?.puppies.find(x=>x.id===t.pupId);if(p)p.status='Vândut';ch=true}}catch(e){}}
  if(ch){save();toast('Un proprietar nou a activat fișa cățelului')}}
