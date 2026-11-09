# AutoHub — specifikacija začetnega sklopa animacij

13. 10. 2026. CSS izvedba: `css/autohub.css`.

## Prenesena referenčna pravila

| Komponenta | Sprožilec in stanja | Čas / easing | Izhod / prekinitev |
|---|---|---|---|
| Navigacijska povezava | Hover, fokus, aktivna pot; sprememba barve/podlage/sence | 250 ms | CSS obrne prehod ob umiku; aktivno stanje sledi poti |
| Objavi oglas | Hover/focus-visible: 40 px začetna širina → širina besedila, max 190 px; padding 0 → 12/18 px; gap 0 → 8 px | 350 ms `cubic-bezier(.4,0,.2,1)` | CSS prehod se obrne pri hitrem umiku; brez timerjev |
| Besedilo gumba | Opacity 0 → 1, max-width 0 → 150 px | Opacity 200 ms ease z zamikom 50 ms; širina 350 ms z isto krivuljo | Povrnitev ob umiku; polno dostopno ime je na povezavi vedno |
| Dvig/senca gumba | Transform 0 → translateY(-1px); močnejša senca | 300 ms ease | Povrnitev ob umiku |
| Kartica oglasa | Hover/focus-within: translateY(-3px), močnejša senca | 250 ms | Povrnitev ob umiku ali prehodu fokusa |

Referenčna širina 190 px je max-width. Slovensko besedilo v dejanskem prikazu trenutno potrebuje približno 140 px skupne širine.

## Dopolnitve, ki jih izvozi ne določajo

| Komponenta | Pravilo | Opomba |
|---|---|---|
| Uporabniški, jezikovni in kategorijski meni | Vstop: opacity 0 → 1 in odmik 6 px, 180 ms ease | Nova dopolnitev; izvoz prikazuje statično odprto stanje. Escape zapre meni in vrne fokus. Izhod je trenutno neposreden. |
| Mobilni meni | Enak diskreten vstop 180 ms | Toggle in zapiranje ob navigaciji. |
| Segmenti / zavihki | Barva, podlaga in senca 180 ms | Nova dopolnitev; aktivno stanje z `aria-pressed`, brez čakanja na vsebino. |
| CTA / dodatne funkcije / vrste vozil | Senca in barvni odziv 200 ms; kartica dodatne funkcije dvig 3 px | Nova dopolnitev; ne avtomatska animacija ob drsenju. |
| Obstoječi accordion filtrov | Ohranjen prehod max-height/opacity 280 ms | Obstoječe vedenje platforme; ni neposredno izvoženo pravilo Claude Design. |
| Obstoječi modal oglasa | Vstop opacity + premik 12 px / scale .98, 220 ms | Dopolnitev sloga; vsebina in obstoječa dejanja ostanejo. |

## Telefon in reduced-motion

- Pri širini do 767 px gumb za objavo ostane kompakten 40 px. Deluje z enim dotikom in ima dostopno ime.
- Reduced-motion odstrani prehode osnovne navigacije/kartic/segmentov, premike ob hover/fokusu, animacije menijev in modalov ter animacijo accordionov v prenovljenem prikazu.
- Gumb še vedno razkrije besedilo pri tipkovnici na desktopu; sprememba je takojšnja.
- Galerija ob reduced-motion ne zahteva gladkega pomikanja. Podrobna obravnava starih galerijskih handlerjev in vseh preostalih strani je del nadaljnjih sklopov.

## Dokazi preverjanja

- E2E: gumb se razširi pri hover, skrči ob umiku, razširi pri focus-visible in ob Enter pravilno odpre objavo oglasa.
- E2E: reduced-motion ima transition-duration 0s in transform none, dostopno ime ostane na voljo.
- E2E: Escape zapre uporabniški meni in vrne fokus sprožilcu.
- Video: `scratch/autohub-qa/publish-animation.webm`; izmerjen potek 40 → 134,36 → 140 → 40 px.

Naslednji korak: določiti in primerjati izhodne prehode menijev, stanja vseh modalov ter prehode med koraki objave/onboardinga/rezervacije, preden se posamezni sklop označi kot povsem vizualno in gibalno usklajen.

## Sklopa 05–08 in 09–10

- Kartice map, desk in podjetij uporabljajo 250 ms odziv s premikom −3 px in spremembo sence. Čas temelji na skupnem odzivu kartic; to je dopolnitev statičnih stanj teh izvozov.
- Pogovorna okna: pojav 200 ms (opacity, translateY 10 px, scale .98), izhod 160 ms; backdrop z zameglitvijo. To sta eksplicitni dopolnitvi, ker izvorni izvozi vsebujejo odprto stanje brez izvedene logike prehoda.
- Accordion naprednega iskanja: pojav vsebine 200 ms, zasuk puščice in barva kontrol. Izbire so uporabne s tipkovnico; checkboxi ostanejo fokusabilni. Pri reduced-motion ni animacije vsebine, premikov ali časovnih prehodov kontrol.
- Vlečenje oglasa: zatemnitev kartice in označen ciljni stolpec; dejanska sprememba po uspešnem shranjevanju. Izbirnik stolpca je alternativa vlečenju.
- Zemljevid ne uporablja animiranega pan ob reduced-motion. Telefon ohrani funkcije brez hoverja.
- Posnetek `scratch/autohub-qa/advanced-search-motion.webm`: izbrana vrsta avtomobila, zapis obsega, Zapomni, zapiranje/odpiranje razdelka, električni pogon, prehod na motorje in izbor Adventure. V kontroliranem Chromium predogledu ni bilo napak JavaScript.

## Sklop 11, 73–74: gume, deli in katalog

- Kartice izdelkov: izvorni odziv 250 ms, dvig −3 px in močnejša senca pri hover/focus-within. CSS obrne prehod ob umiku brez časovnih skript.
- Preklopi mreža/seznam, sezona, kategorija in galerija neposredno pokažejo izbrano vsebino. Izvozi ne določajo prehoda med fotografijami; ta izvedba ne dodaja avtomatskega vrtenja ali animacije izmišljenih podatkov.
- Preklopniki lastnosti: barva in drsenje kroga 250 ms. Primerjava, izbira vozila, registrska številka, delitev in vprašanje prodajalcu uporabljajo skupni native dialog (vstop 200 ms, izhod 160 ms, Escape in vrnitev fokusa).
- Gumb za ponudnike gladko pomakne do ponudb; pri reduced-motion je pomik neposreden. Kartice, preklopniki in dialogi imajo pri tej nastavitvi izključene premike in prehode.
- Mobilni filtri ostanejo odprti po spremembi polja; delujejo brez hoverja. Cenovna drsnika podpirata tipkovnico in usklajujeta spodnjo/zgornjo mejo.
- Animacije so preverljive v `tests/e2e/autohub-catalog.spec.js`: computed transform kartice pri hover/umiku, reduced-motion 0s ter Escape/fokus dialoga. Video se shrani v `scratch/autohub-qa/catalog-motion/`.

## Sklop 53–64: profil, garaža, primerjava, vrednotenje in zemljevid

- Profil uporablja skupni odziv kartice: 250 ms, dvig −3 px in senca; barva zavihka ima 250 ms prehod. Reference ponovno določajo 250/350 ms za skupno navigacijo in gumb za objavo; dodatnih izvornih keyframes ti izvozi nimajo.
- Zamenjava zavihka profila, izbira vozila v garaži, prikaz razlik in sprememba vrstic primerjave neposredno pokažejo ustrezne podatke. Nobena animacija ne zadržuje shranjevanja ali prikrije zavrnjenega zapisa.
- Dialogi iz referenc 58, 60 in 64 uporabljajo skupni vstop 200 ms / izhod 160 ms. To sta dopolnitvi statičnih referenc. Escape zapre okno in vrne fokus; pri neshranjenem vnosu pomeni, da ostanemo na strani. Zaščita deluje tudi pri brskalnikovem Nazaj in programski navigaciji.
- Vrstice primerjave je mogoče urediti z vlečenjem ter premakniti s puščicama. Fokus ostane na premaknjenem gumbu. Mobilna tabela se namensko pomika znotraj svoje komponente, ne čez širino strani.
- Zemljevid z izborom podjetja pomakne prikaz; pri reduced-motion je premik neposreden. Povezana kartica in podrobnosti so uporabne z dotikom. Sprememba filtra ali zavrnitev lokacije ohrani dostopen seznam.
- Test preveri computed transform kartice v obe smeri ter Escape/fokus v primerjavi. Video se shrani v `scratch/autohub-qa/vehicle-motion/`; mobilni scenariji uporabljajo reduced-motion.

## Sklop 35–52: računi in uvodni koraki

- Izvozi prikazujejo statična stanja prijave, registracije in uvoda; ne vsebujejo dokaza za popolno gibalno enakost vseh korakov. Native dopolnitev uporablja vstop prijavnega panela 280 ms ter uvodne kartice 220 ms: opacity 0→1 in translateY 10→0 px.
- Izbira vrste računa, dejavnosti, vozila in goriva ima prehod barve/obrobe 160 ms. Kartica namena se dvigne za 2 px; Google gumb za 1 px. Preklopnik preference ima 160 ms pomik kroga, kazalnik moči gesla 180 ms prehod barve.
- Menjava vrste računa ohrani kontaktna polja, geslo in soglasja v pomnilniku strani. Koraki shranijo stanje pred prikazom uspeha; sporočilo zavrnjenega zapisa ne izgine z animacijo. Ponovni poskus cenika preskoči že shranjene storitve.
- Reduced-motion izključi prehode in animacije tega sklopa. Na telefonu izbire delujejo z dotikom. Test preveri vstop 0.28s oziroma animation:none, ohranitev izbire ob koraku Nazaj in odsotnost prelivanja pri 390 px.
- Video `scratch/autohub-qa/account-motion.webm` zajame mobilni uvod in prehode. Statični QA posnetki počakajo na zaključek animacije; vmesnih frameov ne primerjamo kot končnega videza.

## Sklop 12–28: čarovnik objave in dashboard

- Deset korakov vozila uporablja skupno zasnovo referenc 12–21. Native dopolnitev statičnih izvozov je 220 ms vstop kartice (opacity 0→1, translateY 8→0 px); napredek spreminja barvo v 200 ms. Izbrana kategorija in način objave se pokažeta takoj.
- Gumbi imajo 160 ms prehod barve/sence in dvig za 1 px. Dashboard kartica ima 250 ms prehod, dvig za 2 px in močnejšo senco. Izvorni skupni header ohrani prej preverjene animacije.
- Fotografije se urejajo z vlečenjem ali puščicama. Naslovna fotografija sledi svojemu elementu pri premikanju; brisanje posodobi izbiro. Ne prikazujemo izmišljenih odstotkov upload napredka. Spinner med dejansko objavo traja do odgovora storitve.
- Dashboard dialogi za ceno, prodano/brisanje, QR list, delitev in preklic rezervacije uporabljajo skupni native dialog (vstop 200 ms / izhod 160 ms). Zavrnitev zapisa ohrani obrazec in pokaže napako. Neshranjeno urejanje obstoječega oglasa zahteva izrecno zavrženje; Escape ohrani vnos.
- Reduced-motion odstrani premike/prehode čarovnika in dashboarda. Pri 390 px fotografije uporabljajo dve koloni, navigacijski zavihki pa notranji horizontalni pomik. Statistična tabela se pomika znotraj svoje komponente.
- Test preveri 0.22s vstop, animation:none pri reduced-motion, modal/Escape ter geometrijo mobilnih prikazov. Video `scratch/autohub-qa/seller-motion.webm` zajame čarovnik, izbiro karoserije in dialog cene brez napak JavaScript.
