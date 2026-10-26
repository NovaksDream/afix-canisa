'use strict';
/* ---------- install on the phone (PWA) ---------- */
let installPrompt=null;
const UA=navigator.userAgent||'';
const isIOS=/iPhone|iPad|iPod/.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isInAppBrowser=/FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok|Snapchat|musical_ly/i.test(UA);
const isSamsung=/SamsungBrowser/i.test(UA);
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const INSTALL_ICON='<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>';

/* Chrome / Edge on Android offer a real install prompt; keep it for our button */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(typeof render==='function')render()});
window.addEventListener('appinstalled',()=>{installPrompt=null;if(typeof toast==='function')toast('Afix e instalată pe telefon');if(typeof render==='function')render()});

const canOfferInstall=()=>!isStandalone();
function installButton(cls='btn'){return canOfferInstall()?`<button class="${cls}" data-act="install">${I(INSTALL_ICON)} Instalează aplicația</button>`:''}
function installBanner(){
  if(!canOfferInstall())return '';
  try{if(localStorage.getItem('afix-install-hide'))return ''}catch(e){}
  return `<div class="banner install-banner"><span class="ib-ic">${I(INSTALL_ICON)}</span><p><b>Pune Afix pe ecranul telefonului.</b> Se deschide ca o aplicație, pe tot ecranul, și merge și fără semnal.</p>
  <div class="row-actions"><button class="btn sm primary" data-act="install">Instalează</button><button class="btn sm ghost" data-act="hideInstall">Mai târziu</button></div></div>`}

async function doInstall(){
  if(installPrompt){const p=installPrompt;installPrompt=null;p.prompt();try{await p.userChoice}catch(e){}render();return}
  installSheet()}

function installSheet(){FORM={install:true};
  const url=location.origin+location.pathname;
  let intro,steps;
  if(isInAppBrowser){
    intro='Ai deschis linkul din altă aplicație (Facebook, Instagram, Messenger…). Browserul ei nu poate instala aplicații.';
    steps=['Apasă butonul cu trei puncte <b>⋯</b> sau <b>⋮</b> din colțul de sus.','Alege <b>Deschide în browser</b> (Chrome sau Safari).','Acolo apasă din nou <b>Instalează aplicația</b> din Afix.'];
  }else if(isIOS){
    intro='Pe iPhone și iPad instalarea se face din meniul Partajează, în câteva secunde.';
    steps=[`Apasă butonul <b>Partajează</b> <span class="kbd">${I('<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/>')}</span>: jos, în mijlocul ecranului (pe iPad, sus în dreapta).`,'Derulează lista și alege <b>Adaugă pe ecranul principal</b>.','Apasă <b>Adaugă</b>, sus în dreapta. Iconița Afix apare lângă celelalte aplicații.'];
  }else if(isSamsung){
    intro='În Samsung Internet instalarea se face din meniul browserului.';
    steps=['Apasă meniul <b>≡</b>, jos în dreapta.','Alege <b>Adaugă pagina la</b> → <b>Ecran de pornire</b>.','Confirmă cu <b>Adaugă</b>.'];
  }else{
    intro='Instalarea se face din meniul browserului Chrome.';
    steps=['Apasă meniul <b>⋮</b>, sus în dreapta.','Alege <b>Instalează aplicația</b> sau <b>Adaugă pe ecranul de pornire</b>.','Confirmă cu <b>Instalează</b>. Iconița Afix apare pe ecranul telefonului.'];
  }
  $('#modal').innerHTML=`<div class="scrim" data-scrim><div class="sheet"><header><h2>Instalează Afix</h2><button class="icon-btn" data-close aria-label="Închide">${I(IC.x)}</button></header>
  <div class="sbody"><p style="color:var(--ink-2)">${intro}</p><ol class="steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
  ${isInAppBrowser?`<p class="fine">Sau copiază adresa și lipește-o în Chrome / Safari:</p><div class="msgbox mono" id="instUrl">${esc(url)}</div>`:''}
  <p class="fine">Nu apare opțiunea? Reîncarcă pagina o dată și așteaptă câteva secunde.</p></div>
  <footer>${isInAppBrowser?'<button class="btn" id="cpUrl">Copiază adresa</button>':''}<span class="sp"></span><button class="btn primary" data-close>Am înțeles</button></footer></div></div>`;
  bindSheet();
  const cp=$('#cpUrl');if(cp)cp.onclick=()=>copyText(url,$('#instUrl'))}
