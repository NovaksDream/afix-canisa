'use strict';
/* ---------- domain knowledge ---------- */
const HEALTH={
  vaccin:{label:'Vaccin',plural:'Vaccinuri',subs:['Antirabic','Polivalent (DHPPi+L)','Tuse de canisă (KC)','Leptospiroză','Parvoviroză (pui)','Altul'],
    days:{'Antirabic':365,'Polivalent (DHPPi+L)':365,'Tuse de canisă (KC)':365,'Leptospiroză':365,'Parvoviroză (pui)':21},prod:'ex: Nobivac Rabies, lot 123A'},
  depInt:{label:'Deparazitare internă',plural:'Deparazitări interne',subs:['Comprimat','Pastă','Suspensie','Spot-on'],days:{_:90},prod:'ex: Milbemax, Drontal Plus'},
  depExt:{label:'Deparazitare externă',plural:'Deparazitări externe',subs:['Pipetă (spot-on)','Comprimat 1 lună','Comprimat 3 luni','Zgardă','Spray'],
    days:{'Pipetă (spot-on)':30,'Comprimat 1 lună':30,'Comprimat 3 luni':84,'Zgardă':240,'Spray':30},prod:'ex: NexGard, Bravecto, Seresto'},
  test:{label:'Test de sănătate',plural:'Teste de sănătate',subs:['Displazie de șold (HD)','Displazie de cot (ED)','Examen oftalmologic','Test ADN','Luxație de patelă','Examen cardiac','Test auz (BAER)','Altul'],prod:'Laborator / evaluator'},
  vet:{label:'Vizită la veterinar',plural:'Vizite la veterinar',subs:['Control de rutină','Tratament','Intervenție chirurgicală','Urgență','Consult reproducție'],prod:'Diagnostic / tratament'}
};
const nextDays=(kind,sub)=>{const d=HEALTH[kind]?.days;if(!d)return null;return d[sub]??d._??null};
const PREG=[
  {k:'decl',day:2,t:'Declarația de montă, semnată de proprietarul masculului'},
  {k:'eco',day:28,t:'Ecografie de confirmare a gestației'},
  {k:'food',day:35,t:'Trece femela pe hrană pentru gestație / pui'},
  {k:'rx',day:55,t:'Radiografie: numărarea puilor'},
  {k:'box',day:56,t:'Pregătește cutia de fătare, cântarul, zgărdițele'},
  {k:'temp',day:58,t:'Măsoară temperatura rectală de 2× pe zi (sub 37 °C: fătare în ~24 h)'},
  {k:'due',day:63,t:'Data estimată a fătării'}];
const PUPT=[
  {k:'anunt',day:3,t:'Anunță fătarea la clubul de rasă / AChR'},
  {k:'dep2',day:14,t:'Deparazitare pui (2 săpt.) + mama'},
  {k:'dep4',day:28,t:'Deparazitare pui (4 săpt.)'},
  {k:'wean',day:28,t:'Începe înțărcarea: terci / hrană umedă'},
  {k:'dep6',day:42,t:'Deparazitare pui (6 săpt.)'},
  {k:'vac1',day:45,t:'Primul vaccin al puilor'},
  {k:'chip',day:49,t:'Microcipare pui și carnete de sănătate'},
  {k:'eval',day:52,t:'Evaluarea cuibului și cererea de pedigree'},
  {k:'dep8',day:56,t:'Deparazitare pui (8 săpt.)'},
  {k:'go',day:60,t:'Puii pot pleca la noii stăpâni, cu contract și dosar'}];
const COLLARS={'Roșu':'#D2372C','Albastru':'#2D6BD1','Verde':'#2E9B55','Galben':'#E2B21C','Mov':'#8A4FC7','Portocaliu':'#E7771E','Roz':'#E46FA5','Turcoaz':'#16A5A5','Maro':'#8A5A36','Bleu':'#6EB6F0','Lime':'#98C93C','Gri':'#8C9490','Negru':'#2A2A2A','Alb':'#F4F4F2'};
const collarC=n=>COLLARS[n]||'#8C9490';
const SHOW_TITLES=['CAC','R.CAC','CACIB','R.CACIB','CAJC','CAVC','BOB','BOS','Best Junior','Best Puppy','BOG 1','BOG 2','BOG 3','BOG 4','BIS 1','BIS 2','BIS 3','BIS Junior','BIS Puppy','Club Winner'];
const SHOW_CLASSES=['Baby (3–6 luni)','Puppy (6–9 luni)','Junior (9–18 luni)','Intermediară (15–24 luni)','Deschisă (15+ luni)','Lucru','Campioni','Veterani (8+ ani)'];
const GRADES=['Excelent','Foarte bun','Bun','Suficient','Descalificat','Nu poate fi judecat','Foarte promițător','Promițător','Nepromițător'];
const SHOW_TYPES=['CACIB (internațională)','CAC (națională)','Specială de rasă','Expoziția clubului','Concurs de lucru / sport'];
const BREEDS=['Golden Retriever','Labrador Retriever','Ciobănesc German','Ciobănesc Românesc Carpatin','Ciobănesc Românesc Mioritic','Ciobănesc de Bucovina','Bichon Maltez','Bichon Frisé','Caniche','Yorkshire Terrier','Chihuahua','Cavalier King Charles','Bulldog Francez','Bulldog Englez','Rottweiler','Doberman','Cane Corso','Samoyed','Husky Siberian','Border Collie','Shih Tzu','Pomeranian (Spitz pitic)','Akita Inu','Shiba Inu','Beagle','Teckel','Boxer','Dog German','Bernez','Pug'];
const PUP_STATUS=['Disponibil','Rezervat','Vândut','Rămâne în canisă'];
const pupPill=s=>({'Disponibil':'acc','Rezervat':'warn','Vândut':'ok','Rămâne în canisă':'gold'}[s]||'');
