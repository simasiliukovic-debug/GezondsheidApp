# VitaalApp 🍏

Een Progressive Web App (PWA) ontworpen voor het bijhouden en inzichtelijk maken van dagelijkse gezondheidsgegevens. Deze applicatie is gebouwd als project voor de module **Eenvoudige Mobiele App (PWA)** van de opleiding Software Development (Niveau 4) aan het Koning Willem I College.

## 🚀 Functionaliteiten

Deze app is gebouwd met de focus op gebruiksvriendelijkheid en voldoet aan de volgende kerneisen:

*   **Volledig Offline Beschikbaar (PWA):** Dankzij de ingebouwde Service Worker (`sw.js`) en het Web App Manifest (`manifest.json`) is de app te installeren op mobiel en desktop, en functioneert deze na de eerste laadactie volledig zonder internetverbinding.
*   **Databeheer (CRUD via LocalStorage):** Gebruikers kunnen hun gezondheidsgegevens (inclusief datum, categorie, omschrijving en specifieke waarde) invoeren, bekijken en resetten. Alles wordt lokaal, veilig en snel opgeslagen op het apparaat via `LocalStorage`.
*   **Meertalig (i18n):** De applicatie bevat een ingebouwde taalswitch en haalt dynamisch content op uit taalbestanden (`en.json` en `nl.json`).
*   **Mobile-First & Responsive:** Ontworpen vanuit een mobile-first perspectief met semantische HTML5 en modulaire CSS. De layout schaalt vloeiend mee naar tablet- en desktopformaten.
*   **Dynamische Datavisualisatie & Rekenwerk:** Gebruik van Vanilla JavaScript voor rekenkundige conversies, DOM-manipulatie en het aggregeren/visualiseren van de ingevoerde gezondheidsdata.

## 🛠️ Gebruikte Technologieën

*   **Front-end:** Semantische HTML5 en Vanilla CSS (opgedeeld in een heldere mappenstructuur).
*   **Logica:** Vanilla JavaScript (ES6+), inclusief het gebruik van `querySelector`, event listeners en herbruikbare functies.
*   **Opslag:** `Window.localStorage` voor persistente client-side data.
*   **Versiebeheer & Deployment:** Git en gehost via GitHub Pages.

## 🌐 Live Demo

De applicatie is live gedeployed en online te gebruiken via de volgende link:
**[Klik hier om de live PWA te openen](https://simasiliukovic-debug.github.io/GezondsheidApp/)**

*(Let op: de data blijft veilig op je eigen apparaat en wordt niet naar een externe server gestuurd).*

## 💻 Lokale Installatie

Wil je de broncode lokaal draaien of testen? Volg deze stappen:

1. Clone deze repository naar je lokale machine:
```bash
   git clone [https://github.com/simasiliukovic-debug/GezondsheidApp.git](https://github.com/simasiliukovic-debug/GezondsheidApp.git)
