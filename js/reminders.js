'use strict';
/* ---------- lookups ---------- */
const dogById=id=>S.dogs.find(d=>d.id===id);
const litterById=id=>S.litters.find(l=>l.id===id);
const sireName=L=>{const s=dogById(L.sireId);return s?s.name:(L.sireExt||'mascul necunoscut')};
const isPregnant=dog=>S.litters.some(L=>L.damId===dog.id&&!L.whelped&&L.matings?.length&&diff(L.matings[0],today())<=75);
const lastWeigh=L=>{let m='';for(const p of L.puppies)for(const w of p.weights||[])if(w.date>m)m=w.date;return m};

/* ---------- reminders engine ---------- */
let REM=new Map();
function reminders(){
  const R=[],T=today();
  for(const dog of S.dogs){if(dog.status!=='activ')continue;
    const latest={};
    for(const h of dog.health||[]){if(!['vaccin','depInt','depExt'].includes(h.kind))continue;const key=h.kind==='vaccin'?'vaccin:'+h.sub:h.kind;if(!latest[key]||h.date>latest[key].date)latest[key]=h}
    for(const [key,h] of Object.entries(latest)){if(!h.next)continue;
      R.push({key:'h:'+dog.id+':'+key,due:h.next,type:h.kind,title:h.kind==='vaccin'?'Rapel vaccin: '+h.sub:HEALTH[h.kind].label,who:dog.name,sub:'ultima: '+fmt(h.date)+(h.product?' · '+h.product:''),dogId:dog.id,act:'redo',hid:h.id})}
    if(dog.sex==='F'&&!isPregnant(dog)&&(dog.heats||[]).length){
      const last=[...dog.heats].sort((a,b)=>a.start<b.start?1:-1)[0];const due=addDays(last.start,Number(dog.heatInterval||S.kennel.heatInterval||180));const key='heat:'+dog.id+':'+last.id;
      if(!S.done[key])R.push({key,due,type:'heat',title:'Călduri estimate',who:dog.name,sub:'progesteron din ziua 5–7 a căldurilor',dogId:dog.id,act:'heat'})}
    for(const p of dog.planned||[]){const key='p:'+dog.id+':'+p.id;if(S.done[key])continue;R.push({key,due:p.due,type:'plan',title:p.title,who:dog.name,sub:p.sub||'programat de crescător',dogId:dog.id,act:'done'})}
  }
  for(const L of S.litters){const dam=dogById(L.damId);const who=(dam?dam.name:'—')+' × '+sireName(L);
    if(!L.whelped){if(!L.matings?.length||diff(L.matings[0],T)>75)continue;
      for(const m of PREG){const key='L:'+L.id+':'+m.k;if(S.done[key])continue;R.push({key,due:addDays(L.matings[0],m.day),type:'preg',title:m.t,who,sub:'gestație, ziua '+m.day,litterId:L.id,act:m.k==='due'?'whelp':'done'})}}
    else{const age=diff(L.whelped,T);if(age>75)continue;
      for(const t of PUPT){const key='L:'+L.id+':'+t.k;if(S.done[key])continue;R.push({key,due:addDays(L.whelped,t.day),type:'pup',title:t.t,who:'Cuib '+who,sub:'pui, ziua '+t.day,litterId:L.id,act:'done'})}
      if(L.puppies.length&&age<=56){const lw=lastWeigh(L);
        if(age<=14){if(lw!==T)R.push({key:'w:'+L.id+':'+T,due:T,type:'weigh',title:'Cântărire zilnică a puilor',who:'Cuib '+who,sub:'primele 14 zile: zilnic, la aceeași oră',litterId:L.id,act:'weigh'})}
        else{const due=addDays(lw||L.whelped,7);R.push({key:'w:'+L.id+':'+due,due,type:'weigh',title:'Cântărire săptămânală a puilor',who:'Cuib '+who,sub:'ultima: '+fmt(lw),litterId:L.id,act:'weigh'})}}}
  }
  R.sort((a,b)=>a.due<b.due?-1:a.due>b.due?1:0);REM=new Map(R.map(r=>[r.key,r]));return R;
}
const ACTLBL={redo:'Înregistrează',done:'Făcut',weigh:'Cântărește',heat:'Notează',whelp:'Fătare'};
const REMIC={vaccin:'<path d="m18 2 4 4M15 5l4 4M17.5 6.5 9 15M6 14l4 4M4.5 19.5 7 17M11 7l6 6-7.5 7.5a2.1 2.1 0 0 1-3 0l-1-1a2.1 2.1 0 0 1 0-3z"/>',depInt:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m9 8.7 6 6.6"/>',depExt:'<path d="M12 3s6 4.5 6 10a6 6 0 0 1-12 0c0-5.5 6-10 6-10z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/>',heat:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',preg:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',pup:IC.paw,weigh:IC.scale,plan:IC.cal};
function remRow(r,showWho=true){const st=stat(r.due);
  return `<div class="rem ${st}"><span class="stripe">${I(REMIC[r.type]||IC.cal)}</span><div><div class="rem-title">${esc(r.title)}</div><div class="rem-sub">${showWho?'<b>'+esc(r.who)+'</b> · ':''}${esc(r.sub||'')}</div></div>
  <div class="rem-side"><div class="rem-when"><b>${rel(r.due)}</b><small>${fmtS(r.due)}</small></div><button class="btn sm${st==='late'||st==='today'?' primary':''}" data-act="rem" data-key="${esc(r.key)}">${ACTLBL[r.act]}</button></div></div>`}
