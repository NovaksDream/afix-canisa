'use strict';
/* ---------- export / import ---------- */
async function doExport(){const photos={};const ids=[];for(const d of S.dogs){if(d.photoId)ids.push(d.photoId);for(const x of d.docs||[])ids.push(x.photoId)}
  for(const id of ids){const v=await Store.getPhoto(id);if(v)photos[id]=v}
  const json=JSON.stringify({app:'afix',exported:new Date().toISOString(),state:S,photos});const name='afix-'+(S.kennel.name||'canisa').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+today()+'.json';
  try{const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Copia de siguranță a fost descărcată');return}catch(e){console.warn(e)}
  openForm({title:'Copie de siguranță',intro:'Descărcarea directă nu e disponibilă aici. Copiază textul de mai jos într-un fișier .json.',fields:[{k:'json',label:'Date',type:'textarea'}],values:{json},saveLabel:'Copiază',onSave:async()=>{try{await navigator.clipboard.writeText(json);toast('Copiat')}catch(e){$('#f_json')?.select();throw e}}})}
$('#importFile').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const obj=JSON.parse(await f.text());if(!obj.state||!Array.isArray(obj.state.dogs))throw 0;
    confirmBox(`Importul înlocuiește datele actuale cu ${obj.state.dogs.length} câini din fișier.`,async()=>{for(const [id,v] of Object.entries(obj.photos||{}))await Store.putPhoto(id,v);const acc=S.account;S=obj.state;S.done=S.done||{};S.transfers=S.transfers||[];S.account=S.account||acc;save();toast('Date restaurate')})}
  catch(err){toast('Fișierul nu este o copie Afix validă.')}});

/* ---------- actions ---------- */
const A={
  nav:el=>{go({view:el.dataset.v});if(ui.view==='settings')refreshTransfers()},
  dog:el=>go({view:'dog',dogId:el.dataset.id,tab:'profil'}),
  litter:el=>{go({view:'litter',litterId:el.dataset.id});refreshTransfers()},
  back:el=>{const prev=navStack.pop();go(prev&&!sameView(prev,snap())?prev:{view:el.dataset.v},true)},
  claim:()=>claimForm(),showCode:el=>codeSheet(S.transfers.find(t=>t.code===el.dataset.code)),
  enter:()=>{ui.locked=false;render()},
  logout:()=>{if(Store.mode==='cloud'){confirmBox('Ieși din cont pe acest telefon? Datele rămân salvate în cont.',()=>Store.signOut());return}ui.locked=true;closeModal();toTop();render()},
  sendCode:async()=>{const email=($('#loginEmail')?.value||'').trim();login.err='';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){login.err='Scrie o adresă de e-mail validă.';render();return}
    login.email=email;login.busy=true;render();
    try{await Store.sendCode(email);login.sent=true}catch(e){console.warn(e);login.err=/rate|limit|seconds/i.test(e?.message||'')?'Ai cerut prea multe coduri. Așteaptă un minut și încearcă din nou.':'Codul nu a putut fi trimis. Verifică adresa și încearcă din nou.'}
    login.busy=false;render();setTimeout(()=>$('#loginCode')?.focus(),50)},
  verifyCode:async()=>{const code=($('#loginCode')?.value||'').replace(/\s/g,'');login.err='';
    if(!/^\d{6,10}$/.test(code)){login.err='Codul are cifre, de obicei 6.';render();return}
    login.busy=true;render();
    try{const data=await Store.verifyCode(login.email,code);applyData(data);login.busy=false;setSync('ok');render();if(pendingCode&&S.account)claimForm(pendingCode)}
    catch(e){console.warn(e);login.busy=false;login.err='Codul nu e corect sau a expirat. Cere un cod nou.';render()}},
  changeEmail:()=>{login.sent=false;login.err='';render()},
  role:el=>{const r=el.dataset.r;
    if(el.dataset.switch){S.account.role=r;if(r==='owner'&&ui.view==='litters')ui.view='home';save();toast(r==='owner'?'Profil de proprietar':'Profil de crescător');return}
    if(!S.account){if(r==='owner'&&S.sample)S=emptyState();S.account={role:r,since:today()}}else if(r==='breeder')S.account.role='breeder';
    ui.locked=false;ui.view=r==='owner'?'dogs':'home';toTop();save();
    if(r==='owner')claimForm(pendingCode);else if(!S.sample&&!S.kennel.name)kennelForm()},
  tab:el=>{ui.tab=el.dataset.t;render()},filter:el=>{ui.filter=el.dataset.f;render()},
  addDog:()=>dogForm(),editDog:()=>dogForm(dogById(ui.dogId)),
  dogPhoto:()=>{const d=dogById(ui.dogId);openForm({title:'Fotografia lui '+d.name,fields:[{k:'photoId',label:'Fotografie',type:'photo',max:900,required:true}],values:{photoId:d.photoId},onSave:async out=>{d.photoId=await storePhoto(out,'photoId');save()}})},
  addHealth:el=>healthForm(dogById(ui.dogId),el.dataset.k),
  editHealth:el=>{const d=dogById(ui.dogId);const h=d.health.find(x=>x.id===el.dataset.id);healthForm(d,h.kind,h)},
  addWeight:()=>weightForm(dogById(ui.dogId)),editWeight:el=>weightForm(dogById(ui.dogId),+el.dataset.i),
  addShow:()=>showForm(dogById(ui.dogId)),addShowAny:()=>{if(!S.dogs.length)return toast('Adaugă întâi un câine.');showForm(null,null,true)},
  editShow:el=>{const d=dogById(el.dataset.dog);showForm(d,d.shows.find(s=>s.id===el.dataset.id))},
  addHeat:()=>heatForm(dogById(ui.dogId)),editHeat:el=>{const d=dogById(ui.dogId);heatForm(d,d.heats.find(x=>x.id===el.dataset.id))},
  addDoc:()=>docForm(dogById(ui.dogId)),viewDoc:el=>{const d=dogById(ui.dogId);viewDoc(d,d.docs.find(x=>x.id===el.dataset.id))},
  addLitter:()=>litterForm(null,ui.view==='dog'&&dogById(ui.dogId)?.sex==='F'?ui.dogId:null),editLitter:()=>litterForm(litterById(ui.litterId)),
  whelp:el=>whelpForm(litterById(el.dataset.id||ui.litterId)),weigh:el=>weighForm(litterById(el.dataset.id||ui.litterId)),
  addPuppy:()=>puppyForm(litterById(ui.litterId)),editPuppy:el=>{const L=litterById(ui.litterId);puppyForm(L,L.puppies.find(p=>p.id===el.dataset.id))},
  task:el=>{const k=el.dataset.key;if(S.done[k])delete S.done[k];else S.done[k]=today();save()},
  rem:el=>{const r=REM.get(el.dataset.key);if(!r)return;
    if(r.act==='done'){S.done[r.key]=today();save();toast('Bifat: '+r.title)}
    else if(r.act==='redo'){const d=dogById(r.dogId);const h=d.health.find(x=>x.id===r.hid);ui.dogId=d.id;healthForm(d,h.kind,null,{sub:h.sub,product:h.product,date:today()})}
    else if(r.act==='weigh')weighForm(litterById(r.litterId));
    else if(r.act==='whelp')whelpForm(litterById(r.litterId));
    else if(r.act==='heat'){ui.dogId=r.dogId;heatForm(dogById(r.dogId))}},
  editKennel:()=>kennelForm(),export:()=>doExport(),import:()=>$('#importFile').click(),
  clearSample:()=>confirmBox(S.sample?'Datele demonstrative vor fi înlocuite cu o canisă goală.':'Toți câinii, cuiburile și rezultatele vor fi șterse definitiv.',async()=>{
    for(const d of S.dogs){if(d.photoId)Store.delPhoto(d.photoId);for(const x of d.docs||[])Store.delPhoto(x.photoId)}
    const k=S.sample?null:S.kennel,acc=S.account;S=emptyState();if(k)S.kennel=k;S.account=acc;ui.view='home';save();if(!isOwnerRole())kennelForm()}),
  loadSample:()=>{const acc=S.account;S=makeSample();S.account=acc;ui.view='home';save();toast('Canisa exemplu a fost încărcată')}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.closest('#sheet'))return;const f=A[el.dataset.act];if(f){e.preventDefault();f(el)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modal').innerHTML)closeModal();
  if(e.key==='Enter'&&e.target.id==='loginEmail'){e.preventDefault();A.sendCode()}
  if(e.key==='Enter'&&e.target.id==='loginCode'){e.preventDefault();A.verifyCode()}});
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,2800)}

/* ---------- boot ---------- */
render();
let booted=false;
/* take a stored state (a copy: data read from the database may be frozen) */
function applyData(data){
  try{if(data&&Array.isArray(data.dogs)){S=JSON.parse(JSON.stringify(data));S.done=S.done||{};S.kennel=Object.assign(emptyState().kennel,S.kennel||{});S.transfers=S.transfers||[];S.dogs.forEach(d=>{d.health=d.health||[];d.weights=d.weights||[];d.shows=d.shows||[];d.heats=d.heats||[];d.docs=d.docs||[]});S.litters=S.litters||[];
    if(S.sample){const m={Aria:'aria',Luna:'luna',Mira:'mira',Bruno:'bruno',Nova:'nova'};S.dogs.forEach(d=>{if(!d.photoId&&m[d.name])d.photoId='smp-'+m[d.name]});
      const pm={'Roșu':'pup3','Verde':'pup1','Portocaliu':'pup2'};S.litters.forEach(L=>L.puppies.forEach(p=>{if(!p.photoId&&pm[p.collar]&&dogById(L.damId)?.name==='Luna')p.photoId='smp-'+pm[p.collar]}))}}
    else if(dirty)Store.flush()}catch(e){console.warn(e)}}
function boot(data){if(booted)return;booted=true;Store.ready=true;
  applyData(data);
  setSync(data?'ok':'');
  try{if(pendingCode&&S.account){ui.locked=false;render();claimForm(pendingCode)}else render()}catch(e){console.error(e);ui.locked=false;ui.view='home';try{render()}catch(_){}}
  if(Store.offline)toast('Nu am putut încărca datele din cont. Lucrezi pe acest dispozitiv.');
  refreshTransfers().catch(()=>{})}
Store.init().then(boot,e=>{console.warn(e);boot(null)});
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(e=>console.warn(e)));
setTimeout(()=>{if(!booted){Store.mode='local';Store.needsLogin=false;Store.offline=true;let d=null;try{const r=localStorage.getItem('afix-state');if(r)d=JSON.parse(r)}catch(e){}boot(d)}},20000);
