# Calculateur Pajemploi - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal web calculator that replaces an Excel file for monthly Pajemploi declarations, with real-time calculation and local storage.

**Architecture:** Single-page HTML/CSS/JS app with hybrid layout (central attendance table + fixed side panel showing Pajemploi results). Data persisted in localStorage. Calculation engine separated into pure functions for testability.

**Tech Stack:** Vanilla HTML5, CSS3 (CSS Grid + Flexbox), JavaScript ES6+, localStorage API. No build tools, no frameworks.

**Design doc:** `docs/plans/2026-02-24-pajemploi-calculator-design.md`

---

### Task 1: Project scaffold and HTML structure

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

**Step 1: Create `index.html` with full layout skeleton**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calcul Pajemploi</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="header">
    <h1>Calcul Pajemploi</h1>
    <div class="header-controls">
      <label>Mois :
        <select id="select-month"></select>
      </label>
      <label>Année :
        <select id="select-year"></select>
      </label>
    </div>
  </header>

  <main class="main-layout">
    <section class="central-panel">
      <nav class="tabs">
        <button class="tab active" data-tab="contrat">Contrat</button>
        <button class="tab" data-tab="presence">Présence</button>
      </nav>
      <div id="tab-contrat" class="tab-content active">
        <!-- Filled in Task 4 -->
      </div>
      <div id="tab-presence" class="tab-content">
        <!-- Filled in Task 5 -->
      </div>
    </section>

    <aside class="side-panel">
      <h2>Déclaration Pajemploi</h2>
      <div id="pajemploi-results">
        <!-- Filled in Task 6 -->
      </div>
      <button id="btn-copy">Copier les valeurs</button>
      <details id="history-section">
        <summary>Historique des mois</summary>
        <ul id="history-list"></ul>
      </details>
    </aside>
  </main>

  <footer class="footer">
    <div id="footer-rates"></div>
  </footer>

  <script src="js/parametrage.js"></script>
  <script src="js/calculs.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Step 2: Create `css/style.css` with grid layout**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: #2563eb;
  --primary-light: #dbeafe;
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #1e293b;
  --text-light: #64748b;
  --border: #e2e8f0;
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
  --radius: 8px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 { font-size: 1.25rem; }

.header-controls { display: flex; gap: 1rem; }
.header-controls select {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  border: none;
}

.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  padding: 1rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.central-panel {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
}

.tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-light);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

.tab-content { display: none; padding: 1.5rem; }
.tab-content.active { display: block; }

.side-panel {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.side-panel h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--primary);
}

#btn-copy {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 1rem;
}

#btn-copy:hover { opacity: 0.9; }

.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 0.75rem 2rem;
  font-size: 0.85rem;
  color: var(--text-light);
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .side-panel {
    position: static;
    max-height: none;
  }
}
```

**Step 3: Create empty JS files**

Create these empty files with a comment header:
- `js/parametrage.js` — `// Table de paramètrage (taux, IE, SMIC par région et date)`
- `js/calculs.js` — `// Moteur de calcul Pajemploi`
- `js/storage.js` — `// Gestion localStorage`
- `js/app.js` — `// Application principale`

**Step 4: Create `.claude/launch.json` for dev server**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "pajemploi-dev",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["serve", "."],
      "port": 3000
    }
  ]
}
```

**Step 5: Verify in browser**

Open `index.html` in browser. Verify:
- Header with title and dropdowns visible
- Two-column grid layout (central + side panel)
- Tabs "Contrat" and "Présence" visible
- Side panel with "Déclaration Pajemploi" title
- Footer visible

**Step 6: Commit**

```bash
git init
git add index.html css/style.css js/parametrage.js js/calculs.js js/storage.js js/app.js .claude/launch.json
git commit -m "feat: project scaffold with HTML layout, CSS grid, and JS file structure"
```

---

### Task 2: Parametrage data module

**Files:**
- Create: `js/parametrage.js`

**Step 1: Write the parametrage data table**

This table is extracted directly from the Excel "Paramètrage" sheet. It contains social contribution rates, IE minimums, conversion rates, and SMIC values indexed by region and date range.

```javascript
// js/parametrage.js
// Table de paramètrage — taux de cotisations, IE minimums, SMIC par région et période
// Source : Excel Pajemploi, onglet "Paramètrage"

const PARAMETRAGE = [
  // region, dateDebut, dateFin, tauxConversion, ieMinJour, ieMinHeure, plafondCAF, smic, txHoraireBrutMin
  { region: "Autres", debut: "2026-01-01", fin: "3000-01-01", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.425, plafondCAF: 8, smic: 12.02, txBrutMin: 3.50 },
  { region: "Autres", debut: "2025-09-01", fin: "2025-12-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 8, smic: 11.88, txBrutMin: 3.50 },
  { region: "Autres", debut: "2025-05-01", fin: "2025-08-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },
  { region: "Autres", debut: "2025-01-01", fin: "2025-04-30", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },
  { region: "Autres", debut: "2024-11-01", fin: "2024-12-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },
  { region: "Autres", debut: "2024-05-01", fin: "2024-10-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415, plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.50 },
  { region: "Autres", debut: "2024-04-01", fin: "2024-04-30", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415, plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },
  { region: "Autres", debut: "2024-02-01", fin: "2024-03-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415, plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },
  { region: "Autres", debut: "2024-01-01", fin: "2024-01-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415, plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.43 },
  { region: "Autres", debut: "2023-09-01", fin: "2023-12-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.410, plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.43 },
  { region: "Autres", debut: "2023-05-01", fin: "2023-08-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.410, plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.36 },
  { region: "Autres", debut: "2023-01-01", fin: "2023-04-30", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.401, plafondCAF: 56.35, smic: 11.27, txBrutMin: 3.20 },
  { region: "Autres", debut: "2022-01-01", fin: "2022-12-31", tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.376, plafondCAF: 52.85, smic: 10.57, txBrutMin: 2.97 },
  { region: "Autres", debut: "2021-01-01", fin: "2021-12-31", tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3447, plafondCAF: 51.25, smic: 10.25, txBrutMin: 2.88 },
  { region: "Autres", debut: "2020-01-01", fin: "2020-12-31", tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3447, plafondCAF: 50.75, smic: 10.15, txBrutMin: 2.88 },
  { region: "Autres", debut: "2019-01-01", fin: "2019-12-31", tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3419, plafondCAF: 50.15, smic: 10.03, txBrutMin: 2.82 },
  // Alsace-Moselle
  { region: "Alsace-Moselle", debut: "2026-01-01", fin: "3000-01-01", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.425, plafondCAF: 8, smic: 12.02, txBrutMin: 3.50 },
  { region: "Alsace-Moselle", debut: "2025-09-01", fin: "2025-12-31", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 8, smic: 11.88, txBrutMin: 3.50 },
  { region: "Alsace-Moselle", debut: "2025-05-01", fin: "2025-08-31", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },
  { region: "Alsace-Moselle", debut: "2025-01-01", fin: "2025-04-30", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422, plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },
  { region: "Alsace-Moselle", debut: "2024-01-01", fin: "2024-12-31", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.415, plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.43 },
  { region: "Alsace-Moselle", debut: "2023-01-01", fin: "2023-12-31", tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.401, plafondCAF: 56.35, smic: 11.27, txBrutMin: 3.20 },
  { region: "Alsace-Moselle", debut: "2022-01-01", fin: "2022-12-31", tauxConversion: 0.7654, ieMinJour: 2.65, ieMinHeure: 0.376, plafondCAF: 52.85, smic: 10.57, txBrutMin: 2.97 },
  { region: "Alsace-Moselle", debut: "2019-01-01", fin: "2021-12-31", tauxConversion: 0.7651, ieMinJour: 2.65, ieMinHeure: 0.3419, plafondCAF: 50.15, smic: 10.03, txBrutMin: 2.82 },
];

/**
 * Lookup parametrage for a given region and date (first day of month).
 * @param {string} region - "Autres" or "Alsace-Moselle"
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {object|null} matching parametrage row
 */
function getParametrage(region, year, month) {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
  return PARAMETRAGE.find(p =>
    p.region === region && p.debut <= dateStr && p.fin >= dateStr
  ) || null;
}
```

**Step 2: Verify lookup works**

Add temporary test at end of file:
```javascript
console.log('Test lookup:', getParametrage('Autres', 2026, 2));
// Should log the 2026-01-01 row with tauxConversion: 0.7812
```

Open browser console, verify output, then remove the test line.

**Step 3: Commit**

```bash
git add js/parametrage.js
git commit -m "feat: add parametrage data table with region/date lookup (2019-2026)"
```

---

### Task 3: Calculation engine (pure functions)

**Files:**
- Create: `js/calculs.js`
- Create: `tests/test-calculs.html` (manual test page)

**Step 1: Write the calculation functions**

```javascript
// js/calculs.js
// Moteur de calcul Pajemploi — fonctions pures

/**
 * Calculate mensualisation (monthly smoothed values).
 * @param {object} contrat - contract parameters
 * @returns {object} { heuresMensu, joursMensu, heuresMajoMensu, heuresNormalesMensu, mensualisationBrute }
 */
function calculMensualisation(contrat) {
  const { nbSemContrat, heuresParSemaine, joursParSemaine, tauxHoraire, majorationHS, pourcentMajo } = contrat;

  const heuresMensu = (heuresParSemaine / nbSemContrat) * 52 / 12;
  const joursMensu = (joursParSemaine / nbSemContrat) * 52 / 12;

  let heuresMajoMensu = 0;
  let heuresNormalesMensu = heuresMensu;

  if (majorationHS && heuresParSemaine > 45) {
    heuresMajoMensu = ((heuresParSemaine - 45) / nbSemContrat) * 52 / 12;
    heuresNormalesMensu = heuresMensu - heuresMajoMensu;
  }

  const mensualisationBrute = majorationHS && heuresParSemaine > 45
    ? tauxHoraire * heuresNormalesMensu + tauxHoraire * (1 + pourcentMajo) * heuresMajoMensu
    : tauxHoraire * heuresMensu;

  return {
    heuresMensu: round2(heuresMensu),
    joursMensu: round2(joursMensu),
    heuresMajoMensu: round2(heuresMajoMensu),
    heuresNormalesMensu: round2(heuresNormalesMensu),
    mensualisationBrute: round2(mensualisationBrute),
  };
}

/**
 * Calculate absence deduction using Cour de Cassation method.
 * @param {number} mensualisationBrute
 * @param {number} heuresDeduites - total hours to deduct this month
 * @param {number} heuresPotentielles - total potential hours this month
 * @returns {number} deduction amount (positive)
 */
function calculDeduction(mensualisationBrute, heuresDeduites, heuresPotentielles) {
  if (heuresPotentielles === 0 || heuresDeduites === 0) return 0;
  return round2(mensualisationBrute * heuresDeduites / heuresPotentielles);
}

/**
 * Calculate daily IE (indemnité d'entretien) for one day.
 * @param {number} heuresReelles - actual hours worked that day
 * @param {object} params - { ieMinConvJour, ieMinLegalHeure, ieContractuelHeure, ieContractuelJour }
 * @returns {number} IE for the day (rounded up to cent)
 */
function calculIEJour(heuresReelles, params) {
  if (heuresReelles <= 0) return 0;
  const { ieMinConvJour, ieMinLegalHeure, ieContractuelHeure, ieContractuelJour } = params;
  const ie = Math.max(
    ieMinConvJour,
    heuresReelles * ieMinLegalHeure,
    heuresReelles * (ieContractuelHeure || 0),
    ieContractuelJour || 0
  );
  return Math.ceil(ie * 100) / 100; // round up to cent
}

/**
 * Calculate all monthly totals from daily attendance data.
 * @param {Array} jours - array of daily data objects
 * @param {object} contrat - contract parameters
 * @param {object} parametrage - current month parametrage row
 * @returns {object} monthly totals and Pajemploi declaration values
 */
function calculMois(jours, contrat, parametrage) {
  const mensu = calculMensualisation(contrat);

  // Sum daily values
  let totalHeuresPrevues = 0;
  let totalHeuresPotentielles = 0;
  let totalHeuresRealisees = 0;
  let totalHeuresDeduire = 0;
  let totalJoursAbsence = 0;
  let totalHeuresComp = 0;
  let totalHeuresMajo = 0;
  let totalIE = 0;
  let totalIR = 0;
  let totalIK = 0;
  let joursEnPlus = 0;

  const ieParams = {
    ieMinConvJour: parametrage.ieMinJour,
    ieMinLegalHeure: parametrage.ieMinHeure,
    ieContractuelHeure: contrat.ieContractuelHeure || 0,
    ieContractuelJour: contrat.ieContractuelJour || 0,
  };

  jours.forEach(j => {
    totalHeuresPrevues += j.heuresPrevues || 0;
    totalHeuresPotentielles += j.heuresPotentielles || 0;
    totalHeuresRealisees += j.heuresRealisees || 0;
    totalHeuresDeduire += j.heuresDeduire || 0;
    totalHeuresComp += j.heuresComp || 0;
    totalHeuresMajo += j.heuresMajo || 0;
    totalIE += calculIEJour(j.heuresRealisees || 0, ieParams);
    totalIK += (j.km || 0) * (contrat.tarifKm || 0);
    joursEnPlus += (j.jourEnPlus ? 1 : 0);

    // IR: sum of meals by type
    if (j.irType1) totalIR += j.irType1 * (contrat.tarifRepas1 || 0);
    if (j.irType2) totalIR += j.irType2 * (contrat.tarifRepas2 || 0);
    if (j.irType3) totalIR += j.irType3 * (contrat.tarifRepas3 || 0);

    // Absence detection
    if (j.heuresPrevues > 0 && j.heuresDeduire >= j.heuresPrevues) {
      totalJoursAbsence++;
    }
  });

  // Deduction
  const deduction = calculDeduction(mensu.mensualisationBrute, totalHeuresDeduire, totalHeuresPotentielles);

  // Brut for salary base (before complementary/majo)
  const salaireBase = mensu.mensualisationBrute - deduction;

  // Complementary hours pay
  const payComp = round2(totalHeuresComp * contrat.tauxHoraire);

  // Majorated hours pay (non-mensualized)
  const payMajo = round2(totalHeuresMajo * contrat.tauxHoraire * (1 + contrat.pourcentMajo));

  // Total brut
  const totalBrut = round2(salaireBase + payComp + payMajo);

  // Net calculation
  const tauxConversion = parametrage.tauxConversion;
  const salaireNet = round2(totalBrut * tauxConversion);
  const tauxHoraireNet = round2(contrat.tauxHoraire * tauxConversion);

  // Pajemploi declaration values
  const heuresNormalesPajemploi = round2(
    contrat.majorationHS && contrat.heuresParSemaine > 45
      ? mensu.heuresNormalesMensu + (deduction > 0 ? -deduction / contrat.tauxHoraire : 0)
      : mensu.heuresMensu + (deduction > 0 ? -deduction / contrat.tauxHoraire : 0)
  );

  const joursActivite = Math.round(mensu.joursMensu - totalJoursAbsence + joursEnPlus);

  return {
    // Mensualisation
    ...mensu,
    // Totaux du mois
    totalHeuresPrevues,
    totalHeuresPotentielles,
    totalHeuresRealisees,
    totalHeuresDeduire,
    totalJoursAbsence,
    totalHeuresComp,
    totalHeuresMajo,
    totalIE: round2(totalIE),
    totalIR: round2(totalIR),
    totalIK: round2(totalIK),
    // Salaire
    deduction,
    salaireBase,
    totalBrut,
    salaireNet,
    tauxHoraireNet,
    tauxConversion,
    // Déclaration Pajemploi
    pajemploi: {
      heuresNormales: Math.round(heuresNormalesPajemploi),
      heuresComplementaires: Math.round(totalHeuresComp),
      heuresMajorees: Math.round(totalHeuresMajo + mensu.heuresMajoMensu),
      joursActivite,
      salaireNet,
      tauxHoraireNet,
      ie: round2(totalIE),
      ir: round2(totalIR),
      ik: round2(totalIK),
    },
  };
}

/**
 * Generate the list of days for a given month with pre-filled contract hours.
 * @param {number} year
 * @param {number} month - 1-12
 * @param {object} contrat - contract parameters
 * @returns {Array} array of day objects
 */
function genererJoursMois(year, month, contrat) {
  const nbJours = new Date(year, month, 0).getDate();
  const joursSemaine = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  const jours = [];

  for (let d = 1; d <= nbJours; d++) {
    const date = new Date(year, month - 1, d);
    const jourSemaine = date.getDay(); // 0=Dim, 1=Lun, ...
    const nomJour = joursSemaine[jourSemaine];
    const estTravaille = contrat.joursTravailles && contrat.joursTravailles[jourSemaine] || false;
    const heuresPrevues = estTravaille ? (contrat.heuresParJour && contrat.heuresParJour[jourSemaine] || 0) : 0;

    jours.push({
      numero: d,
      nomJour,
      jourSemaine,
      estTravaille,
      heuresPrevues,
      heuresPotentielles: heuresPrevues,
      heuresRealisees: 0,
      heuresDeduire: 0,
      heuresComp: 0,
      heuresMajo: 0,
      irType1: 0,
      irType2: 0,
      irType3: 0,
      km: 0,
      commentaire: '',
      jourEnPlus: false,
    });
  }

  return jours;
}

/** Round to 2 decimal places */
function round2(n) {
  return Math.round(n * 100) / 100;
}
```

**Step 2: Create test page to verify calculations**

Create `tests/test-calculs.html`:
```html
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Tests Calculs</title></head>
<body>
<h1>Tests du moteur de calcul</h1>
<pre id="output"></pre>
<script src="../js/parametrage.js"></script>
<script src="../js/calculs.js"></script>
<script>
function assert(name, actual, expected) {
  const pass = Math.abs(actual - expected) < 0.01;
  const msg = pass
    ? `PASS: ${name} = ${actual}`
    : `FAIL: ${name} = ${actual}, expected ${expected}`;
  document.getElementById('output').textContent += msg + '\n';
  if (!pass) console.error(msg);
}

// Test 1: Mensualisation simple (40h/sem, 52 sem, 4.50€)
const contrat1 = {
  nbSemContrat: 52, heuresParSemaine: 40, joursParSemaine: 5,
  tauxHoraire: 4.50, majorationHS: false, pourcentMajo: 0.1
};
const m1 = calculMensualisation(contrat1);
assert('Heures mensu (40h/52sem)', m1.heuresMensu, 173.33);
assert('Jours mensu', m1.joursMensu, 21.67);
assert('Mensualisation brute', m1.mensualisationBrute, 780);

// Test 2: Mensualisation avec majoration (48h/sem, 52 sem)
const contrat2 = {
  nbSemContrat: 52, heuresParSemaine: 48, joursParSemaine: 5,
  tauxHoraire: 4.50, majorationHS: true, pourcentMajo: 0.1
};
const m2 = calculMensualisation(contrat2);
assert('H majo mensu (48h)', m2.heuresMajoMensu, 13);
assert('H normales mensu (48h)', m2.heuresNormalesMensu, 195);

// Test 3: Déduction absence
assert('Déduction (780 * 8/160)', calculDeduction(780, 8, 160), 39);
assert('Déduction (0 heures)', calculDeduction(780, 0, 160), 0);

// Test 4: IE jour
const ieParams = { ieMinConvJour: 2.65, ieMinLegalHeure: 0.425, ieContractuelHeure: 0, ieContractuelJour: 3.80 };
assert('IE 8h (max de 2.65, 3.40, 0, 3.80)', calculIEJour(8, ieParams), 3.80);
assert('IE 10h (max de 2.65, 4.25, 0, 3.80)', calculIEJour(10, ieParams), 4.25);
assert('IE 0h', calculIEJour(0, ieParams), 0);

// Test 5: Parametrage lookup
const p = getParametrage('Autres', 2026, 2);
assert('Taux conversion 2026', p.tauxConversion, 0.7812);

document.getElementById('output').textContent += '\n--- Tests terminés ---\n';
</script>
</body>
</html>
```

**Step 3: Open test page, verify all tests pass**

Open `tests/test-calculs.html` in browser. All lines should show "PASS".

**Step 4: Commit**

```bash
git add js/calculs.js tests/test-calculs.html
git commit -m "feat: add calculation engine with mensualisation, deduction, IE, and Pajemploi values"
```

---

### Task 4: Contract form (onglet Contrat)

**Files:**
- Modify: `index.html` (fill `#tab-contrat`)
- Modify: `css/style.css` (form styles)
- Create: `js/storage.js`
- Modify: `js/app.js` (tab switching + contract load/save)

**Step 1: Add contract form HTML in `index.html`**

Replace the `<!-- Filled in Task 4 -->` comment in `#tab-contrat` with:

```html
<form id="form-contrat">
  <div class="form-grid">
    <div class="form-group">
      <label for="type-contrat">Type de contrat</label>
      <select id="type-contrat">
        <option value="AC">AC - 52 semaines</option>
        <option value="AI">AI - 46 semaines ou moins</option>
      </select>
    </div>
    <div class="form-group">
      <label for="nb-sem-contrat">Nb semaines contrat</label>
      <input type="number" id="nb-sem-contrat" value="52" min="1" max="52" step="1">
    </div>
    <div class="form-group">
      <label for="heures-semaine">Heures / semaine</label>
      <input type="number" id="heures-semaine" value="40" min="1" max="60" step="0.5">
    </div>
    <div class="form-group">
      <label for="taux-horaire">Taux horaire brut</label>
      <input type="number" id="taux-horaire" value="4.50" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label>Majoration HS mensualisée (&gt;45h)</label>
      <div class="toggle-group">
        <input type="checkbox" id="majoration-hs">
        <label for="majoration-hs">Activée</label>
      </div>
    </div>
    <div class="form-group" id="group-pourcent-majo">
      <label for="pourcent-majo">% de majoration</label>
      <input type="number" id="pourcent-majo" value="10" min="0" max="100" step="1">
    </div>
    <div class="form-group">
      <label for="region">Région</label>
      <select id="region">
        <option value="Autres">Autres (hors Alsace-Moselle)</option>
        <option value="Alsace-Moselle">Alsace-Moselle</option>
      </select>
    </div>
  </div>

  <h3>Jours travaillés et heures par jour</h3>
  <div class="jours-grid">
    <div class="jour-config" data-dow="1">
      <label><input type="checkbox" class="jour-cb" value="1" checked> Lundi</label>
      <input type="number" class="jour-heures" value="8" min="0" max="24" step="0.5">
    </div>
    <div class="jour-config" data-dow="2">
      <label><input type="checkbox" class="jour-cb" value="2" checked> Mardi</label>
      <input type="number" class="jour-heures" value="8" min="0" max="24" step="0.5">
    </div>
    <div class="jour-config" data-dow="3">
      <label><input type="checkbox" class="jour-cb" value="3"> Mercredi</label>
      <input type="number" class="jour-heures" value="0" min="0" max="24" step="0.5">
    </div>
    <div class="jour-config" data-dow="4">
      <label><input type="checkbox" class="jour-cb" value="4" checked> Jeudi</label>
      <input type="number" class="jour-heures" value="8" min="0" max="24" step="0.5">
    </div>
    <div class="jour-config" data-dow="5">
      <label><input type="checkbox" class="jour-cb" value="5" checked> Vendredi</label>
      <input type="number" class="jour-heures" value="8" min="0" max="24" step="0.5">
    </div>
    <div class="jour-config" data-dow="6">
      <label><input type="checkbox" class="jour-cb" value="6"> Samedi</label>
      <input type="number" class="jour-heures" value="0" min="0" max="24" step="0.5">
    </div>
  </div>

  <h3>Indemnités</h3>
  <div class="form-grid">
    <div class="form-group">
      <label for="ie-jour">IE contractuelle / jour</label>
      <input type="number" id="ie-jour" value="3.80" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label for="ie-heure">IE contractuelle / heure</label>
      <input type="number" id="ie-heure" value="0" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label for="tarif-repas-1">Tarif repas type 1</label>
      <input type="number" id="tarif-repas-1" value="0" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label for="tarif-repas-2">Tarif repas type 2</label>
      <input type="number" id="tarif-repas-2" value="0" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label for="tarif-repas-3">Tarif repas type 3</label>
      <input type="number" id="tarif-repas-3" value="0" min="0" step="0.01">
    </div>
    <div class="form-group">
      <label for="tarif-km">Tarif kilométrique</label>
      <input type="number" id="tarif-km" value="0.35" min="0" step="0.01">
    </div>
  </div>

  <button type="submit" class="btn-save">Sauvegarder le contrat</button>
</form>
```

**Step 2: Add form CSS to `css/style.css`**

```css
/* Form styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.jours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.jour-config {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jour-config input[type="number"] {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h3 {
  font-size: 1rem;
  margin: 1.5rem 0 0.75rem;
  color: var(--text);
}

.btn-save {
  padding: 0.75rem 2rem;
  background: var(--success);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 1rem;
}

.btn-save:hover { opacity: 0.9; }
```

**Step 3: Write `js/storage.js`**

```javascript
// js/storage.js
// Gestion localStorage pour le contrat et les données mensuelles

const STORAGE_CONTRAT_KEY = 'pajemploi_contrat';

function saveContrat(contrat) {
  localStorage.setItem(STORAGE_CONTRAT_KEY, JSON.stringify(contrat));
}

function loadContrat() {
  const data = localStorage.getItem(STORAGE_CONTRAT_KEY);
  return data ? JSON.parse(data) : null;
}

function saveMois(year, month, jours) {
  const key = `pajemploi_${year}_${String(month).padStart(2, '0')}`;
  localStorage.setItem(key, JSON.stringify(jours));
}

function loadMois(year, month) {
  const key = `pajemploi_${year}_${String(month).padStart(2, '0')}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function listMoisSauvegardes() {
  const mois = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const match = key.match(/^pajemploi_(\d{4})_(\d{2})$/);
    if (match) {
      mois.push({ year: parseInt(match[1]), month: parseInt(match[2]) });
    }
  }
  return mois.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
}
```

**Step 4: Write `js/app.js` with tab switching + contract form**

```javascript
// js/app.js
// Application principale

let currentYear, currentMonth;
let contrat = null;
let joursData = [];

document.addEventListener('DOMContentLoaded', () => {
  initSelectors();
  initTabs();
  initContratForm();
  loadAndDisplay();
});

// --- Month/Year selectors ---
function initSelectors() {
  const selMonth = document.getElementById('select-month');
  const selYear = document.getElementById('select-year');

  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  moisNoms.forEach((nom, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = nom;
    selMonth.appendChild(opt);
  });

  const now = new Date();
  for (let y = now.getFullYear() + 1; y >= 2019; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    selYear.appendChild(opt);
  }

  currentMonth = now.getMonth() + 1;
  currentYear = now.getFullYear();
  selMonth.value = currentMonth;
  selYear.value = currentYear;

  selMonth.addEventListener('change', () => { currentMonth = parseInt(selMonth.value); loadAndDisplay(); });
  selYear.addEventListener('change', () => { currentYear = parseInt(selYear.value); loadAndDisplay(); });
}

// --- Tabs ---
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
}

// --- Contract Form ---
function initContratForm() {
  const saved = loadContrat();
  if (saved) {
    contrat = saved;
    fillContratForm(saved);
  }

  document.getElementById('form-contrat').addEventListener('submit', (e) => {
    e.preventDefault();
    contrat = readContratForm();
    saveContrat(contrat);
    loadAndDisplay();
    showNotification('Contrat sauvegardé');
  });

  // Show/hide majoration % based on checkbox
  document.getElementById('majoration-hs').addEventListener('change', (e) => {
    document.getElementById('group-pourcent-majo').style.display = e.target.checked ? '' : 'none';
  });
}

function readContratForm() {
  const joursTravailles = {};
  const heuresParJour = {};
  document.querySelectorAll('.jour-config').forEach(el => {
    const dow = parseInt(el.dataset.dow);
    const cb = el.querySelector('.jour-cb');
    const heures = el.querySelector('.jour-heures');
    joursTravailles[dow] = cb.checked;
    heuresParJour[dow] = cb.checked ? parseFloat(heures.value) || 0 : 0;
  });

  // Count active days and total hours per week
  let joursParSemaine = 0;
  let heuresParSemaine = 0;
  for (const dow in joursTravailles) {
    if (joursTravailles[dow]) {
      joursParSemaine++;
      heuresParSemaine += heuresParJour[dow];
    }
  }

  return {
    typeContrat: document.getElementById('type-contrat').value,
    nbSemContrat: parseInt(document.getElementById('nb-sem-contrat').value) || 52,
    heuresParSemaine,
    joursParSemaine,
    joursTravailles,
    heuresParJour,
    tauxHoraire: parseFloat(document.getElementById('taux-horaire').value) || 0,
    majorationHS: document.getElementById('majoration-hs').checked,
    pourcentMajo: (parseFloat(document.getElementById('pourcent-majo').value) || 10) / 100,
    region: document.getElementById('region').value,
    ieContractuelJour: parseFloat(document.getElementById('ie-jour').value) || 0,
    ieContractuelHeure: parseFloat(document.getElementById('ie-heure').value) || 0,
    tarifRepas1: parseFloat(document.getElementById('tarif-repas-1').value) || 0,
    tarifRepas2: parseFloat(document.getElementById('tarif-repas-2').value) || 0,
    tarifRepas3: parseFloat(document.getElementById('tarif-repas-3').value) || 0,
    tarifKm: parseFloat(document.getElementById('tarif-km').value) || 0,
  };
}

function fillContratForm(c) {
  document.getElementById('type-contrat').value = c.typeContrat || 'AC';
  document.getElementById('nb-sem-contrat').value = c.nbSemContrat || 52;
  document.getElementById('taux-horaire').value = c.tauxHoraire || 4.50;
  document.getElementById('majoration-hs').checked = c.majorationHS || false;
  document.getElementById('pourcent-majo').value = (c.pourcentMajo || 0.1) * 100;
  document.getElementById('group-pourcent-majo').style.display = c.majorationHS ? '' : 'none';
  document.getElementById('region').value = c.region || 'Autres';
  document.getElementById('ie-jour').value = c.ieContractuelJour || 3.80;
  document.getElementById('ie-heure').value = c.ieContractuelHeure || 0;
  document.getElementById('tarif-repas-1').value = c.tarifRepas1 || 0;
  document.getElementById('tarif-repas-2').value = c.tarifRepas2 || 0;
  document.getElementById('tarif-repas-3').value = c.tarifRepas3 || 0;
  document.getElementById('tarif-km').value = c.tarifKm || 0.35;

  // Days
  if (c.joursTravailles) {
    document.querySelectorAll('.jour-config').forEach(el => {
      const dow = parseInt(el.dataset.dow);
      el.querySelector('.jour-cb').checked = c.joursTravailles[dow] || false;
      el.querySelector('.jour-heures').value = c.heuresParJour ? (c.heuresParJour[dow] || 0) : 0;
    });
  }
}

// --- Load & Display ---
function loadAndDisplay() {
  if (!contrat) return;

  const parametrage = getParametrage(contrat.region, currentYear, currentMonth);
  if (!parametrage) {
    console.warn('Pas de paramètrage pour', contrat.region, currentYear, currentMonth);
    return;
  }

  // Load saved data or generate fresh
  const saved = loadMois(currentYear, currentMonth);
  if (saved) {
    joursData = saved;
  } else {
    joursData = genererJoursMois(currentYear, currentMonth, contrat);
  }

  renderPresence();
  recalculer();
  renderFooter(parametrage);
  renderHistory();
}

function recalculer() {
  if (!contrat || joursData.length === 0) return;
  const parametrage = getParametrage(contrat.region, currentYear, currentMonth);
  if (!parametrage) return;

  const resultats = calculMois(joursData, contrat, parametrage);
  renderResultats(resultats);
}

// Placeholder render functions — filled in Tasks 5 and 6
function renderPresence() {}
function renderResultats(resultats) {}
function renderFooter(parametrage) {}
function renderHistory() {}

function showNotification(msg) {
  // Simple notification
  const el = document.createElement('div');
  el.className = 'notification';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
```

**Step 5: Add notification CSS**

```css
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--success);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Step 6: Verify in browser**

- Contract tab visible with all fields
- Tabs switch correctly
- Save contract → shows notification
- Reload page → contract values restored

**Step 7: Commit**

```bash
git add index.html css/style.css js/storage.js js/app.js
git commit -m "feat: add contract form with localStorage save/load and tab navigation"
```

---

### Task 5: Attendance sheet (onglet Présence)

**Files:**
- Modify: `index.html` (add `#tab-presence` placeholder content)
- Modify: `css/style.css` (table styles)
- Modify: `js/app.js` (implement `renderPresence()`)

**Step 1: Add attendance table container in `index.html`**

Replace `<!-- Filled in Task 5 -->` in `#tab-presence`:

```html
<div class="presence-wrapper">
  <table id="table-presence" class="presence-table">
    <thead>
      <tr>
        <th>Jour</th>
        <th>Prévu</th>
        <th>Potent.</th>
        <th>Réalisé</th>
        <th>Déduire</th>
        <th>Absent</th>
        <th>H.Comp</th>
        <th>H.Majo</th>
        <th>IE</th>
        <th>IR (type)</th>
        <th>IK (km)</th>
        <th>Commentaire</th>
      </tr>
    </thead>
    <tbody id="tbody-presence"></tbody>
    <tfoot id="tfoot-presence"></tfoot>
  </table>
</div>
```

**Step 2: Add table CSS**

```css
.presence-wrapper {
  overflow-x: auto;
}

.presence-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.presence-table th {
  background: var(--primary);
  color: white;
  padding: 0.5rem 0.4rem;
  text-align: center;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
}

.presence-table td {
  padding: 0.25rem 0.2rem;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.presence-table tr.jour-off {
  background: #f1f5f9;
  color: var(--text-light);
}

.presence-table tr.jour-off input {
  background: #f1f5f9;
}

.presence-table input[type="number"] {
  width: 55px;
  padding: 0.2rem;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.85rem;
}

.presence-table input[type="number"]:focus {
  border-color: var(--primary);
  outline: none;
}

.presence-table input[type="text"] {
  width: 100px;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.8rem;
}

.presence-table select {
  padding: 0.2rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.8rem;
}

.presence-table .col-jour {
  font-weight: 600;
  white-space: nowrap;
  text-align: left;
  padding-left: 0.5rem;
}

.presence-table .col-auto {
  background: #f8fafc;
  color: var(--text-light);
  font-weight: 500;
}

.presence-table tfoot td {
  font-weight: 700;
  background: var(--primary-light);
  border-top: 2px solid var(--primary);
}

.badge-absent {
  display: inline-block;
  background: var(--danger);
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
}
```

**Step 3: Implement `renderPresence()` in `js/app.js`**

Replace the placeholder `renderPresence()` function:

```javascript
function renderPresence() {
  const tbody = document.getElementById('tbody-presence');
  const tfoot = document.getElementById('tfoot-presence');
  const parametrage = getParametrage(contrat.region, currentYear, currentMonth);
  if (!parametrage) return;

  tbody.innerHTML = '';

  joursData.forEach((j, i) => {
    const tr = document.createElement('tr');
    if (!j.estTravaille) tr.classList.add('jour-off');

    const ie = calculIEJour(j.heuresRealisees || 0, {
      ieMinConvJour: parametrage.ieMinJour,
      ieMinLegalHeure: parametrage.ieMinHeure,
      ieContractuelHeure: contrat.ieContractuelHeure || 0,
      ieContractuelJour: contrat.ieContractuelJour || 0,
    });

    const absent = j.heuresPrevues > 0 && j.heuresDeduire >= j.heuresPrevues;

    tr.innerHTML = `
      <td class="col-jour">${j.nomJour} ${j.numero}</td>
      <td class="col-auto">${j.heuresPrevues || ''}</td>
      <td class="col-auto">${j.heuresPotentielles || ''}</td>
      <td><input type="number" data-idx="${i}" data-field="heuresRealisees" value="${j.heuresRealisees || ''}" step="0.5" min="0" ${!j.estTravaille && !j.heuresRealisees ? 'tabindex="-1"' : ''}></td>
      <td><input type="number" data-idx="${i}" data-field="heuresDeduire" value="${j.heuresDeduire || ''}" step="0.5" min="0"></td>
      <td>${absent ? '<span class="badge-absent">Oui</span>' : ''}</td>
      <td><input type="number" data-idx="${i}" data-field="heuresComp" value="${j.heuresComp || ''}" step="0.5" min="0"></td>
      <td><input type="number" data-idx="${i}" data-field="heuresMajo" value="${j.heuresMajo || ''}" step="0.5" min="0"></td>
      <td class="col-auto">${ie > 0 ? ie.toFixed(2) : ''}</td>
      <td>
        <select data-idx="${i}" data-field="irType1">
          <option value="0"></option>
          <option value="1" ${j.irType1 ? 'selected' : ''}>R1</option>
        </select>
        <select data-idx="${i}" data-field="irType2">
          <option value="0"></option>
          <option value="1" ${j.irType2 ? 'selected' : ''}>R2</option>
        </select>
        <select data-idx="${i}" data-field="irType3">
          <option value="0"></option>
          <option value="1" ${j.irType3 ? 'selected' : ''}>R3</option>
        </select>
      </td>
      <td><input type="number" data-idx="${i}" data-field="km" value="${j.km || ''}" step="0.1" min="0"></td>
      <td><input type="text" data-idx="${i}" data-field="commentaire" value="${j.commentaire || ''}"></td>
    `;
    tbody.appendChild(tr);
  });

  // Event delegation for all inputs
  tbody.addEventListener('input', handlePresenceInput);

  // Render totals
  renderTotals();
}

function handlePresenceInput(e) {
  const el = e.target;
  const idx = parseInt(el.dataset.idx);
  const field = el.dataset.field;
  if (idx === undefined || !field) return;

  if (el.type === 'number') {
    joursData[idx][field] = parseFloat(el.value) || 0;
  } else if (el.tagName === 'SELECT') {
    joursData[idx][field] = parseInt(el.value) || 0;
  } else {
    joursData[idx][field] = el.value;
  }

  // Auto-save
  saveMois(currentYear, currentMonth, joursData);
  recalculer();
  renderTotals();
}

function renderTotals() {
  const tfoot = document.getElementById('tfoot-presence');
  const parametrage = getParametrage(contrat.region, currentYear, currentMonth);

  let totals = { prevues: 0, potentielles: 0, realisees: 0, deduire: 0, absences: 0, comp: 0, majo: 0, ie: 0, ir: 0, km: 0 };

  const ieParams = {
    ieMinConvJour: parametrage.ieMinJour,
    ieMinLegalHeure: parametrage.ieMinHeure,
    ieContractuelHeure: contrat.ieContractuelHeure || 0,
    ieContractuelJour: contrat.ieContractuelJour || 0,
  };

  joursData.forEach(j => {
    totals.prevues += j.heuresPrevues || 0;
    totals.potentielles += j.heuresPotentielles || 0;
    totals.realisees += j.heuresRealisees || 0;
    totals.deduire += j.heuresDeduire || 0;
    totals.comp += j.heuresComp || 0;
    totals.majo += j.heuresMajo || 0;
    totals.ie += calculIEJour(j.heuresRealisees || 0, ieParams);
    totals.km += j.km || 0;
    if (j.heuresPrevues > 0 && j.heuresDeduire >= j.heuresPrevues) totals.absences++;
    totals.ir += (j.irType1 || 0) * (contrat.tarifRepas1 || 0);
    totals.ir += (j.irType2 || 0) * (contrat.tarifRepas2 || 0);
    totals.ir += (j.irType3 || 0) * (contrat.tarifRepas3 || 0);
  });

  tfoot.innerHTML = `
    <tr>
      <td><strong>TOTAL</strong></td>
      <td class="col-auto">${totals.prevues}</td>
      <td class="col-auto">${totals.potentielles}</td>
      <td>${totals.realisees}</td>
      <td>${totals.deduire}</td>
      <td>${totals.absences || ''}</td>
      <td>${totals.comp}</td>
      <td>${totals.majo}</td>
      <td class="col-auto">${totals.ie.toFixed(2)}</td>
      <td>${totals.ir.toFixed(2)}</td>
      <td>${(totals.km * (contrat.tarifKm || 0)).toFixed(2)}</td>
      <td></td>
    </tr>
  `;
}
```

**Step 4: Verify in browser**

- Switch to "Présence" tab
- Table shows all days of current month
- Non-working days are grayed out
- Type hours in "Réalisé" → IE auto-calculates
- Type in "Déduire" → "Absent" badge appears
- Totals row updates
- Reload → data persists

**Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: add attendance table with daily input, auto IE, totals, and auto-save"
```

---

### Task 6: Side panel — Pajemploi results + copy

**Files:**
- Modify: `index.html` (fill `#pajemploi-results`)
- Modify: `css/style.css` (result styles)
- Modify: `js/app.js` (implement `renderResultats()` + copy button)

**Step 1: Add result fields in `index.html`**

Replace `<!-- Filled in Task 6 -->`:

```html
<div class="result-grid">
  <div class="result-item">
    <span class="result-label">Heures normales</span>
    <span class="result-value" id="res-heures-normales">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">H. complémentaires</span>
    <span class="result-value" id="res-heures-comp">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">H. majorées</span>
    <span class="result-value" id="res-heures-majo">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">Jours d'activité</span>
    <span class="result-value" id="res-jours-activite">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">Salaire net</span>
    <span class="result-value result-highlight" id="res-salaire-net">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">Taux horaire net</span>
    <span class="result-value" id="res-taux-net">—</span>
  </div>
  <div class="result-divider"></div>
  <div class="result-item">
    <span class="result-label">Indem. entretien (IE)</span>
    <span class="result-value" id="res-ie">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">Indem. repas (IR)</span>
    <span class="result-value" id="res-ir">—</span>
  </div>
  <div class="result-item">
    <span class="result-label">Indem. km (IK)</span>
    <span class="result-value" id="res-ik">—</span>
  </div>
</div>
```

**Step 2: Add result CSS**

```css
.result-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
}

.result-label {
  font-size: 0.85rem;
  color: var(--text-light);
}

.result-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.result-highlight {
  color: var(--primary);
  font-size: 1.2rem;
}

.result-divider {
  height: 1px;
  background: var(--border);
  margin: 0.25rem 0;
}
```

**Step 3: Implement `renderResultats()` in `js/app.js`**

Replace placeholder:

```javascript
function renderResultats(resultats) {
  const p = resultats.pajemploi;
  document.getElementById('res-heures-normales').textContent = p.heuresNormales;
  document.getElementById('res-heures-comp').textContent = p.heuresComplementaires;
  document.getElementById('res-heures-majo').textContent = p.heuresMajorees;
  document.getElementById('res-jours-activite').textContent = p.joursActivite;
  document.getElementById('res-salaire-net').textContent = p.salaireNet.toFixed(2) + ' €';
  document.getElementById('res-taux-net').textContent = p.tauxHoraireNet.toFixed(2) + ' €';
  document.getElementById('res-ie').textContent = p.ie.toFixed(2) + ' €';
  document.getElementById('res-ir').textContent = p.ir.toFixed(2) + ' €';
  document.getElementById('res-ik').textContent = p.ik.toFixed(2) + ' €';
}
```

**Step 4: Implement copy button**

Add to `js/app.js`:

```javascript
document.getElementById('btn-copy').addEventListener('click', () => {
  if (!contrat || joursData.length === 0) return;

  const parametrage = getParametrage(contrat.region, currentYear, currentMonth);
  const r = calculMois(joursData, contrat, parametrage);
  const p = r.pajemploi;

  const text = [
    `Heures normales : ${p.heuresNormales}`,
    `Heures complémentaires : ${p.heuresComplementaires}`,
    `Heures majorées : ${p.heuresMajorees}`,
    `Jours d'activité : ${p.joursActivite}`,
    `Salaire net : ${p.salaireNet.toFixed(2)}`,
    `Taux horaire net : ${p.tauxHoraireNet.toFixed(2)}`,
    `IE : ${p.ie.toFixed(2)}`,
    `IR : ${p.ir.toFixed(2)}`,
    `IK : ${p.ik.toFixed(2)}`,
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    showNotification('Valeurs copiées !');
  });
});
```

**Step 5: Verify in browser**

- Side panel shows calculated values
- Values update in real-time when editing attendance
- "Copier les valeurs" copies formatted text to clipboard

**Step 6: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: add Pajemploi results side panel with real-time updates and copy to clipboard"
```

---

### Task 7: Footer + history + finishing touches

**Files:**
- Modify: `js/app.js` (implement `renderFooter()`, `renderHistory()`)
- Modify: `css/style.css` (history styles)

**Step 1: Implement `renderFooter()`**

```javascript
function renderFooter(parametrage) {
  document.getElementById('footer-rates').textContent =
    `Taux de conversion brut/net : ${parametrage.tauxConversion} | ` +
    `IE min : ${parametrage.ieMinJour}€/j — ${parametrage.ieMinHeure}€/h | ` +
    `SMIC : ${parametrage.smic}€ | ` +
    `Tx brut min : ${parametrage.txBrutMin}€`;
}
```

**Step 2: Implement `renderHistory()`**

```javascript
function renderHistory() {
  const list = document.getElementById('history-list');
  const moisNoms = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const mois = listMoisSauvegardes();

  list.innerHTML = '';
  mois.forEach(m => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const isCurrent = m.year === currentYear && m.month === currentMonth;
    li.innerHTML = `
      <a href="#" class="history-link ${isCurrent ? 'active' : ''}" data-y="${m.year}" data-m="${m.month}">
        ${moisNoms[m.month - 1]} ${m.year}
      </a>
    `;
    list.appendChild(li);
  });

  list.addEventListener('click', (e) => {
    e.preventDefault();
    const link = e.target.closest('.history-link');
    if (!link) return;
    currentYear = parseInt(link.dataset.y);
    currentMonth = parseInt(link.dataset.m);
    document.getElementById('select-year').value = currentYear;
    document.getElementById('select-month').value = currentMonth;
    loadAndDisplay();
  });
}
```

**Step 3: Add history CSS**

```css
.history-item {
  list-style: none;
}

.history-link {
  display: block;
  padding: 0.4rem 0.75rem;
  color: var(--text);
  text-decoration: none;
  border-radius: var(--radius);
  font-size: 0.85rem;
}

.history-link:hover { background: var(--primary-light); }
.history-link.active { background: var(--primary); color: white; }

#history-section { margin-top: 1.5rem; }
#history-section summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-light);
}
```

**Step 4: Add taux horaire brut minimum warning**

In `renderResultats()`, after updating all values, add:

```javascript
// Check taux horaire minimum
if (contrat.tauxHoraire < parametrage.txBrutMin) {
  document.getElementById('res-salaire-net').style.color = 'var(--danger)';
  document.getElementById('res-salaire-net').title = `Attention : taux horaire (${contrat.tauxHoraire}€) inférieur au minimum (${parametrage.txBrutMin}€)`;
} else {
  document.getElementById('res-salaire-net').style.color = '';
  document.getElementById('res-salaire-net').title = '';
}
```

**Step 5: Full browser verification**

- Footer shows current rates
- History section lists saved months
- Click history item → navigates to that month
- Taux horaire warning works
- Full flow: set contract → fill attendance → see results → copy

**Step 6: Commit**

```bash
git add js/app.js css/style.css
git commit -m "feat: add footer rates, month history navigation, and taux minimum warning"
```

---

### Task 8: Event delegation fix and polish

**Files:**
- Modify: `js/app.js` (fix double event listener on re-render)
- Modify: `css/style.css` (responsive polish)

**Step 1: Fix event delegation**

In `renderPresence()`, the `tbody.addEventListener('input', ...)` adds a new listener every re-render. Fix by attaching once during init:

Move the event listener out of `renderPresence()` and into `DOMContentLoaded`:

```javascript
// In DOMContentLoaded, add:
document.getElementById('tbody-presence').addEventListener('input', handlePresenceInput);
```

Remove the `tbody.addEventListener('input', handlePresenceInput);` line from `renderPresence()`.

**Step 2: Add responsive styles for mobile**

```css
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
  .header h1 { font-size: 1.1rem; }

  .main-layout { padding: 0.5rem; }

  .tab-content { padding: 0.75rem; }

  .presence-table input[type="number"] { width: 45px; }
  .presence-table input[type="text"] { width: 70px; }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

**Step 3: Final verification**

- Open on desktop: two-column layout works
- Resize to mobile: single column, table scrolls horizontally
- Complete a full month entry flow end-to-end
- Change month, verify data persists independently

**Step 4: Commit**

```bash
git add js/app.js css/style.css
git commit -m "fix: event delegation, responsive polish for mobile"
```

---

### Task 9: Final test page update and cleanup

**Files:**
- Modify: `tests/test-calculs.html` (add more edge case tests)
- Clean up any console.log statements

**Step 1: Add edge case tests**

Add to `tests/test-calculs.html`:

```javascript
// Test: AI contract (46 weeks)
const contratAI = {
  nbSemContrat: 46, heuresParSemaine: 40, joursParSemaine: 5,
  tauxHoraire: 4.50, majorationHS: false, pourcentMajo: 0.1
};
const mAI = calculMensualisation(contratAI);
assert('Heures mensu AI (40h/46sem)', mAI.heuresMensu, 150.72);

// Test: Zero potential hours (no deduction possible)
assert('Déduction 0 potentielles', calculDeduction(780, 8, 0), 0);

// Test: IE with contractual hourly rate
const ieParams2 = { ieMinConvJour: 2.65, ieMinLegalHeure: 0.425, ieContractuelHeure: 0.50, ieContractuelJour: 0 };
assert('IE 8h contractuel heure', calculIEJour(8, ieParams2), 4); // 8*0.50=4 > 2.65, > 3.40

// Test: genererJoursMois returns correct number of days
const jFev = genererJoursMois(2026, 2, contrat1);
assert('Février 2026 = 28 jours', jFev.length, 28);
const jMar = genererJoursMois(2026, 3, contrat1);
assert('Mars 2026 = 31 jours', jMar.length, 31);
```

**Step 2: Remove any debug console.log**

Search all JS files for `console.log` and remove any that are not in the test file.

**Step 3: Commit**

```bash
git add tests/test-calculs.html js/
git commit -m "test: add edge case tests, clean up debug logs"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project scaffold + HTML layout + CSS grid | `index.html`, `css/style.css`, JS stubs |
| 2 | Parametrage data module (2019-2026) | `js/parametrage.js` |
| 3 | Calculation engine (pure functions + tests) | `js/calculs.js`, `tests/test-calculs.html` |
| 4 | Contract form + localStorage + tabs | `js/storage.js`, `js/app.js`, HTML |
| 5 | Attendance table with daily input | `js/app.js`, HTML, CSS |
| 6 | Pajemploi results panel + copy | `js/app.js`, HTML, CSS |
| 7 | Footer rates + history navigation | `js/app.js`, CSS |
| 8 | Event fix + responsive polish | `js/app.js`, CSS |
| 9 | Final tests + cleanup | `tests/test-calculs.html` |
