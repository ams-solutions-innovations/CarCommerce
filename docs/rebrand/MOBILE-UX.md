# AutoHub: mobilna izkušnja

Datum: 14. oktober 2026.

Skupni `css/autohub-mobile.css` se naloži za avto platformo po slogih posameznih strani. Ohranja rebranding in namizne postavitve; na telefonu razširi kontrole za dotik ter zmanjša gostoto vsebine.

## Izvedeno

- Glava se prilega tudi 320 px širokemu zaslonu. Objavo, račun in meni je mogoče doseči s 44 px kontrolami. Mobilni meni vključuje objavo, osebne strani oziroma prijavo/registracijo, jezik in temo. Dolg meni se pomika znotraj višine zaslona; Escape vrne fokus, prehod na namizno širino ga zapre.
- Hero ima ločen in v celoti berljiv izbrani oglas. Iskalnik ga ne prekriva. Na zelo ozkih telefonih so polja v enem stolpcu.
- Rezultati imajo eno berljivo kartico v vrstici. Profil in katalog na manjših telefonih uporabljata en stolpec. Kategorije naprednega iskanja so v mreži 2 × 2. Zavihki profila, nadzorne plošče in primerjalna tabela ohranijo lokalno vodoravno pomikanje.
- Polja, native izbirniki in custom select sprožilci imajo na telefonu 16 px pisavo, da preprečijo običajno samodejno povečavo v iOS. Osnovne kontrole imajo najmanj 44 px višine.
- Filtri in razvrščanje uporabljajo višino `dvh`, lokalno pomikanje, modalno semantiko, omejitev fokusa in `inert` za ozadje. Zapiranje, izbira, Escape, sprememba širine in odhod na drugo stran sprostijo ozadje in zaklep drsenja. Poslušalci ter zakasnjeno zapiranje se ob odhodu odstranijo.
- Detajl oglasa ostane temen. Do 900 px uporablja eno vsebinsko kolono, zato ima galerija dovolj prostora tudi na tablici. Horizontalna poteza zamenja fotografijo, pretežno navpična poteza pa omogoča drsenje. Dotik gumbov in večprstne poteze ne sprožijo dodatne menjave fotografije.
- Datum oglasa podpira normalizirane časovne podatke `toMillis`, stare `toDate`/`seconds` in datumske nize. Neveljavna vrednost pokaže pomišljaj.
- Dialogi se prilegajo kratkemu zaslonu in ohranijo native upravljanje fokusa. Varni robovi zaslona uporabljajo `viewport-fit=cover` in `safe-area-inset-*`. Reduced motion izključi premikanje mobilnih panelov.

## Preverjanje

- Oba produkcijska builda: `npm run build:all` uspešen.
- Novih 9 scenarijev v `tests/e2e/autohub-mobile.spec.js`: 15 strani pri 320/390/430 px, kratek zaslon 320 × 568, tipkovnica/fokus, dotik, vrtenje, odhod z odprtimi filtri, dialog in galerijske poteze; detajl tudi pri 768 × 1024.
- Širši pregled zajema račune, napredno iskanje, katalog, prodajni tok, profil/garažo/primerjavo in mape/deske/imenik. Skupaj je uspešno preverjenih 99 različnih scenarijev skozi širši pregled in ponovitve prizadetih sklopov. Zadnji sklop: **25/25 uspešnih** (mobile, rebrand, workspace).
- Stari test odstranitve priljubljenega je popravljen, da izbere dejanski srček kartice; skupna kartica vsebuje tudi ločeno kontrolo za seznam.
- ESLint za spremenjene JS datoteke nima napak. Ostaja 13 obstoječih opozoril o neuporabljenih spremenljivkah v kontrolerjih.
- Vizualni pregled in merjenje: `scratch/autohub-qa/mobile/`; ponovljiv pregled z `node scratch/autohub-qa/mobile-audit.mjs`. Merjenje poleg širine dokumenta preveri tudi dejanske meje elementov, ker globalni `overflow-x: clip` lahko skrije odrezane kontrole. Zemljevidi in namenoma pomični zavihki so izvzeti.

Preverjanje je lokalno v Chromium emulaciji telefona s testnimi podatki. Fizični iPhone/Android, zaslonska tipkovnica Safari in živi podatkovni tokovi niso bili preizkušeni. Ta sklop ne pomeni objave v produkcijo ali dokončanja podatkovnih odvisnosti, opisanih v `IMPLEMENTATION-STATUS.md`.
