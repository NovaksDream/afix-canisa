'use strict';
/* ---------- account / welcome ---------- */
let pendingCode=(location.hash.match(/^#(AFX-[A-Z0-9]{4}-[A-Z0-9]{4})$/i)||[])[1]||'';
const ICH='<path d="m9 5 7 7-7 7"/>';
function whoRow(){const me=Store.me;const name=me?.name||'';const av=me?.avatarUrl;
  return `<div class="who">${av?`<img src="${esc(av)}" alt="">`:`<span class="av" style="--h:var(--accent);width:40px;height:40px;font-size:18px">A</span>`}<div><small>Conectat securizat</small><b>${esc(name||'Contul tău')}</b></div><span class="lock" title="Conexiune securizată">${I('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')}</span></div>`}
/* email login: Supabase sends a 6-digit code (and a link) to the address */
const login={email:'',sent:false,busy:false,err:''};
function vLogin(brand){
  const step=login.sent
    ?`<label class="field"><span>Codul din e-mail</span><input id="loginCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="ex: 123456" style="font-size:22px;letter-spacing:.2em;text-align:center"></label>
      <button class="btn primary" data-act="verifyCode" style="width:100%;padding:14px"${login.busy?' disabled':''}>${login.busy?'Se verifică…':'Intră în cont'}</button>
      <p class="fine">Am trimis codul la <b>${esc(login.email)}</b>. Poți apăsa și pe linkul din e-mail. Nu îl găsești? Uită-te și în Spam. <button class="btn ghost sm" data-act="changeEmail">Altă adresă</button></p>`
    :`<label class="field"><span>Adresa ta de e-mail</span><input id="loginEmail" type="email" inputmode="email" autocomplete="email" placeholder="nume@exemplu.ro" value="${esc(login.email)}"></label>
      <button class="btn primary" data-act="sendCode" style="width:100%;padding:14px"${login.busy?' disabled':''}>${login.busy?'Se trimite…':'Trimite-mi codul'}</button>
      <p class="fine">Fără parolă: îți trimitem un cod pe e-mail de fiecare dată când intri de pe un telefon nou.</p>`;
  return `<div class="welcome"><div class="wcard">${brand}
  <h1>${pendingCode?'Un cățel te așteaptă':'Tot ce ține de câinii tăi, într-un singur loc'}</h1>
  <p class="lead">${pendingCode?'Intră în cont ca să activezi fișa primită de la crescător.':'Pedigree, microcip, vaccinuri, expoziții, gestații și pui. Cu mementouri, ca să nu uiți nimic.'}</p>
  <div class="panel stack" style="gap:12px">${step}${login.err?`<p class="err" style="color:var(--bad);font-weight:600;font-size:14px">${esc(login.err)}</p>`:''}</div></div>
  <div class="wvis"><img data-photo="smp-hero" alt="" hidden>
    <div class="float f1"><span class="fi">${I(REMIC.vaccin)}</span><span>Rapel antirabic · Aria<small>mâine, 10:00</small></span></div>
    <div class="float f2"><span class="fi">${I(IC.scale)}</span><span>Puiul roșu +38 g/zi<small>×3,7 față de naștere</small></span></div>
    <div class="float f3"><span class="fi">${I(IC.ribbon)}</span><span>CACIB · BOB · BOG 2<small>Expoziția de la Timișoara</small></span></div></div></div>`}
function vWelcome(){const brand='<div class="brand"><span class="mark">A</span><div><b>Afix</b><small>Carnetul canisei</small></div></div>';
  if(!Store.ready)return `<div class="welcome"><div class="wcard">${brand}<p class="muted">Se verifică contul…</p></div></div>`;
  if(Store.needsLogin)return vLogin(brand);
  const back=!!S.account;const first=(Store.me?.name||'').split(' ')[0];
  return `<div class="welcome"><div class="wcard">${brand}
  <h1>${back?'Bine ai revenit'+(first?', '+esc(first):''):pendingCode?'Un cățel te așteaptă':'Tot ce ține de câinii tăi, într-un singur loc'}</h1>
  <p class="lead">${back?'Datele tale sunt salvate și te așteaptă.':pendingCode?'Crescătorul ți-a trimis fișa digitală a cățelului. Intră ca proprietar ca să o activezi.':'Pedigree, microcip, vaccinuri, expoziții, gestații și pui. Cu mementouri, ca să nu uiți nimic.'}</p>
  ${whoRow()}
  <div class="choices">${back?`<button class="choice primary" data-act="enter"><span class="ic">${I(IC.paw)}</span><span>Continuă${first?' ca '+esc(first):''}<small>${isOwnerRole()?'Profil de proprietar':'Profil de crescător'} · ${pl(S.dogs.length,'câine','câini')}</small></span>${I(ICH)}</button>`:''}
  <button class="choice${back||pendingCode?'':' primary'}" data-act="role" data-r="breeder"><span class="ic">${I(IC.nest)}</span><span>Sunt crescător<small>Câini, cuiburi, expoziții și transferul fișelor către noii proprietari</small></span>${I(ICH)}</button>
  <button class="choice${!back&&pendingCode?' primary':''}" data-act="role" data-r="owner"><span class="ic">${I(IC.paw)}</span><span>Am primit un cățel<small>${pendingCode?'Cod: '+esc(pendingCode.toUpperCase()):'Am un cod de transfer de la crescător'}</small></span>${I(ICH)}</button></div>
  <p class="fine">${Store.mode==='cloud'?'Datele tale se salvează în contul tău și le vezi doar tu, de pe orice telefon.':'Datele tale se salvează doar în acest browser.'}</p></div>
  <div class="wvis"><img data-photo="smp-hero" alt="" hidden>
    <div class="float f1"><span class="fi">${I(REMIC.vaccin)}</span><span>Rapel antirabic · Aria<small>mâine, 10:00</small></span></div>
    <div class="float f2"><span class="fi">${I(IC.scale)}</span><span>Puiul roșu +38 g/zi<small>×3,7 față de naștere</small></span></div>
    <div class="float f3"><span class="fi">${I(IC.ribbon)}</span><span>CACIB · BOB · BOG 2<small>Expoziția de la Timișoara</small></span></div></div></div>`}
