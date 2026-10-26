'use strict';
/* ---------- storage: Supabase account when configured, else this browser ---------- */
let S=makeSample();let dirty=false;
const SB_CFG=(typeof AFIX_CONFIG!=='undefined'&&AFIX_CONFIG.supabase)||{};
const PHOTO_URL_TTL=3600;
const Store={mode:'local',sb:null,user:null,me:null,ready:false,needsLogin:false,offline:false,q:Promise.resolve(),timer:null,cache:new Map(),
  get configured(){return !!(SB_CFG.url&&SB_CFG.anonKey&&window.supabase&&window.supabase.createClient)},
  async init(){
    if(this.configured){
      try{
        this.sb=window.supabase.createClient(SB_CFG.url,SB_CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
        const res=await withTimeout(this.sb.auth.getSession(),8000,TIMEOUT);
        if(res===TIMEOUT)throw new Error('auth timeout');
        const session=res.data&&res.data.session;
        if(!session){this.needsLogin=true;this.ready=true;return null}
        return await this.useSession(session);
      }catch(e){console.warn(e);this.offline=true;this.mode='local'}
    }
    let data=null;try{const raw=localStorage.getItem('afix-state');if(raw)data=JSON.parse(raw)}catch(e){}
    this.ready=true;return data;
  },
  async useSession(session){
    this.user=session.user;this.mode='cloud';this.needsLogin=false;
    this.me={name:session.user.email||'',email:session.user.email||'',avatarUrl:null};
    const {data,error}=await this.sb.from('kennel_state').select('state').eq('user_id',this.user.id).maybeSingle();
    if(error)throw error;
    this.ready=true;return data?data.state:null;
  },
  async sendCode(email){
    const {error}=await this.sb.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});
    if(error)throw error},
  async verifyCode(email,token){
    const {data,error}=await this.sb.auth.verifyOtp({email,token,type:'email'});
    if(error)throw error;return this.useSession(data.session)},
  async signOut(){try{await this.sb?.auth.signOut()}catch(e){}try{localStorage.removeItem('afix-state')}catch(e){}location.reload()},
  save(){dirty=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),500)},
  flush(){if(!this.ready||this.needsLogin)return;const snap=JSON.parse(JSON.stringify(S));
    this.q=this.q.then(async()=>{try{
      if(this.mode==='cloud'){const {error}=await this.sb.from('kennel_state').upsert({user_id:this.user.id,state:snap,updated_at:new Date().toISOString()});if(error)throw error}
      else localStorage.setItem('afix-state',JSON.stringify(snap));
      setSync('ok')}catch(e){console.warn(e);setSync('err');toast('Salvarea nu a reușit. Verifică internetul și încearcă din nou.')}})},
  photoPath(id){return this.user.id+'/'+id+'.jpg'},
  async putPhoto(id,data){
    if(this.mode!=='cloud'){this.cache.set(id,data);try{localStorage.setItem('afix-ph-'+id,data)}catch(e){toast('Browserul nu mai are loc pentru poze.')}return}
    const blob=await toBlob(data);
    const {error}=await this.sb.storage.from('photos').upload(this.photoPath(id),blob,{contentType:blob.type||'image/jpeg',upsert:true});
    if(error)throw error;
    this.cache.set(id,{url:data.startsWith('data:')?data:URL.createObjectURL(blob),until:Infinity})},
  async getPhoto(id){if(!id)return null;if(id.startsWith('smp-'))return SMP[id.slice(4)]||null;
    const c=this.cache.get(id);if(c)return typeof c==='string'?c:(c.until>Date.now()?c.url:this.refreshPhoto(id));
    return this.refreshPhoto(id)},
  async refreshPhoto(id){let v=null;
    try{if(this.mode==='cloud'){const {data}=await this.sb.storage.from('photos').createSignedUrl(this.photoPath(id),PHOTO_URL_TTL);v=data?.signedUrl||null;if(v)this.cache.set(id,{url:v,until:Date.now()+(PHOTO_URL_TTL-120)*1000})}
      else{v=localStorage.getItem('afix-ph-'+id);if(v)this.cache.set(id,v)}}catch(e){}
    return v},
  /* the photo as a data: URL, for copying it into a transfer package */
  async getPhotoData(id){const v=await this.getPhoto(id);if(!v||v.startsWith('data:'))return v;
    try{return await blobToDataURL(await (await fetch(v)).blob())}catch(e){return null}},
  async delPhoto(id){if(!id||id.startsWith('smp-'))return;this.cache.delete(id);
    try{if(this.mode==='cloud')await this.sb.storage.from('photos').remove([this.photoPath(id)]);else localStorage.removeItem('afix-ph-'+id)}catch(e){}}
};
async function toBlob(src){
  if(src.startsWith('data:')){const [head,b64]=src.split(',');const mime=(head.match(/data:([^;]+)/)||[])[1]||'image/jpeg';
    const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:mime})}
  return (await fetch(src)).blob()}
const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
function setSync(st){const dot=$('#syncDot'),t=$('#syncTxt');if(!dot)return;dot.className='sync '+(st||'');
  t.textContent=Store.mode==='cloud'?'Salvat în contul tău':'Salvat în acest browser';if(st==='err')t.textContent='Salvare eșuată'}
const save=()=>{Store.save();render()};
