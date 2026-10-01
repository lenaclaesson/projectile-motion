# Interaktiv fysikillustration: Projektilrörelse

Det här projektet kommer att vara en interaktiv simulering av projektilrörelse i två dimensioner. Syftet är att hjälpa användaren att förstå hur startvinkel, startfart och höjd påverkar banan, flygtid, maximal höjd och räckvidd.

## Syfte

- visa hur en projektil rör sig under gravitationen
- göra fysik tydlig och lätt att experimentera med
- ge användaren direkt feedback genom animation och värden

## Funktioner som planeras

- justerbar startvinkel
- justerbar startfart
- justerbar utgångshöjd
- visning av banan i realtid
- markering av hoppets högsta punkt och landningspunkt
- beräkning av:
  - flygtid
  - maximal höjd
  - räckvidd
  - hastighet i olika punkter
- enkel och pedagogisk användargränssnitt

## Exempel på användning

Användaren kan:

1. ändra projektilens startvinkel
2. ändra hastigheten
3. justera startpositionen eller höjden
4. starta simuleringen
5. observera hur banan ändras direkt

Detta gör att elever och studenter kan testa hypoteser som:

- Hur påverkar en större vinkel räckvidden?
- Vilken startvinkel ger längst räckvidd om hastigheten hålls konstant?
- Hur förändras flygtiden om projektilen startar från högre höjd?

## Teknik

Projektet kan byggas med:

- HTML för struktur
- CSS för styling och layout
- JavaScript för simulering och interaktivitet
- Canvas eller SVG för att rita banan

Det går även att utöka med p5.js eller ett grafiskt bibliotek om man vill ha en mer avancerad visualisering.

## Så här kör du projektet

När projektet är färdigt kan du öppna applikationen i webbläsaren. Om du använder en lokal webserver rekommenderas något liknande:

```bash
python -m http.server 8000
```

Sedan öppnar du:

```text
http://localhost:8000
```

## Planerad struktur

```text
projectile-motion/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

## Mål

Det här projektet är tänkt att fungera som en pedagogisk visualisering där fysik blir mer konkret genom interaktion. Fokus ligger på att göra viktiga begrepp i kinematiken lättare att förstå genom experiment.

## Framtida förbättringar

- förbättrad animering med smidigare fysikberäkningar
- visning av vektorer för hastighet och acceleration
- möjlighet att jämföra flera skott samtidigt
- stöd för olika gravitationskonstanter eller planeter

---

Den här README-filen fungerar som en första skiss för projektet och kan utökas när själva simuleringen blir klar.
