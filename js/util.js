'use strict';
/* ---------- utilities ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toTop=()=>{const s=document.getElementById("scroller");if(s)s.scrollTop=0};
const TIMEOUT=Symbol('timeout');
const withTimeout=(p,ms,fb)=>Promise.race([Promise.resolve(p),new Promise(r=>setTimeout(()=>r(fb),ms))]);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const isoD=dt=>dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
const today=()=>isoD(new Date());
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return isoD(d)};
const diff=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const F1=new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'short',year:'numeric'});
const F2=new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'short'});
const FM=new Intl.DateTimeFormat('ro-RO',{month:'long',year:'numeric'});
const FW=new Intl.DateTimeFormat('ro-RO',{weekday:'long',day:'numeric',month:'long'});
const fmt=s=>s?F1.format(pd(s)):'—';
const fmtS=s=>s?F2.format(pd(s)):'—';
function pl(n,one,many){if(n===1)return '1 '+one;const r=n%100;return n+((n>=20&&(r>=20||r===0))?' de ':' ')+many}
function ageStr(dob,ref){if(!dob)return '';const days=diff(dob,ref||today());if(days<0)return '';
  if(days<14)return pl(days,'zi','zile'); if(days<84)return pl(Math.floor(days/7),'săptămână','săptămâni');
  const a=pd(dob),b=pd(ref||today());let m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())m--;
  if(m<24)return pl(m,'lună','luni');const y=Math.floor(m/12),r=m%12;return pl(y,'an','ani')+(r?' '+pl(r,'lună','luni'):'')}
function rel(due){const d=diff(today(),due);if(d===0)return 'azi';if(d===1)return 'mâine';if(d===-1)return 'ieri';return d>0?'în '+pl(d,'zi','zile'):'întârziat '+pl(-d,'zi','zile')}
function stat(due){const d=diff(today(),due);return d<0?'late':d===0?'today':d<=14?'soon':'later'}
const fmtG=g=>g==null?'—':g<1000?Math.round(g)+' g':(g/1000).toFixed(2).replace('.',',')+' kg';
const fmtKg=k=>k==null?'—':String(k).replace('.',',')+' kg';
function fmtChip(s){s=String(s||'').replace(/\D/g,'');if(s.length!==15)return esc(s||'—');return `<em>${s.slice(0,3)}</em> ${s.slice(3,6)} ${s.slice(6,9)} ${s.slice(9,12)} ${s.slice(12)}`}
function hue(str){let h=0;for(const c of String(str))h=(h*31+c.charCodeAt(0))>>>0;const hs=[190,28,152,340,212,44,268,8];return `hsl(${hs[h%hs.length]} 32% 42%)`}
const I=(p,cls='i')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
  home:'<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  paw:'<circle cx="5.5" cy="10.5" r="1.9"/><circle cx="9.2" cy="5.8" r="1.9"/><circle cx="14.8" cy="5.8" r="1.9"/><circle cx="18.5" cy="10.5" r="1.9"/><path d="M12 11.5c-2.8 0-5.8 4.2-5.8 6.6 0 1.9 1.9 2.9 3.5 2.2 1.5-.6 3.1-.6 4.6 0 1.6.7 3.5-.3 3.5-2.2 0-2.4-3-6.6-5.8-6.6z"/>',
  nest:'<path d="M3 13h18"/><path d="M4 13c.6 4.2 3.8 7 8 7s7.4-2.8 8-7"/><circle cx="8" cy="9.6" r="2"/><circle cx="12.4" cy="8.6" r="2"/><circle cx="16.6" cy="10" r="1.7"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ribbon:'<circle cx="12" cy="9" r="5.5"/><circle cx="12" cy="9" r="2.2"/><path d="M8.6 13.4 7 21l5-2.6 5 2.6-1.6-7.6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', back:'<path d="m15 5-7 7 7 7"/>', check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cam:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>',
  scale:'<path d="M5 20h14l-1.6-11H6.6z"/><path d="M12 9V5M9 5h6"/>', edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  doc:'<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>'
};
