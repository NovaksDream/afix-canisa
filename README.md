# Afix · carnetul canisei

Aplicație pentru crescătorii de câini: fișe cu pedigree și microcip, vaccinuri și deparazitări cu mementouri, rezultate de expoziție, călduri, gestații, cuiburi cu curba de creștere a puilor și transferul fișei puiului către noul proprietar.

Aplicația e gândită doar pentru telefon. Pe ecrane mari apare centrată, cât un telefon.

## Structura proiectului

```
index.html            pagina aplicației
css/app.css           tot aspectul (culori, fonturi, animații)
js/config.js          setările Supabase (adresa proiectului și cheia publică)
js/util.js            funcții ajutătoare: date, formatare, iconițe
js/domain.js          cunoștințe de chinologie: vaccinuri, deparazitări, gestație, programul puilor, titluri
js/sample.js          canisa exemplu (date relative la ziua de azi)
js/store.js           salvarea datelor (acum: în browser; urmează: Supabase)
js/reminders.js       motorul de mementouri
js/views.js           ecranele: Azi, Câini, fișa câinelui, Cuiburi, Calendar, Expoziții, Setări
js/forms.js           formularele și ferestrele care urcă de jos
js/account.js         ecranul de intrare și alegerea rolului
js/transfer.js        codurile de transfer, criptarea și plata
js/app.js             acțiunile butoanelor și pornirea aplicației
assets/sample/        pozele canisei exemplu (Unsplash, licență gratuită)
supabase/schema.sql   baza de date și regulile de acces
prototype/            prototipul inițial, într-un singur fișier
```

Scripturile se încarcă în ordinea din `index.html` și își împart funcțiile. Nu e nevoie de compilare: folderul se poate pune direct pe un hosting static.

## Pornire locală

Din acest folder:

```
py -m http.server 8765
```

apoi deschide http://localhost:8765 în browser. Fără setările Supabase, datele se salvează doar în browserul respectiv.

## Supabase

1. În Supabase: **SQL Editor → New query**, lipește tot conținutul din `supabase/schema.sql` și apasă **Run**.
2. În **Project Settings → API** copiază **Project URL** și cheia **anon / publishable** în `js/config.js`.
3. Nu pune niciodată cheia **service_role / secret** în aplicație sau în Git.

## Pozele canisei exemplu

Fotografii de pe [Unsplash](https://unsplash.com/license), cu licență gratuită, inclusiv pentru uz comercial.
