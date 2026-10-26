'use strict';
/* ---------- account / welcome ---------- */
let pendingCode=(location.hash.match(/^#(AFX-[A-Z0-9]{4}-[A-Z0-9]{4})$/i)||[])[1]||'';
const ICH='<path d="m9 5 7 7-7 7"/>';
function whoRow(){const me=Store.me;const name=me?.name||'';const av=me?.avatarUrl;
  return `<div class="who">${av?`<img src="${esc(av)}" alt="">`:`<span class="av" style="--h:var(--accent);width:40px;height:40px;font-size:18px">A</span>`}<div><small>Conectat securizat</small><b>${esc(name||'Contul tău')}</b></div><span class="lock" title="Conexiune securizată">${I('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')}</span></div>`}

/* The opening screen is one fixed phone screen: photo on top, short message,
   then the one thing to do (email, code or role). Nothing scrolls. */
const ROT_WORDS=['vaccinuri','deparazitări','călduri','cântăriri','expoziții'];
function welcomeShell(title,lead,body){
  const words=ROT_WORDS.concat(ROT_WORDS[0]).map(w=>`<span>${w}</span>`).join('');
  return `<div class="wl">
  <div class="wl-hero"><img data-photo="smp-hero" alt="" hidden>
    ${canOfferInstall()?`<button class="wl-install" data-act="install">${I(INSTALL_ICON)} Instalează aplicația</button>`:''}
    <div class="wl-chips">
      <div class="wl-chip c1"><span class="fi">${I(REMIC.vaccin)}</span><span>Rapel antirabic · Aria<small>mâine</small></span></div>
      <div class="wl-chip c2"><span class="fi">${I(IC.scale)}</span><span>Puiul roșu +38 g/zi<small>crește frumos</small></span></div>
      <div class="wl-chip c3"><span class="fi">${I(IC.ribbon)}</span><span>CACIB · BOB<small>Timișoara</small></span></div>
    </div></div>
  <div class="wl-body">
    <div class="wl-brand"><span class="mark">A</span><b>Afix</b></div>
    <h1>${title||`Nu mai uiți de<br><span class="rot" aria-label="vaccinuri, deparazitări, călduri, cântăriri, expoziții"><span class="rot-in">${words}</span></span>`}</h1>
    ${lead?`<p class="wl-lead">${lead}</p>`:''}
    ${body}
  </div></div>`}

/* email login: Supabase sends a 6-digit code (and a link) to the address */
const login={email:'',sent:false,busy:false,err:''};
function vLogin(){
  const err=login.err?`<p class="wl-err">${esc(login.err)}</p>`:'';
  const body=login.sent
    ?`<input class="wl-input code" id="loginCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="••••••" aria-label="Codul din e-mail">
      <button class="wl-cta" data-act="verifyCode"${login.busy?' disabled':''}>${login.busy?'Se verifică…':'Intră în cont'}</button>${err}
      <p class="wl-fine">Codul a plecat spre <b>${esc(login.email)}</b>. Nu îl vezi? Caută în Spam. <button class="wl-link" data-act="changeEmail">Altă adresă</button></p>`
    :`<input class="wl-input" id="loginEmail" type="email" inputmode="email" autocomplete="email" placeholder="adresa ta de e-mail" value="${esc(login.email)}" aria-label="Adresa de e-mail">
      <button class="wl-cta" data-act="sendCode"${login.busy?' disabled':''}>${login.busy?'Se trimite…':'Intră cu un cod pe e-mail'}</button>${err}
      <p class="wl-fine">Fără parolă. Datele tale rămân private.</p>`;
  return welcomeShell(pendingCode?'Un cățel te așteaptă':'',pendingCode?'Intră în cont ca să activezi fișa primită de la crescător.':'Carnetul digital al canisei tale.',body)}

function vWelcome(){
  if(!Store.ready)return welcomeShell('','Se pregătește canisa…','<div class="wl-loading"><span></span><span></span><span></span></div>');
  if(Store.needsLogin)return vLogin();
  const back=!!S.account;const first=(Store.me?.name||'').split(/[ @]/)[0];
  const ch=(act,r,cls,ic,t,s)=>`<button class="wl-choice${cls}" data-act="${act}"${r?` data-r="${r}"`:''}><span class="ic">${I(ic)}</span><span>${t}<small>${s}</small></span>${I(ICH)}</button>`;
  let body='';
  if(back)body+=ch('enter','',' primary',IC.paw,'Continuă',`${isOwnerRole()?'Proprietar':'Crescător'} · ${pl(S.dogs.length,'câine','câini')}`);
  if(!back||!isOwnerRole())body+=ch('role','breeder',back||pendingCode?'':' primary',IC.nest,back?'Profil de crescător':'Sunt crescător','Câini, cuiburi, expoziții, transferuri');
  body+=ch('role','owner',!back&&pendingCode?' primary':'',IC.paw,'Am primit un cățel',pendingCode?'Cod: '+esc(pendingCode.toUpperCase()):'Am un cod de la crescător');
  return welcomeShell(back?'Bine ai revenit'+(first?', '+esc(first):''):pendingCode?'Un cățel te așteaptă':'',back?'':'Carnetul digital al canisei tale.',`<div class="wl-choices">${body}</div>`)}
