# AutoHub — načrt prenosa Claude Design izvozov v platformo

Datum: 13. 10. 2026. Vir: `C:\Users\marti\OneDrive\Desktop\Autohub rebrand`.

## Cilj in pravilo izvedbe

Celotno avtomobilsko platformo prenesemo v priloženi AutoHub dizajn. Izvozi so merodajen vir za razporeditev, tipografijo, barve, slike, ikone, razmake, zaoblitve, sence in prikazana stanja. Animacije so samostojen pogoj dokončanja vsakega sklopa. Podobnost se preverja s primerjavo v brskalniku, ne zgolj z branjem kode.

Vsak izvoz mora dobiti določeno uporabo: produkcijski zaslon, stanje zaslona, korak toka ali vir skupnih komponent. Ločeni izvozi korakov in modalnih oken niso avtomatično ločene produkcijske strani.

Izvedba je bila po odobritvi uporabnika začeta 13. 10. 2026. Podroben status izvedenega in preostalega dela je v `IMPLEMENTATION-STATUS.md`.

### Trenutna kontrolna točka izvedbe

| Reference | Native izvedba | Preostali ključni pogoji |
|---|---|---|
| 01–04 | Skupna osnova, domov, kartice iskanja, povzetek oglasa | Vsa podrobna stanja in podatkovna zgodovina cene |
| 05–06 | Zasebne mape in kanban deske, opombe, osebni glasovi | Skupna raba z dovoljenji, povabila, arhiv in živa verifikacija zapisov |
| 07–08 | Imenik, povezan zemljevid, originalne poslovne SVG ikone | Priklop imenika na žive podatke podjetij |
| 09–10 | Napredno iskanje avtomobilov in motorjev, pomnjenje po razdelkih, enaka pravila števca/rezultatov | Histogram, podrobni povzetki in zajem vseh lastnosti v objavnem toku |
| 11, 73–74 | Naslednji predvideni sklop: gume, deli in katalog | Prenos native prikazov, podatkov, stanj in animacij |

To je pregled funkcionalno prenesenih sklopov, ne potrdilo, da je vseh 74 izvozov že izvedenih do zadnjega stanja.

## Kaj je bilo dejansko pregledano

- Pregledana je struktura vseh **74 ZIP-ov**, njihova HTML koda, deklaracije gibanja, logika komponent, predogledne dimenzije, pisave in medijske poizvedbe. Popis in SHA-256 arhivov sta v `autohub-export-inventory.json`.
- Uporabnik je dodal **60 Primerjava · stanja**. Vseh 74 številk je zdaj prisotnih; izvoz 60 sodi v isti tok kot 59.
- V arhivih je 407 pojavitev datotek `assets/`, vendar samo **48 različnih datotek oziroma vsebin**. Pri enakih imenih ni bilo različnih vsebin. Deduplikacija omogoča eno skupno knjižnico brez izgube referenc.
- Vsak izvoz vsebuje `.dc.html`, `support.js`, React runtime in README. README jih opredeli kot referenčne mockupe. V vseh 74 je komponentna logika enaka: `renderVals()` vrne prazen objekt. Številne povezave imajo `href="#"`.
- **53 izvozov** vsebuje CSS prehode; **21 jih nima**. V HTML predlogah ni bilo najdenih `@keyframes`. Animacije v `support.js` so infrastruktura orodja in niso dokaz animacij izdelka.
- V lokalnem HTTP predogledu so bili odprti 01 Domov, 04 Oglas, 29 B2B pregled, 35 Registracija in 63 Zemljevid. Pri teh petih ni bilo zaznanih napak JavaScript. To ne potrjuje funkcionalnosti vseh izvozov.
- Pri predogledu 01 na telefonu: viewport **390 px**, širina dokumenta **695 px**; sponzorirana kartica prekriva naslov. Mobilna izvedba potrebuje dodatno delo.
- Trenutni projekt: Vite, React in obstoječi SPA usmerjevalnik v `src/router.js`; večina strani je HTML v `public/views/` z logiko v `src/pages/`, izbrane komponente so React. Načrt temelji na trenutni kodi, saj je zapis v `.planning/STATE.md` starejši.
- `src/config/platform.js` že uporablja ime **AutoHub**, a še stare modro/indigo in zelene barvne nastavitve. Isti projekt gradi tudi MojaNavtika.

## 1. Referenčna knjižnica in sledljivost

Pred prenovo produkcijskih strani izdelamo ločen lokalni katalog vseh izvozov:

1. Izvorni ZIP-i ostanejo nespremenjeni. Vsak se razširi v svojo mapo z ID-jem, da se HTML in relativne poti med seboj ne prepišejo.
2. Katalog prikaže ID, naslov, izvorni ZIP, predogled, povezano produkcijsko pot, uporabljene komponente in seznam stanj.
3. Za vsak izvoz zajamemo celotno stran pri referenčni širini iz `$preview`; podatek o višini ni vedno enak dejanski višini dokumenta.
4. Posebej zajamemo hover, focus, odprte filtre, zavihke, modalna okna in prazna/napakasta stanja. Statično prikazano odprto okno v referenci postane stanje za preverjanje, ne privzeto stanje vseh obiskovalcev.
5. Za vsak ID vodimo status: popisan → vizualno prenesen → povezan s podatki → animacije preverjene → mobilno preverjen → dokončan.
6. Vsak odklon od reference zapišemo z razlogom in primerjavo, zlasti za mobilni prikaz in prikaze brez izvozov.

**Rezultat:** vseh 74 izvozov ima sledljivo uporabo, brez izgubljenih zaslonov ali prezrtih pojavnih oken.

## 2. Skupni dizajn in grafična sredstva

Iz izvozov izluščimo skupne vrednosti v lastne slogovne datoteke in komponente:

| Element | Preverjena referenca | Uporaba |
|---|---|---|
| Ozadje | `#e8f1fb`, svetlo modri radialni prelivi | Skupna podlaga javnih zaslonov |
| Primarno besedilo | `#0c1b30`; temne površine tudi `#0b1f3f` | Besedilo, kontrastni sklopi, B2B |
| Modra | `#2563eb`, aktivna/hover tudi `#1d4ed8` | Navigacija, izbrana stanja, sekundarna dejanja |
| Oranžna | `#f97316`, CTA preliv od `#fb923c` | Glavni pozivi in izbrani poudarki; pomen po posamezni referenci |
| Pisave | Inter 400/500/600/700; Manrope 500/600/700/800 | Inter za vsebino, Manrope za naslove in poudarke |
| Kartice | Pogosto radius 24 px, bele površine in večplastne sence | Kartice vozil, paneli, nadzorne plošče |
| Steklena navigacija | Bela pri 86 % opacity, blur 18 px | Javna glava; B2B ima svojo stransko navigacijo |
| Kontrole | Pill radius, tipično višine 44/54/56 px | Gumbi, filtri, vnosna polja po dejanski predlogi |
| Širina javne vsebine | Pogosto max-width 1280 px, odmik `clamp(16px,3vw,40px)` | Skupna mreža; posebni zasloni ohranijo svoje vrednosti |

Vrednosti niso univerzalna zamenjava vseh mer: posebnosti posameznih izvozov ostanejo. Uskladimo logo v glavi, mobilni glavi, prijavi, B2B, nogi in ustreznih ikonah strani. Izvoz 08 je vir sistema ikon za avtohiše in dejavnosti, ne samostojna javna stran.

Za 48 različnih assets pripravimo manifest: izvorno ime/hash → razumljivo ime → uporaba → alt/opis. Fotografske reference uporabljamo za primerjavo dizajna in primerjalne podatke; v živih oglasih uporabimo dejanske fotografije vozil. Slike ohranijo razmerja, izreze in pozicioniranje iz predlog. Pisavi v izvozih prihajata prek Google Fonts; zagotovimo enake družine in teže ter preverimo nalaganje pred zajemom primerjav.

Predlagana organizacija: `src/components/autohub/`, `css/autohub/`, `public/brand/autohub/` in ločena knjižnica referenc zunaj produkcijskega paketa. Nova osnovna pravila omejimo na platformo `avto`, da skupni CSS ne spremeni MojaNavtika.

## 3. Arhitektura prenosa

Prenos izvajamo po uporabniških tokovih, brez hkratnega prepisovanja celotnega usmerjevalnika in poslovne logike.

- Ohranimo obstoječe storitve za oglase, garažo, dražbe, rezervacije in poslovne račune. Novo predstavitev povežemo z njimi prek jasno določenih podatkov in dejanj.
- Skupne interaktivne elemente izvedemo kot ponovno uporabne komponente. Obstoječi React omogoča tudi večje samostojne zaslone; pri vsaki zamenjavi določimo enega lastnika DOM-a, da stara JS logika in React ne upravljata istega območja.
- Ne prenesemo `support.js`, `DCLogic` ali izvoznih kopij Reacta v produkcijo. Natančne vrednosti iz HTML prenesemo v običajne komponente in CSS.
- Pred zamenjavo strani popišemo dogodke, DOM ID-je, validacije, query parametre, privzete vrednosti in povezave. Novo stran povežemo z obstoječimi inicializacijami ali staro inicializacijo nadomestimo v celoti.
- Pri prehodih med stranmi in zapiranju komponent odstranimo poslušalce, timerje, observerje, podatkovne naročnine in React roots. Obstoječa `beforeRouteChange` in `reactRootTracker` sta izhodišče.
- Obstoječi URL-ji in parametri oglasov ostanejo veljavni. Nove poti za mape, onboarding ali imenik določimo šele po preslikavi; obstoječi `/oglasi` že predstavlja oglasno desko.

**Pred širšo prenovo:** pilot 01 Domov + 03 Iskanje mreža + 04 Oglas. Na teh preverimo glavo, tipografijo, kartice, filtre, podatkovno integracijo in pravila animacij. Pilot mora doseči vizualne kriterije, preden isti sistem razširimo na druge strani.

## 4. Celotna preslikava izvozov

| Izvozi | Namen in uporaba | Obstoječa izvedba / potrebno delo |
|---|---|---|
| **01** Domov | Hero, iskanje, kategorije, priporočeni oglasi, dodatne funkcije, noga | `/`, `home.js`, `home.html`, skupna glava/noga |
| **02–03** Iskanje seznam/mreža | Dva načina istega iskanja; skupni filtri, sortiranje, kartice | `/oglasi`, `oglasi.js`; ohraniti stanje filtrov ob menjavi prikaza |
| **04** Oglas | Galerija, podatki, cena, oprema, stroški, prodajalec | `/oglas`, `listing.js`; ohraniti TCO in druge obstoječe sekcije |
| **05** Moje mape | Organiziranje, shranjevanje in morebitno deljenje oglasov | `profile.js`, `garageService.js` kot izhodišče; preveriti model map in deljenje, določiti novo pot/podpogled |
| **06** Oglasna deska | Poseben način pregledovanja/izbire oglasov po predlogi | Primerjati z obstoječim `/oglasi`; določiti razliko do 02–03 in povezavo do map/primerjave |
| **07–08** Avtohiše + ikone | Imenik podjetij; knjižnica ikon dejavnosti | `businessService.js`, zemljevid, javni profil; samostojne poti imenika v trenutnem routerju ni |
| **09–10** Napredno iskanje avto/moto | Kategorijski filtri in drugačne tehnične izbire | `/iskanje`, `advanced-search.js`, podatki kategorij; ena funkcija z ustreznimi različicami |
| **11** Gume in deli | Iskalnik pnevmatik, delov in opreme | `/gume-in-deli`, `gume-in-deli.js`, katalog |
| **12–21** Dodaj oglas, koraki 1–10 | Kategorija → osnovni podatki → tehnika → oprema → fotografije → opis → cena → kontakt → vidnost → pregled | `/novi-oglas`, `create-listing.js`; en tok, trajno stanje korakov, validacije, urejanje obstoječega oglasa |
| **22–23** Oglas objavljen + dražba | Potrditev objave; različica za dražbeni oglas | Isti tok objave; obstoječe listing/auction storitve |
| **24–28** Dashboard prodajalca | Pregled, oglasi, modali, statistika, sporočila | `/dashboard`, `dashboard.js`; preveriti podporo za analitiko in sporočila, ne prikazovati izmišljenih statistik |
| **29–31** B2B | Pregled avtohiše, zaloga, CRM | `/b2b`, `/b2b/zaloga`, `/b2b/leads`; `b2b-layout.js`, ustrezne strani in storitve |
| **32–34** Dražbe | Deska, aktivni oglas, različna stanja in modali | `/drazbe`, `/drazba`, `drazbe.js`, `auction-listing.js`; ponudbe, čas in status vezani na dejansko stanje |
| **35–41** Zasebni onboarding | Registracija, potrditev e-pošte, namen, vozila/preference, obvestila, vodič, stanja | `/registracija`, `register.js`; razširiti obstoječi tok in preveriti shranjevanje preferenc, iskanj in obvestil |
| **42–49** B2B onboarding | Račun, podjetje, dejavnost, preverjanje, prvi koraki, profil, cenik/zaloga, robni primeri | `/registracija`, `/b2b/zacetek`, `b2b-profile-editor.js`; uskladiti že obstoječi vodeni onboarding |
| **50–52** Prijava | Prijava, obnovitev gesla in stanja | `/prijava`, `login.js`; povezava `/forgot-password` obstaja v login HTML, pot v routerju ni definirana — vključiti popravek toka |
| **53–58** Moj profil | Oglasi, priljubljeni, nedavno ogledani, urejanje, garaža, stanja | `/profil`, `/garaža`, `profile.js`; skupen okvir in ustrezni podpogledi |
| **59–60** Primerjava in stanja | Primerjalna tabela, izbor, tehnični podatki, stroški in robna stanja | `/primerjava`, `compare.js`; uskladiti povezave do oglasov in obstoječi izračun stroškov |
| **61–62** Oceni vrednost | Obrazec, izračun in rezultat | `/oceni-vrednost`, `evaluate.js`; ločiti prikaz od vira dejanske ocene |
| **63–64** Zemljevid | Zemljevid/seznam, filtri, izbira podjetja in stanja | `/zemljevid`, `map.js`; funkcionalni zemljevid z videzom reference, ne statična ilustracija |
| **65–66** Javni profil avtohiše | Podatki podjetja, zaloga, storitve, zavihki in stanja | `/poslovni-profil`, `business-profile.js`; povezave do booking in zaloge |
| **67–72** Rezervacija | Vozilo → storitve → izdelki → termin → pregled/potrditev → uspeh/stanja | `/booking`, `booking.js`; ohraniti razvejitev obstoječih korakov, termine, izračun, potrdila in koledarske povezave |
| **73–74** Katalog guma/del | Dva tipa podrobnosti izdelka | `/katalog`, `catalog-product.js`; različica po tipu izdelka, dobavljivost, ponudnik in nadaljevanje v rezervacijo |

Vsak ID v razponih se preveri posebej. Izvozi z naslovom »stanja« ali »pojavna okna« lahko vsebujejo več referenc v eni strani; razčlenimo jih na posamezne scenarije.

## 5. Animacije — obvezna specifikacija in preverjanje

### Gibanje, ki je dejansko ohranjeno v izvozih

| Referenca | Natančno pravilo prenosa |
|---|---|
| Navigacijske povezave, 53 izvozov | Prehod `background`, `color`, `box-shadow`: **250 ms** |
| Gumb »Objavi oglas«, 53 izvozov | Iz začetne širine 40 px se pri hover/focus razširi do max-width 190 px; padding in gap se spremenita v **350 ms**, `cubic-bezier(.4,0,.2,1)`; dvig za 1 px in senca v **300 ms ease** |
| Besedilo istega gumba | Opacity **200 ms ease**, zamik **50 ms**; max-width **350 ms** z isto krivuljo |
| Kartica mreže, 03 | Transform in senca **250 ms**; hover oziroma prikazano `.hov` stanje dvigne kartico za **3 px** |
| Kartice v 11 | Transform in senca **200 ms**; končno stanje prenesemo iz pripadajočega selektorja |

Te vrednosti ohranimo. Pri navigaciji, kjer izvoz pokaže stanje brez animacije, ne trdimo, da je čas prehoda znan. Hover učinke zagotovimo tudi pri tipkovnici; na dotiku dejanje deluje brez zahteve po hoverju.

### Gibanje, ki ga izvozi ne določajo

Pred produkcijsko izvedbo pripravimo `MOTION-SPEC.md` in majhen pregled delujočih komponent. Spodnje vrednosti so **predlogi**, ne izmerjene animacije Claude Design. Če je izvorni živ prototip dosegljiv, najprej primerjamo z njim; sicer nove prehode dokumentiramo kot dopolnitev.

| Interakcija | Predlog | Kaj mora preverjanje zajeti |
|---|---|---|
| Dropdown/popover | Opacity + premik 4–8 px, 150–200 ms | Odpiranje/zapiranje, zunanjost, Escape, fokus, položaj ob robu |
| Modal in mobilni drawer | Fade ozadja + kratek premik panela, 180–240 ms | Vstop in izstop, scroll lock, fokus, vrnitev fokusa |
| Koraki objave/onboardinga/rezervacije | Kratek prehod smeri naprej/nazaj, 200–250 ms | Ohranjena polja, fokus na naslov/napako, brez utripanja |
| Segmenti in zavihki | Indikator 180–220 ms, kratka menjava vsebine | Brez skakanja višine, aktivno stanje, tipkovnica |
| Shrani/priljubljeni/mape | Kratek odziv ikone 120–180 ms | Čakanje, uspeh, napaka in povrnitev stanja |
| Toast/obvestilo | Fade + manjši premik 160–200 ms | Trajanje, zapiranje, čakalna vrsta, obvestilo bralniku |
| Galerija vozila | Diskreten prehod 200–250 ms | Swipe, puščice, fullscreen, števec, nalaganje slik |
| Statistika/rezultat ocene | Enkraten vhod grafa 250–400 ms, če potrjen | Dejanske vrednosti takoj dostopne; brez ponavljanja ob vsaki osvežitvi |
| Dražbena ponudba/sprememba statusa | Kratek poudarek spremenjene vrednosti 150–250 ms | Čas in potrditev ponudbe se ne odložita zaradi animacije |
| Zemljevid in kartica podjetja | Usklajen premik/izbor, brez stalnega preletavanja | Stabilen fokus, reduced-motion, ohranjena lokacija |

Za vsako animacijo zapišemo: komponenta in ID reference, sprožilec, začetno/končno stanje, lastnosti, čas, zamik, easing, izhod, prekinitve, mobilni odziv in `prefers-reduced-motion` različica. Uporabimo CSS in obstoječi React; dodatna knjižnica za animacije je potrebna šele, če konkreten potrjen učinek tega zahteva.

Pravila kakovosti:

- Animacije se lahko prekinejo ali obrnejo ob hitrih klikih; ne kopičijo timerjev in ne blokirajo dejanj.
- Prednost imata transform in opacity. Referenčno širjenje gumba ohrani geometrijo predloge, vendar preverimo njegov vpliv na sosednje elemente in gladkost.
- Blur ostane predvsem statičen; ne animiramo velikih steklenih površin brez meritve odzivnosti.
- Reduced-motion izključi nepotrebne premike in ponavljanje, ohrani pa jasen odziv stanja. Obstoječe časovne animacije platforme preverimo ob prenovi.
- Posnetek zaslona dokazuje končno stanje; **video in preverjanje dejanske interakcije** dokazujeta animacijo. Preverimo vstop, izstop, polovico prehoda in ponovljene sprožitve.

## 6. Izvedbene faze in odvisnosti

| Faza | Delo | Pogoj za zaključek |
|---|---|---|
| **A — reference in razlike** | Katalog 74 izvozov, razčlenitev stanj, asset manifest, preslikava poti, seznam podatkovnih vrzeli, stanja primerjave št. 60 | Vsak izvoz in stanje ima namen; vse nejasnosti imajo zapisano rešitev ali odprto odločitev |
| **B — osnova in pilot** | Logo, pisave, tokeni, javna glava/noga, osnovne kontrole, kartice; pilot 01/03/04; motion specifikacija | Primerjave pilota na desktopu in telefonu ter preverjene referenčne animacije |
| **C — iskanje in kupec** | 02, 05–11, 53–60, 61–64, 73–74; povezave med iskanjem, mapami, primerjavo, garažo in katalogom | Celoten tok iskanje → oglas → shrani/primerjaj/kontakt; funkcionalne podatkovne vrzeli rešene |
| **D — računi in onboarding** | 35–52; prijava, obnovitev, zasebni in B2B onboarding, preference, stanja | Novi in obstoječi račun pravilno nadaljujeta; vnos se ohrani, napake imajo reference |
| **E — prodajalec** | 12–28; objava/urejanje, fotografije, dražbena različica, dashboard, statistika, sporočila | Objavljen oglas vsebuje pravilne podatke; vsi koraki, modali in napake preverjeni |
| **F — podjetja in rezervacije** | 29–31, 65–72; B2B okvir, zaloga, CRM, profil podjetja, rezervacije | Tok podjetje → izbira storitve/izdelka → termin → potrditev; ustrezni zasebni/B2B pogledi |
| **G — dražbe** | 32–34; integracija z 23; vizualna in časovna stanja | Dejanske ponudbe, prehodi statusov, izguba povezave in konec dražbe pravilno prikazani |
| **H — celotna znamka in izdaja** | Preostali obstoječi zasloni, metapodatki, ikone, prevodi, obvestila, pregled regresij in postopna aktivacija | Vsa merila spodaj izpolnjena; zabeleženo, katera funkcionalnost potrebuje nadaljnji razvoj |

B sledi A. C–G temeljijo na B; D je pred dokončno preverbo zaščitenih tokov E/F/G. Vrstni red znotraj C–G lahko prilagodimo odvisnostim, vendar javne strani same niso zaključek celotnega rebrandinga.

Delavnica, hotel gum, B2B rezervacije/storitve, skupinski uvoz, servisni vnos, nastavitve TCO, admin in informativne/pravno-vsebinske strani nimajo svojih polnih izvozov v tej mapi. Ohranimo njihovo funkcionalnost in jih vizualno uskladimo s skupnimi komponentami ter povezavami iz referenc. Izrecno označimo, da pri njih ne obstaja popolna neposredna referenca.

## 7. Vizualni, mobilni in funkcionalni kriteriji

**Za vsak zaslon in stanje:** referenca in izvedba se zajameta v istem brskalniku, pri isti širini, naloženih pisavah in primerljivih podatkih. Pregledamo prekrivanje posnetkov in razliko slik: geometrijo, tipografijo, sence, ikone, barve, izreze slik ter vsebino pod pregibom. Dinamične čase in podatke stabiliziramo za primerjavo. Nobena različica se ne zaključi z razlago »približno je podobno«; vidne razlike so odpravljene ali konkretno dokumentirane.

**Mobilno:** najmanj 390, 768, 1024 in 1440 px; dodatno 360 px za ožji telefon. Ne dovolimo nenamernega horizontalnega drsenja ali prekrivanja naslovov. Hero kartica, filtri, B2B sidebar, primerjalna tabela, galerija in modali dobijo namerno mobilno razporeditev. Pri tabelah je lahko drsenje znotraj komponente namerno. Izvoženo pravilo pri 1023 px je izhodišče za navigacijo, ne dokaz, da je cela stran odzivna.

**Stanja:** loading, empty, error, success, invalid, disabled, brez prijave, brez dovoljenj in prekinjena povezava preverimo, kjer so relevantna. Prikazana preverjenost podjetja, ocena cene, statistika, zaloga in dražbeni status morajo ustrezati podatkom.

**Funkcionalno:** ohranimo URL-je, nazaj/naprej, parametre filtrov, urejanje in osnutke oglasa, fotografije, TCO, garažo, prijavo, pravice, ponudbe in rezervacije. Posebej rešimo nove zahteve, kot so mape/deljenje, shranjena iskanja, obvestila in podrobna sporočila, če obstoječa podatkovna podpora ni zadostna. Takšno delo ima svoj implementacijski obseg in ni samo sprememba barv.

**Preverjanje:** ob implementaciji uporabimo obstoječi Playwright za pomembne tokove in slikovne reference; CSS prehode preverimo tudi z videom in computed styles. Ob zaključku relevantnih sprememb zaženemo lint, avtomobilski build in potrebne e2e teste. Pred izdajo preverimo tudi navtični build in osnovne tokove, ker je koda skupna. Za trenutni dokumentacijski načrt produkcijski build ni potreben.

## 8. Znamka, izdaja in odprte odločitve

Vizualni rebrand ni samodejna selitev domene. Trenutna konfiguracija uporablja `AutoHub.si` kot prikaz imena, domena in e-pošta pa ostajata `mojavto.si`. Pred izdajo določimo dejansko domeno in kontaktne naslove; šele ob odločitvi vključimo redirecte, auth povratne URL-je, canonical/meta povezave, obvestila in druge zunanje reference. Obstoječa pravna in poslovna dejstva se ne spreminjajo zgolj zaradi logotipa.

Prenovo omogočimo postopoma v preview okolju in po potrjenih sklopih. Izberemo mehanizem za vrnitev na prejšnji prikaz, ki ne spreminja že shranjenih uporabniških podatkov. V produkcijski paket ne vključimo vseh podvojenih export runtime datotek.

Odprte odločitve, ki ne preprečujejo začetka A/B:

1. Izvoz 60 je dodan in vključen v primerjavo vozil; ta odločitev je rešena.
2. Ali obstaja živ Claude Design predogled z dodatnimi animacijami? ZIP-i sami jih ne vsebujejo dovolj za dokaz popolne gibalne zvestobe.
3. Ali bo spletni naslov dejansko AutoHub.si ali ostane mojavto.si z znamko AutoHub?
4. Temni način: reference vsebujejo gumb za temo, vendar popoln temni sistem iz trenutnega popisa ni potrjen. Določimo in preverimo različico, preden jo razglasimo za zvest prenos.
5. Za funkcije brez dovolj obstoječe podpore po A določimo ločena opravila in realne odvisnosti; rok ocenimo šele nato.

## Prvi konkreten implementacijski sklop

Katalog referenc + asset manifest + skupni vizualni tokeni + glava/noga + pilot Domov / Iskanje mreža / Oglas. Dostava vključuje primerjave pri 1440 in 390 px, video razširitve gumba »Objavi oglas«, odziv kartice ter seznam razlik. Šele na tej osnovi širimo potrjeno zasnovo na preostale izvoze.

## Izvedeno nadaljevanje in naslednji sklop

Prenesene so funkcionalne osnove 01–27, 35–64 in 73–74; referenca 28 ima nov okvir in jasno stanje nedostopne storitve sporočil. Podrobnosti preverjanja ter konkretne vizualne/podatkovne vrzeli so v `IMPLEMENTATION-STATUS.md`. Ta oznaka ne pomeni popolne enakosti vseh stanj ZIP izvozov. Izvirniki ostanejo nespremenjeni, izvedba uporablja skupne komponente, native dialoge in originalna sredstva namesto izvoznega runtime.

Naslednji sklop je 29–31 in 65–72: podjetja, javni poslovni profil, zaloga in rezervacije. Nato sledijo 32–34 za dražbe. Čarovnik objave uporablja deset korakov vozila, lokalne osnutke/fotografije in popravljene API zapise. Dashboard uporablja dejanske lastniške oglase, zabeleženo statistiko in rezervacije. Nadaljnja strežniška opravila ostajajo sporočila/povpraševanja, plačljiva promocija/checkout, celotna analitika, pošiljanje cenovnih alarmov, push/SMS, poslovni register, preverjanje podjetij/dokazila, vabila sodelavcem, upravljanje naprav in vključitev novih MFA faktorjev. Živa konfiguracija Auth/RLS, upload in nove API poti še potrebujejo preverjanje ter usklajeno izdajo frontenda/API-ja.
