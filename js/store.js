'use strict';
/* ---------- storage: private per-viewer db, else this browser ---------- */
let S=makeSample();let dirty=false;
const Store={mode:'local',col:null,db:null,me:null,ready:false,q:Promise.resolve(),timer:null,cache:new Map(),
  async init(){
    try{
      let tries=0;while(!(window.claude&&typeof window.claude.use==='function')&&tries<10){await new Promise(r=>setTimeout(r,100));tries++}
      if(window.claude&&typeof window.claude.use==='function'){
        const [db,user]=await Promise.all([withTimeout(window.claude.use('db'),6000,null),withTimeout(window.claude.use('user'),6000,null)]);
        const id=user?await withTimeout(user.id(),4000,null):null;
        if(user)withTimeout(user.me(),8000,null).then(m=>{if(m){this.me=m;render()}}).catch(()=>{});
        if(db)this.db=db;
        if(db&&id){this.col=db.collection('data/users/'+id);this.mode='cloud'}
      }
    }catch(e){console.warn(e)}
    let data=null;
    if(this.mode==='cloud'){let got=false;
      for(let t=0;t<2&&!got;t++){try{const s=await withTimeout(this.col.doc('state').get(),7000,TIMEOUT);if(s===TIMEOUT)continue;got=true;if(s.exists)data=s.data().state||null}catch(e){console.warn(e)}}
      if(!got){this.mode='local';this.col=null;this.db=null;this.offline=true;try{const raw=localStorage.getItem('afix-state');if(raw)data=JSON.parse(raw)}catch(e){}}}
    else{try{const raw=localStorage.getItem('afix-state');if(raw)data=JSON.parse(raw)}catch(e){}}
    this.ready=true;return data;
  },
  save(){dirty=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),500)},
  flush(){if(!this.ready)return;const snap=JSON.parse(JSON.stringify(S));
    this.q=this.q.then(async()=>{try{
      if(this.mode==='cloud')await this.col.doc('state').set({state:snap,savedAt:new Date().toISOString()});
      else localStorage.setItem('afix-state',JSON.stringify(snap));
      setSync('ok')}catch(e){console.warn(e);setSync('err');toast(e&&e.code==='quota_exceeded'?'Spațiul de stocare e plin. Șterge câteva poze.':'Salvarea nu a reușit. Încearcă din nou.')}})},
  async putPhoto(id,data){this.cache.set(id,data);
    if(this.mode==='cloud')await this.col.doc('ph-'+id).set({data});
    else{try{localStorage.setItem('afix-ph-'+id,data)}catch(e){toast('Browserul nu mai are loc pentru poze.')}}},
  async getPhoto(id){if(!id)return null;if(id.startsWith('smp-'))return SMP[id.slice(4)]||null;if(this.cache.has(id))return this.cache.get(id);let v=null;
    try{if(this.mode==='cloud'){const s=await this.col.doc('ph-'+id).get();v=s.exists?s.data().data:null}else v=localStorage.getItem('afix-ph-'+id)}catch(e){}
    if(v)this.cache.set(id,v);return v},
  async delPhoto(id){if(!id||id.startsWith('smp-'))return;this.cache.delete(id);try{if(this.mode==='cloud')await this.col.doc('ph-'+id).delete();else localStorage.removeItem('afix-ph-'+id)}catch(e){}}
};
function setSync(st){const dot=$('#syncDot'),t=$('#syncTxt');if(!dot)return;dot.className='sync '+(st||'');
  t.textContent=Store.mode==='cloud'?'Salvat privat în contul tău':'Salvat în acest browser';if(st==='err')t.textContent='Salvare eșuată'}
const save=()=>{Store.save();render()};
