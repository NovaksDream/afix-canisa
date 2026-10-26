'use strict';
/* ---------- forms ---------- */
let FORM=null;
function fieldHTML(f,v){const id='f_'+f.k,cls=`field${f.half?' half':''}${f.mono?' mono':''}`;const lab=`<span>${esc(f.label)}${f.required?' *':''}</span>`;
  const hint=f.hint?`<span class="hint">${esc(f.hint)}</span>`:'';const err=`<span class="err" id="e_${f.k}" hidden></span>`;
  if(f.type==='select')return `<label class="${cls}">${lab}<select id="${id}">${f.options.map(o=>{const [val,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(val)}"${String(v??'')===String(val)?' selected':''}>${esc(l)}</option>`}).join('')}</select>${hint}${err}</label>`;
  if(f.type==='textarea')return `<label class="${cls}">${lab}<textarea id="${id}" placeholder="${esc(f.placeholder||'')}">${esc(v||'')}</textarea>${hint}${err}</label>`;
  if(f.type==='chips')return `<fieldset class="${cls}"><legend>${esc(f.label)}</legend><div class="chipset">${f.options.map(o=>`<label class="chip-opt"><input type="checkbox" name="${id}" value="${esc(o)}"${(v||[]).includes(o)?' checked':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
  if(f.type==='photo')return `<label class="${cls} photo">${lab}<div class="drop" id="d_${f.k}">${v?`<img data-photo="${esc(v)}" alt="" hidden>`:''}<span class="hint ph">${I(IC.cam)}${v?'Se încarcă…':'Alege o fotografie sau un scan'}</span></div><input type="file" accept="image/*" id="${id}">${hint}${err}</label>`;
  if(f.type==='weigh')return `<div class="wrow"><span class="collar lg" style="--c:${collarC(f.collar)}"></span><label for="${id}" style="font-weight:600">${esc(f.label)}<br><span class="muted" style="font-weight:400;font-size:12.5px">${esc(f.hint||'')}</span></label><input id="${id}" type="number" inputmode="numeric" min="0" step="1" value="${esc(v??'')}" placeholder="grame"></div>`;
  const dl=f.list?`<datalist id="dl_${f.k}">${f.list.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>`:'';
  return `<label class="${cls}">${lab}<input id="${id}" type="${f.type||'text'}"${f.type==='number'?` step="${f.step||'any'}" inputmode="decimal"`:''}${f.inputmode?` inputmode="${f.inputmode}"`:''}${f.list?` list="dl_${f.k}"`:''} value="${esc(v??'')}" placeholder="${esc(f.placeholder||'')}" autocomplete="off">${dl}${hint}${err}</label>`}
function openForm(o){
  const vals=Object.assign({},o.values||{});FORM={o,photos:{}};
  $('#modal').innerHTML=`<div class="scrim" data-scrim><form class="sheet" id="sheet" novalidate><header><h2>${esc(o.title)}</h2><button type="button" class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header>
  ${o.intro?`<p class="intro">${o.intro}</p>`:''}<div class="fields">${o.fields.map(f=>fieldHTML(f,vals[f.k])).join('')}</div>
  <footer>${o.onDelete?`<button type="button" class="btn ghost danger" data-del>Șterge</button>`:''}${(o.extra||[]).map((x,i)=>`<button type="button" class="btn ghost" data-extra="${i}">${esc(x.label)}</button>`).join('')}<span class="sp"></span><button type="button" class="btn ghost" data-close>Renunță</button><button class="btn primary" type="submit">${esc(o.saveLabel||'Salvează')}</button></footer></form></div>`;
  onModalOpen();hydrate();
  const form=$('#sheet');
  for(const f of o.fields)if(f.type==='photo'){const inp=$('#f_'+f.k);inp.addEventListener('change',async()=>{const file=inp.files[0];if(!file)return;const drop=$('#d_'+f.k);drop.innerHTML='<span class="hint">Se procesează…</span>';
    try{const data=await compress(file,f.max||1600);FORM.photos[f.k]=data;drop.innerHTML=`<img src="${data}" alt="">`}catch(e){drop.innerHTML='<span class="hint">Nu am putut citi imaginea. Încearcă un JPG sau PNG.</span>'}})}
  if(o.onInput){const get=k=>{const el=$('#f_'+k);return el?el.value:''};const set=(k,v)=>{const el=$('#f_'+k);if(el)el.value=v};form.addEventListener('input',e=>o.onInput(e.target.id.replace(/^f_/,''),get,set));form.addEventListener('change',e=>o.onInput(e.target.id.replace(/^f_/,''),get,set))}
  form.addEventListener('submit',async e=>{e.preventDefault();const out={};let ok=true;
    for(const f of o.fields){if(f.type==='chips'){out[f.k]=[...form.querySelectorAll(`input[name="f_${f.k}"]:checked`)].map(i=>i.value);continue}
      if(f.type==='photo'){out[f.k]=FORM.photos[f.k]||null;out['_old_'+f.k]=vals[f.k]||'';if(f.required&&!out[f.k]&&!vals[f.k]){showErr(f.k,'Adaugă o fotografie.');ok=false}continue}
      const el=$('#f_'+f.k);let v=el?el.value.trim():'';out[f.k]=v;const er=$('#e_'+f.k);if(er)er.hidden=true;
      if(f.required&&!v){showErr(f.k,'Câmp obligatoriu.');ok=false;continue}
      if(f.validate&&v){const m=f.validate(v);if(m){showErr(f.k,m);ok=false}}}
    if(!ok)return;const me=FORM;const sb=form.querySelector('[type=submit]');sb.disabled=true;
    try{await o.onSave(out);if(FORM===me)closeModal()}catch(err){console.warn(err);if(err&&err.field)showErr(err.field,err.msg);else toast(err&&err.msg||'Nu s-a putut salva.')}finally{sb.disabled=false}});
  $('#modal').querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);
  $('#modal').querySelector('[data-scrim]').addEventListener('mousedown',e=>{if(e.target.hasAttribute('data-scrim'))closeModal()});
  const del=$('#modal').querySelector('[data-del]');if(del)del.onclick=()=>confirmBox(o.deleteMsg||'Ștergi această înregistrare?',async()=>{await o.onDelete();closeModal()});
  $('#modal').querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>{const x=o.extra[+b.dataset.extra];closeModal();x.run()});
  setTimeout(()=>{const first=form.querySelector('.fields input:not([type=file]):not([type=checkbox]),.fields select');if(first&&matchMedia('(min-width:700px)').matches)first.focus()},30);
}
function showErr(k,m){const e=$('#e_'+k);if(e){e.textContent=m;e.hidden=false}}
/* history: phone / browser back */
const snap=()=>({view:ui.view,dogId:ui.dogId,tab:ui.tab,litterId:ui.litterId});
const sameView=(a,b)=>a&&b&&a.view===b.view&&a.dogId===b.dogId&&a.litterId===b.litterId;
let modalPushed=false,ignorePop=false,histState=snap();
function hpush(st,modal){try{history.pushState(Object.assign({afix:1},st,modal?{modal:1}:{}),'')}catch(e){}}
let depth=0;
const navStack=[];
function go(st,isBack){const prev=snap();Object.assign(ui,st);if(!sameView(prev,snap())){if(!isBack){navStack.push(prev);if(navStack.length>30)navStack.shift()}hpush(snap());depth++}histState=snap();toTop();render()}
let pendingModalPush=false;
function onModalOpen(){if(modalPushed)return;modalPushed=true;if(ignorePop){pendingModalPush=true;return}hpush(snap(),true)}
window.addEventListener('popstate',e=>{
  if(ignorePop){ignorePop=false;if(!sameView(histState,snap())){hpush(snap());histState=snap()}if(pendingModalPush){pendingModalPush=false;hpush(snap(),true)}return}
  const hadModal=$('#modal').innerHTML||document.querySelector('body>.scrim');
  if(hadModal){modalPushed=false;$('#modal').innerHTML='';FORM=null;document.querySelectorAll('body>.scrim').forEach(x=>x.remove())}
  const st=e.state&&e.state.afix?e.state:{view:'home',dogId:null,tab:'profil',litterId:null};
  if(hadModal&&sameView(st,snap()))return;
  depth=Math.max(0,depth-1);Object.assign(ui,{view:st.view,dogId:st.dogId,tab:st.tab||'profil',litterId:st.litterId});histState=snap();toTop();render()});
function closeModal(){$('#modal').innerHTML='';FORM=null;if(modalPushed){modalPushed=false;ignorePop=true;try{history.back()}catch(e){ignorePop=false}}}
function confirmBox(msg,yes){const prev=$('#modal').innerHTML;const wrap=document.createElement('div');wrap.className='scrim';wrap.style.zIndex=55;
  wrap.innerHTML=`<div class="sheet" style="max-width:440px"><header><h2>Ești sigur?</h2></header><p class="intro" style="padding-bottom:16px">${esc(msg)}</p><footer><span class="sp"></span><button class="btn ghost" data-n>Renunță</button><button class="btn primary" data-y style="background:var(--bad);border-color:var(--bad);color:#fff">Da, șterge</button></footer></div>`;
  document.body.appendChild(wrap);wrap.querySelector('[data-n]').onclick=()=>wrap.remove();wrap.querySelector('[data-y]').onclick=async()=>{wrap.remove();await yes()}}
async function compress(file,max){const url=URL.createObjectURL(file);
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});URL.revokeObjectURL(url);
  let scale=Math.min(1,max/Math.max(img.width,img.height)),q=.82,out='';
  for(let t=0;t<10;t++){const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
    out=c.toDataURL('image/jpeg',q);if(out.length<235000)return out;if(q>.6)q-=.08;else scale*=.82}
  return out}
async function storePhoto(out,k){if(!out[k])return out['_old_'+k]||'';const id=uid();await Store.putPhoto(id,out[k]);if(out['_old_'+k])Store.delPhoto(out['_old_'+k]);return id}
const clean=o=>{const r={};for(const k in o)if(!k.startsWith('_old_'))r[k]=o[k];return r};

/* form specs */
const dogFields=()=>[
  {k:'photoId',label:'Fotografie',type:'photo',max:900},
  {k:'name',label:'Nume de apel',required:true,half:true,placeholder:'ex: Aria'},{k:'regName',label:'Nume în pedigree',half:true,placeholder:'ex: Aria din Valea Luminii'},
  {k:'breed',label:'Rasă',half:true,list:BREEDS},{k:'sex',label:'Sex',type:'select',options:[['F','Femelă'],['M','Mascul']],half:true},
  {k:'dob',label:'Data nașterii',type:'date',half:true},{k:'color',label:'Culoare / marcaje',half:true},
  {k:'chip',label:'Număr microcip',half:true,mono:true,inputmode:'numeric',placeholder:'642 …',hint:'15 cifre, standard ISO. 642 = România.',validate:v=>/^\d{15}$/.test(v.replace(/\s/g,''))?null:'Microcipul ISO are exact 15 cifre.'},
  {k:'pedigreeNo',label:'Nr. pedigree / registru',half:true,mono:true,placeholder:'ex: LOR 21457'},
  {k:'passport',label:'Nr. pașaport',half:true,mono:true},{k:'tattoo',label:'Tatuaj',half:true,mono:true},
  {k:'sire',label:'Tată (nume în pedigree)',half:true},{k:'dam',label:'Mamă (nume în pedigree)',half:true},
  {k:'breeder',label:'Crescător',half:true},{k:'owner',label:'Proprietar',half:true},
  {k:'titles',label:'Titluri',placeholder:'ex: Campion al României, Junior Campion',hint:'Separă titlurile prin virgulă.'},
  {k:'status',label:'Statut',type:'select',half:true,options:[['activ','Activ în canisă'],['retras','Retras din reproducție'],['vândut','Vândut / plecat'],['decedat','Decedat']]},
  {k:'heatInterval',label:'Interval călduri (zile, femele)',type:'number',half:true,placeholder:'180'},
  {k:'notes',label:'Note',type:'textarea',placeholder:'Temperament, alimentație, observații'}];
function dogForm(d){openForm({title:d?'Editează '+d.name:'Câine nou',fields:dogFields(),values:d||{sex:'F',status:'activ',breed:S.dogs[0]?.breed||'',owner:S.kennel.owner},
  onSave:async out=>{out.photoId=await storePhoto(out,'photoId');out.chip=out.chip.replace(/\s/g,'');const v=clean(out);
    if(d)Object.assign(d,v);else{const nd=Object.assign({id:uid(),health:[],weights:[],shows:[],heats:[],docs:[]},v);S.dogs.push(nd);ui.view='dog';ui.dogId=nd.id;ui.tab='profil'}save();toast(d?'Fișa a fost actualizată':'Câine adăugat')},
  onDelete:d?async()=>{S.dogs=S.dogs.filter(x=>x!==d);if(d.photoId)Store.delPhoto(d.photoId);for(const x of d.docs||[])Store.delPhoto(x.photoId);ui.view='dogs';save();toast('Câine șters')}:null,deleteMsg:d?`Ștergi fișa lui ${d.name} cu tot istoricul?`:''})}
function healthForm(d,kind,h,pre){const cfg=HEALTH[kind];let manual=!!h;
  const fields=[{k:'sub',label:'Tip',type:'select',options:cfg.subs,half:true},{k:'date',label:'Data',type:'date',required:true,half:true},{k:'product',label:kind==='test'?'Laborator / evaluator':kind==='vet'?'Medic / clinică':'Produs',placeholder:cfg.prod,half:true}];
  if(kind==='test'||kind==='vet')fields.push({k:'result',label:kind==='test'?'Rezultat':'Diagnostic / tratament',half:true,placeholder:kind==='test'?'ex: HD-A, ED-0, Clear':''});
  if(kind!=='test')fields.push({k:'next',label:kind==='vet'?'Control următor':'Următoarea dată',type:'date',half:true,hint:kind==='vet'?'Opțional':'Calculată automat. O poți schimba.'});
  fields.push({k:'notes',label:'Note',type:'textarea'});
  const init=h||Object.assign({sub:cfg.subs[0],date:today()},pre||{});if(!h&&nextDays(kind,init.sub))init.next=addDays(init.date,nextDays(kind,init.sub));
  openForm({title:cfg.label+' · '+d.name,fields,values:init,
    onInput:(k,get,set)=>{if(k==='next'){manual=true;return}if((k==='date'||k==='sub')&&!manual){const n=nextDays(kind,get('sub'));if(n&&get('date'))set('next',addDays(get('date'),n))}},
    onSave:out=>{const v=clean(out);if(h)Object.assign(h,v);else d.health.push(Object.assign({id:uid(),kind},v));save();toast('Salvat. Mementoul a fost actualizat.')},
    onDelete:h?()=>{d.health=d.health.filter(x=>x!==h);save()}:null})}
function weightForm(d,i){const w=i!=null?d.weights[i]:null;openForm({title:'Cântărire · '+d.name,fields:[{k:'date',label:'Data',type:'date',required:true,half:true},{k:'kg',label:'Greutate (kg)',type:'number',required:true,half:true,step:'0.1'}],values:w||{date:today()},
  onSave:out=>{const v={date:out.date,kg:Number(String(out.kg).replace(',','.'))};if(w)Object.assign(w,v);else d.weights.push(v);save()},onDelete:w?()=>{d.weights.splice(i,1);save()}:null})}
function showForm(d,s,pick){const fields=[];if(pick)fields.push({k:'dogId',label:'Câine',type:'select',options:S.dogs.map(x=>[x.id,x.name])});
  fields.push({k:'name',label:'Expoziția / concursul',required:true,placeholder:'ex: CACIB Timișoara'},{k:'date',label:'Data',type:'date',required:true,half:true},{k:'city',label:'Localitate',half:true},
  {k:'type',label:'Tip',type:'select',options:SHOW_TYPES,half:true},{k:'judge',label:'Arbitru',half:true,placeholder:'Nume (țara)'},{k:'cls',label:'Clasa',type:'select',options:SHOW_CLASSES,half:true},{k:'grade',label:'Calificativ',type:'select',options:GRADES,half:true},
  {k:'place',label:'Loc în clasă',type:'select',options:['1','2','3','4','—'],half:true},{k:'titles',label:'Titluri și certificate câștigate',type:'chips',options:SHOW_TITLES},{k:'notes',label:'Raportul arbitrului / note',type:'textarea'});
  openForm({title:s?'Rezultat · '+d.name:'Rezultat nou',fields,values:s||{date:today(),dogId:d?.id,type:SHOW_TYPES[0],cls:'Deschisă (15+ luni)',grade:'Excelent',place:'1',titles:[]},
    onSave:out=>{const dog=pick?dogById(out.dogId):d;delete out.dogId;if(s)Object.assign(s,out);else dog.shows.push(Object.assign({id:uid()},out));save();toast((out.titles||[]).length?'Felicitări! Rezultat salvat.':'Rezultat salvat')},
    onDelete:s?()=>{d.shows=d.shows.filter(x=>x!==s);save()}:null})}
function heatForm(d,x){openForm({title:'Călduri · '+d.name,intro:'Ovulația are loc de obicei când progesteronul trece de 5–8 ng/ml. Montele se programează la 1–3 zile după ovulație.',
  fields:[{k:'start',label:'Prima zi (sângerare)',type:'date',required:true,half:true},{k:'end',label:'Ultima zi',type:'date',half:true},{k:'prog',label:'Teste de progesteron',placeholder:'ex: z6: 2,1 · z9: 6,4 · z10: 11,2 ng/ml'},{k:'notes',label:'Note',type:'textarea',placeholder:'Montată / nemontată, comportament'}],
  values:x||{start:today()},onSave:out=>{if(x)Object.assign(x,out);else d.heats.push(Object.assign({id:uid()},out));save()},onDelete:x?()=>{d.heats=d.heats.filter(y=>y!==x);save()}:null})}
function docForm(d,x){openForm({title:x?x.label:'Document nou · '+d.name,fields:[{k:'label',label:'Ce este',type:'select',options:['Pedigree: față','Pedigree: verso','Pașaport','Carnet de sănătate','Certificat de campion','Certificat CAC / CACIB','Rezultat HD / ED','Test ADN','Contract','Fotografie expoziție','Altul'],half:true},{k:'date',label:'Data',type:'date',half:true},{k:'photoId',label:'Fotografie / scan',type:'photo',required:true,max:1800,hint:'Fotografiază documentul pe o suprafață plană, cu lumină bună.'},{k:'notes',label:'Note',type:'textarea'}],
  values:x||{date:today()},onSave:async out=>{out.photoId=await storePhoto(out,'photoId');const v=clean(out);if(x)Object.assign(x,v);else d.docs.push(Object.assign({id:uid()},v));save();toast('Document salvat')},
  onDelete:x?async()=>{d.docs=d.docs.filter(y=>y!==x);await Store.delPhoto(x.photoId);save()}:null})}
function viewDoc(d,x){const html=`<div class="scrim" data-scrim><div class="sheet lightbox"><header><h2>${esc(x.label)}</h2><span class="sp" style="flex:1"></span><button class="btn sm" data-edit style="margin-right:6px">Editează</button><button class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header><img data-photo="${esc(x.photoId)}" alt="${esc(x.label)}" hidden><span class="ph" style="color:#fff;padding:40px;display:block;text-align:center">Se încarcă…</span>${x.notes?`<p style="color:#ddd;padding:12px 18px">${esc(x.notes)}</p>`:''}</div></div>`;
  $('#modal').innerHTML=html;onModalOpen();hydrate();$('#modal').querySelector('[data-close]').onclick=closeModal;$('#modal').querySelector('[data-edit]').onclick=()=>{closeModal();docForm(d,x)};$('#modal').querySelector('[data-scrim]').addEventListener('mousedown',e=>{if(e.target.hasAttribute('data-scrim'))closeModal()})}
function litterForm(L,preDam){const fem=S.dogs.filter(d=>d.sex==='F'&&d.status!=='decedat'),mal=S.dogs.filter(d=>d.sex==='M'&&d.status!=='decedat');
  if(!fem.length){toast('Adaugă întâi o femelă în Câinii mei.');return}
  openForm({title:L?'Editează cuibul':'Montă nouă',intro:L?'':'Afix calculează ziua fătării (63 de zile) și pașii gestației din data primei monte.',
    fields:[{k:'damId',label:'Femela',type:'select',options:fem.map(d=>[d.id,d.name+(d.regName?' · '+d.regName:'')]),half:true},{k:'sireId',label:'Masculul',type:'select',options:[...mal.map(d=>[d.id,d.name]),['','Mascul extern']],half:true},
      {k:'sireExt',label:'Mascul extern (nume în pedigree)',placeholder:'ex: Multi Ch. Goldhill Sunny Boy',hint:'Doar dacă masculul nu e în canisa ta.'},
      {k:'m1',label:'Prima montă',type:'date',required:true,half:true},{k:'m2',label:'A doua montă',type:'date',half:true},{k:'notes',label:'Note',type:'textarea',placeholder:'Tip montă, progesteron, proprietarul masculului'}],
    values:L?{damId:L.damId,sireId:L.sireId,sireExt:L.sireExt,m1:L.matings?.[0],m2:L.matings?.[1],notes:L.notes}:{damId:preDam||fem[0].id,sireId:mal[0]?.id||'',m1:today()},
    onSave:out=>{const v={damId:out.damId,sireId:out.sireId,sireExt:out.sireId?'':out.sireExt,matings:[out.m1,out.m2].filter(Boolean).sort(),notes:out.notes};
      if(L)Object.assign(L,v);else{const nl=Object.assign({id:uid(),whelped:'',puppies:[]},v);S.litters.push(nl);ui.view='litter';ui.litterId=nl.id}save();toast('Montă salvată. Fătare estimată: '+fmt(addDays(v.matings[0],63)))},
    onDelete:L?()=>{S.litters=S.litters.filter(x=>x!==L);ui.view='litters';save()}:null,deleteMsg:'Ștergi acest cuib cu toți puii și cântăririle?'})}
function whelpForm(L){openForm({title:'Înregistrează fătarea',intro:'Poți crea direct puii cu zgărdițe colorate diferite. Sexul, greutatea și culoarea le completezi apoi pe fiecare.',
  fields:[{k:'whelped',label:'Data fătării',type:'date',required:true,half:true},{k:'n',label:'Număr de pui născuți vii',type:'number',half:true,step:'1',placeholder:'ex: 7'},{k:'notes',label:'Note despre fătare',type:'textarea',placeholder:'Durată, ajutor veterinar, pui născuți morți'}],
  values:{whelped:today(),notes:L.notes},onSave:out=>{L.whelped=out.whelped;L.notes=out.notes;const n=Math.min(16,parseInt(out.n)||0);const cols=Object.keys(COLLARS);
    for(let i=0;i<n;i++)L.puppies.push({id:uid(),collar:cols[(L.puppies.length)%cols.length],name:'',sex:'?',color:'',birthWeight:'',birthTime:'',status:'Disponibil',buyer:'',buyerContact:'',price:'',deposit:'',chip:'',notes:'',weights:[]});
    S.done['L:'+L.id+':due']=out.whelped;save();toast('Felicitări pentru cuib!')}})}
function puppyForm(L,p){const used=L.puppies.filter(x=>x!==p).map(x=>x.collar);const free=Object.keys(COLLARS).find(c=>!used.includes(c))||'Gri';
  const extra=[];if(p&&p.status==='Rămâne în canisă'&&!p.promoted)extra.push({label:'Mută în Câinii mei',run:()=>promote(L,p)});
  if(p&&p.status!=='Rămâne în canisă'){const t=S.transfers.find(t=>t.pupId===p.id);extra.push(t?{label:t.claimedAt?'Transfer activat':'Vezi codul de transfer',run:()=>codeSheet(t)}:{label:'Transferă fișa',run:()=>transferForm(L,p)})}
  openForm({title:p?'Pui · zgărdiță '+p.collar.toLowerCase():'Pui nou',fields:[{k:'photoId',label:'Fotografie',type:'photo',max:700},{k:'collar',label:'Culoarea zgărdiței',type:'select',options:Object.keys(COLLARS),half:true},{k:'name',label:'Nume provizoriu',half:true},
    {k:'sex',label:'Sex',type:'select',options:[['M','Mascul'],['F','Femelă'],['?','Nestabilit']],half:true},{k:'color',label:'Culoare / marcaje',half:true},
    {k:'birthWeight',label:'Greutate la naștere (g)',type:'number',half:true,step:'1'},{k:'birthTime',label:'Ora nașterii',type:'time',half:true},
    {k:'status',label:'Statut',type:'select',options:PUP_STATUS,half:true},{k:'chip',label:'Microcip',half:true,mono:true,inputmode:'numeric'},
    {k:'buyer',label:'Cumpărător',half:true},{k:'buyerContact',label:'Telefon / e-mail cumpărător',half:true},{k:'price',label:'Preț',half:true},{k:'deposit',label:'Avans primit',half:true},{k:'notes',label:'Note',type:'textarea',placeholder:'Evaluare, defecte, suplimentare'}],
    values:p||{collar:free,sex:'?',status:'Disponibil'},extra,
    onSave:async o2=>{o2.photoId=await storePhoto(o2,'photoId');const out=clean(o2);if(p){const bwOld=p.birthWeight;Object.assign(p,out);if(out.birthWeight&&!p.weights.some(w=>w.date===L.whelped))p.weights.push({date:L.whelped,g:Number(out.birthWeight)});else if(out.birthWeight&&bwOld!==out.birthWeight){const w=p.weights.find(w=>w.date===L.whelped);if(w)w.g=Number(out.birthWeight)}}
      else{const np=Object.assign({id:uid(),weights:[]},out);if(out.birthWeight)np.weights.push({date:L.whelped,g:Number(out.birthWeight)});L.puppies.push(np)}save()},
    onDelete:p?()=>{L.puppies=L.puppies.filter(x=>x!==p);save()}:null})}
function promote(L,p){const dam=dogById(L.damId),sire=dogById(L.sireId);
  const nd={id:uid(),name:p.name||('Pui '+p.collar.toLowerCase()),regName:'',breed:dam?.breed||'',sex:p.sex==='?'?'F':p.sex,dob:L.whelped,color:p.color,chip:p.chip,tattoo:'',passport:'',pedigreeNo:'',sire:sire?(sire.regName||sire.name):L.sireExt,dam:dam?(dam.regName||dam.name):'',breeder:S.kennel.name,owner:S.kennel.owner,titles:'',status:'activ',notes:p.notes,photoId:'',
    health:[],weights:(p.weights||[]).map(w=>({date:w.date,kg:Math.round(w.g/10)/100})),shows:[],heats:[],docs:[]};
  S.dogs.push(nd);p.promoted=true;ui.view='dog';ui.dogId=nd.id;ui.tab='profil';save();toast('Puiul are acum fișa lui')}
function weighForm(L){const date=today();openForm({title:'Cântărire cuib',intro:'Cântărește la aceeași oră, înainte de supt. În primele 24–48 h o scădere de până la 10% e normală; după aceea puii ar trebui să crească zilnic.',
  fields:[{k:'date',label:'Data',type:'date',required:true,half:true},...L.puppies.map(p=>{const st=pupStats(p,L);return {k:'p_'+p.id,type:'weigh',collar:p.collar,label:p.collar+(p.name?' · '+p.name:''),hint:'anterior '+fmtG(st.last?.g)}})],
  values:Object.fromEntries([['date',date],...L.puppies.map(p=>[('p_'+p.id),(p.weights||[]).find(w=>w.date===date)?.g??''])]),saveLabel:'Salvează cântărirea',
  onSave:out=>{let n=0;for(const p of L.puppies){const g=Number(out['p_'+p.id]);if(!g)continue;const ex=p.weights.find(w=>w.date===out.date);if(ex)ex.g=g;else p.weights.push({date:out.date,g});n++}
    save();const drops=L.puppies.filter(p=>pupStats(p,L).flag.includes('Scădere'));toast(drops.length?`Atenție: ${drops.map(p=>p.collar).join(', ')} a scăzut în greutate`:`${pl(n,'pui cântărit','pui cântăriți')}`)}})}
function kennelForm(){openForm({title:'Canisa ta',fields:[{k:'name',label:'Numele canisei',required:true},{k:'affix',label:'Afix (sufix / prefix FCI)',half:true,placeholder:'ex: din Valea Luminii'},{k:'owner',label:'Numele tău',half:true},{k:'city',label:'Localitate',half:true},{k:'club',label:'Club de rasă',half:true},{k:'phone',label:'Telefon de contact',half:true,hint:'Apare pe fișa trimisă noilor proprietari.'},{k:'email',label:'E-mail de contact',half:true},{k:'heatInterval',label:'Interval implicit între călduri (zile)',type:'number',half:true,hint:'Majoritatea femelelor: 180–210 zile.'}],
  values:S.kennel,onSave:out=>{Object.assign(S.kennel,out,{heatInterval:Number(out.heatInterval)||180});save()}})}
