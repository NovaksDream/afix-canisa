'use strict';
/* Sample kennel photos: Unsplash, free license (unsplash.com/license) */
const SMP={aria:'assets/sample/aria.jpg',luna:'assets/sample/luna.jpg',mira:'assets/sample/mira.jpg',bruno:'assets/sample/bruno.jpg',nova:'assets/sample/nova.jpg',pup1:'assets/sample/pup1.jpg',pup2:'assets/sample/pup2.jpg',pup3:'assets/sample/pup3.jpg',hero:'assets/sample/hero.jpg'};
/* ---------- sample kennel (relative to today) ---------- */
function makeSample(){
  const T=today(),d=n=>addDays(T,n);let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const H=(kind,sub,date,next,product,extra)=>Object.assign({id:uid(),kind,sub,date,next:next||'',product:product||'',notes:''},extra||{});
  const W0=d(-23);
  const days=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,17,20,23];
  const pup=(collar,sex,color,bw,f,extra)=>{let prev=bw;const weights=days.map(dd=>{let g;
    if(dd===0)g=bw;else if(dd===1)g=bw*(0.95+rnd()*0.05);else{g=bw*(1+0.095*f*dd+0.0023*f*dd*dd)*(1+(rnd()-.5)*.025);if(g<prev*1.015)g=prev*1.015}
    prev=g;return {date:addDays(W0,dd),g:Math.round(g)}});
    return Object.assign({id:uid(),collar,name:'',sex,color,birthWeight:bw,birthTime:'',status:'Disponibil',buyer:'',buyerContact:'',price:'',deposit:'',chip:'',notes:'',weights},extra||{})};
  const aria={id:uid(),name:'Aria',regName:'Aria din Valea Luminii',breed:'Golden Retriever',sex:'F',dob:d(-4*365-40),color:'Auriu deschis',chip:'642093100123456',tattoo:'',passport:'RO 0123456',pedigreeNo:'LOR 21457',sire:'Ch. Northern Light Oscar',dam:'Valea Luminii Bella',breeder:'Canisa Valea Luminii',owner:'',titles:'Campion al României',status:'activ',heatInterval:190,notes:'Temperament excelent, recomandată pentru reproducție.',photoId:'',
    health:[H('vaccin','Antirabic',d(-350),d(15),'Nobivac Rabies'),H('vaccin','Polivalent (DHPPi+L)',d(-350),d(15),'Nobivac DHPPi + L4'),H('vaccin','Tuse de canisă (KC)',d(-200),d(165),'Nobivac KC'),
      H('depInt','Comprimat',d(-95),d(-5),'Milbemax'),H('depExt','Comprimat 1 lună',d(-24),d(6),'NexGard Spectra'),
      H('test','Displazie de șold (HD)',d(-900),'','Evaluator oficial',{result:'HD-A'}),H('test','Displazie de cot (ED)',d(-900),'','Evaluator oficial',{result:'ED-0'}),H('test','Examen oftalmologic',d(-120),'','ECVO',{result:'Neafectat'})],
    weights:[{date:d(-300),kg:29.4},{date:d(-210),kg:30.1},{date:d(-120),kg:29.8},{date:d(-30),kg:30.6}],
    shows:[{id:uid(),date:d(-130),name:'CACIB Timișoara',city:'Timișoara',type:'CACIB (internațională)',judge:'M. Kovács (HU)',cls:'Campioni',grade:'Excelent',place:'1',titles:['CACIB','BOB','BOG 2'],notes:''},
      {id:uid(),date:d(-60),name:'Expoziția clubului de rasă',city:'Brașov',type:'Expoziția clubului',judge:'A. Pop (RO)',cls:'Campioni',grade:'Excelent',place:'1',titles:['CAC','BOS'],notes:'Foarte bine prezentată în mișcare.'},
      {id:uid(),date:d(-18),name:'CAC Cluj-Napoca',city:'Cluj-Napoca',type:'CAC (națională)',judge:'L. Ionescu (RO)',cls:'Campioni',grade:'Excelent',place:'2',titles:[],notes:''}],
    heats:[{id:uid(),start:d(-150),end:d(-129),prog:'z6: 2,1 · z9: 6,4 · z10: 11,2 ng/ml',notes:'Nemontată.'}],docs:[]};
  const bruno={id:uid(),name:'Bruno',regName:'Goldhaven Bruno of Carpathia',breed:'Golden Retriever',sex:'M',dob:d(-5*365-12),color:'Auriu',chip:'642093100118802',tattoo:'',passport:'RO 0118802',pedigreeNo:'LOE 19822',sire:'Multi Ch. Goldhaven Rex',dam:'Goldhaven Sunny Day',breeder:'Goldhaven Kennel',owner:'',titles:'Grand Campion al României, Campion Internațional (C.I.B.)',status:'activ',notes:'',photoId:'',
    health:[H('vaccin','Antirabic',d(-325),d(40),'Rabisin'),H('vaccin','Polivalent (DHPPi+L)',d(-325),d(40),'Eurican DAPPi-L'),H('depInt','Comprimat',d(-40),d(50),'Drontal Plus'),H('depExt','Comprimat 3 luni',d(-50),d(34),'Bravecto'),
      H('test','Displazie de șold (HD)',d(-1300),'','Evaluator oficial',{result:'HD-A'}),H('test','Test ADN',d(-1100),'','Laborator genetic',{result:'PRA-prcd: Clear, ICH: Clear'})],
    weights:[{date:d(-200),kg:36.2},{date:d(-20),kg:35.8}],
    shows:[{id:uid(),date:d(-230),name:'CACIB București',city:'București',type:'CACIB (internațională)',judge:'P. Rossi (IT)',cls:'Campioni',grade:'Excelent',place:'1',titles:['CACIB','BOB','BOG 1','BIS 3'],notes:''}],heats:[],docs:[]};
  const luna={id:uid(),name:'Luna',regName:'Luna din Valea Luminii',breed:'Golden Retriever',sex:'F',dob:d(-3*365-100),color:'Auriu',chip:'642093100131177',tattoo:'',passport:'RO 0131177',pedigreeNo:'LOR 23610',sire:'Goldhaven Bruno of Carpathia',dam:'Aria din Valea Luminii',breeder:'Canisa Valea Luminii',owner:'',titles:'Junior Campion',status:'activ',heatInterval:180,notes:'',photoId:'',
    health:[H('vaccin','Antirabic',d(-150),d(215),'Nobivac Rabies'),H('vaccin','Polivalent (DHPPi+L)',d(-150),d(215),'Nobivac DHPPi + L4'),H('depInt','Comprimat',d(-9),d(81),'Drontal Plus'),H('depExt','Pipetă (spot-on)',d(-35),d(-5),'Frontline Combo'),
      H('vet','Consult reproducție',d(-60),'','Dr. M. Stan',{result:'Ecografie: 7 embrioni viabili'})],
    weights:[{date:d(-120),kg:27.9},{date:d(-30),kg:31.8},{date:d(-20),kg:28.4}],shows:[{id:uid(),date:d(-420),name:'CAC Sibiu',city:'Sibiu',type:'CAC (națională)',judge:'R. Dumitru (RO)',cls:'Junior (9–18 luni)',grade:'Excelent',place:'1',titles:['CAJC','Best Junior'],notes:''}],
    heats:[{id:uid(),start:d(-100),end:d(-80),prog:'z7: 3,4 · z9: 7,8 ng/ml',notes:'Montată cu Bruno.'}],docs:[]};
  const mira={id:uid(),name:'Mira',regName:'Mira Golden Autumn',breed:'Golden Retriever',sex:'F',dob:d(-2*365-60),color:'Auriu închis',chip:'642093100140091',tattoo:'',passport:'RO 0140091',pedigreeNo:'LOR 25014',sire:'Autumn Gold Felix',dam:'Autumn Gold Cara',breeder:'Autumn Gold',owner:'',titles:'',status:'activ',heatInterval:180,notes:'Prima gestație.',photoId:'',
    health:[H('vaccin','Antirabic',d(-80),d(285),'Rabisin'),H('vaccin','Polivalent (DHPPi+L)',d(-80),d(285),'Eurican DAPPi-L'),H('depInt','Comprimat',d(-70),d(20),'Milbemax'),H('depExt','Pipetă (spot-on)',d(-12),d(18),'Frontline Combo')],
    weights:[{date:d(-45),kg:27.1},{date:d(-5),kg:30.2}],shows:[],heats:[{id:uid(),start:d(-47),end:d(-27),prog:'z6: 1,9 · z8: 5,2 · z10: 9,6 ng/ml',notes:'Monte în zilele 10 și 12.'}],docs:[]};
  const nova={id:uid(),name:'Nova',regName:'Nova din Valea Luminii',breed:'Golden Retriever',sex:'F',dob:d(-330),color:'Crem',chip:'642093100152264',tattoo:'',passport:'RO 0152264',pedigreeNo:'LOR 26871',sire:'Goldhaven Bruno of Carpathia',dam:'Aria din Valea Luminii',breeder:'Canisa Valea Luminii',owner:'',titles:'',status:'activ',heatInterval:180,notes:'Păstrată din cuibul A.',photoId:'',
    health:[H('vaccin','Antirabic',d(-230),d(4),'Nobivac Rabies'),H('vaccin','Polivalent (DHPPi+L)',d(-230),d(4),'Nobivac DHPPi + L4'),H('depInt','Comprimat',d(-88),d(2),'Milbemax'),H('depExt','Comprimat 1 lună',d(-20),d(10),'NexGard')],
    weights:[{date:d(-270),kg:5.1},{date:d(-210),kg:13.4},{date:d(-120),kg:21.9},{date:d(-30),kg:26.0}],
    shows:[{id:uid(),date:d(-60),name:'Expoziția clubului de rasă',city:'Brașov',type:'Expoziția clubului',judge:'A. Pop (RO)',cls:'Junior (9–18 luni)',grade:'Excelent',place:'1',titles:['CAJC','Best Junior'],notes:''},
      {id:uid(),date:d(-18),name:'CAC Cluj-Napoca',city:'Cluj-Napoca',type:'CAC (națională)',judge:'L. Ionescu (RO)',cls:'Junior (9–18 luni)',grade:'Excelent',place:'1',titles:['CAJC','Best Junior','BIS Junior'],notes:'Prima victorie de grup!'}],heats:[],docs:[]};
  const L1={id:uid(),damId:luna.id,sireId:bruno.id,sireExt:'',matings:[d(-86),d(-84)],whelped:W0,notes:'Fătare naturală, 6 h. Mama în formă bună.',
    puppies:[pup('Roșu','M','Auriu',455,1.03,{status:'Rezervat',buyer:'Familia Ionescu',buyerContact:'0722 000 000',deposit:'1.000 lei'}),pup('Albastru','M','Auriu',432,1),pup('Verde','F','Crem',398,1.02,{status:'Rămâne în canisă'}),
      pup('Galben','F','Auriu',412,0.98),pup('Mov','M','Auriu închis',441,1),pup('Portocaliu','F','Crem',338,0.8,{notes:'Cel mai mic pui: suplimentare cu lapte praf de 2× pe zi.'}),pup('Roz','F','Auriu',405,0.99,{status:'Rezervat',buyer:'A. Marinescu'})]};
  const L2={id:uid(),damId:mira.id,sireId:'',sireExt:'Multi Ch. Goldhill Sunny Boy',matings:[d(-38),d(-36)],whelped:'',notes:'Mascul extern, montă naturală. Progesteron la montă: 9,6 ng/ml.',puppies:[]};
  aria.photoId='smp-aria';luna.photoId='smp-luna';mira.photoId='smp-mira';bruno.photoId='smp-bruno';nova.photoId='smp-nova';
  L1.puppies[0].photoId='smp-pup3';L1.puppies[2].photoId='smp-pup1';L1.puppies[5].photoId='smp-pup2';
  const done={};done['L:'+L1.id+':anunt']=d(-20);done['L:'+L1.id+':dep2']=d(-9);done['L:'+L2.id+':decl']=d(-36);
  return {v:1,sample:true,kennel:{name:'Canisa Valea Luminii',affix:'din Valea Luminii',owner:'Andreea',city:'Brașov',club:'Clubul Retrieverilor',breeds:['Golden Retriever'],phone:'0740 000 000',email:'contact@exemplu.ro',heatInterval:180},dogs:[aria,luna,mira,bruno,nova],litters:[L1,L2],done,transfers:[]};
}
const emptyState=()=>({v:1,sample:false,kennel:{name:'',affix:'',owner:'',city:'',club:'',breeds:[],phone:'',email:'',heatInterval:180},dogs:[],litters:[],done:{},transfers:[]});
