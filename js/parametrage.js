// js/parametrage.js
// Table de parametrage -- taux de cotisations, IE minimums, SMIC par region et periode
// Source : Excel Pajemploi, onglet "Parametrage"

const PARAMETRAGE = [
  // ============================================================
  // Region "Autres" (hors Alsace-Moselle)
  // ============================================================
  { region: "Autres", debut: "2026-01-01", fin: "3000-01-01",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.425,
    plafondCAF: 8, smic: 12.02, txBrutMin: 3.50 },

  { region: "Autres", debut: "2025-09-01", fin: "2025-12-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 8, smic: 11.88, txBrutMin: 3.50 },

  { region: "Autres", debut: "2025-05-01", fin: "2025-08-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Autres", debut: "2025-01-01", fin: "2025-04-30",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Autres", debut: "2024-11-01", fin: "2024-12-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Autres", debut: "2024-05-01", fin: "2024-10-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.50 },

  { region: "Autres", debut: "2024-04-01", fin: "2024-04-30",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },

  { region: "Autres", debut: "2024-02-01", fin: "2024-03-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },

  { region: "Autres", debut: "2024-01-01", fin: "2024-01-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.43 },

  { region: "Autres", debut: "2023-09-01", fin: "2023-12-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.410,
    plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.43 },

  { region: "Autres", debut: "2023-05-01", fin: "2023-08-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.410,
    plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.36 },

  { region: "Autres", debut: "2023-01-01", fin: "2023-04-30",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.401,
    plafondCAF: 56.35, smic: 11.27, txBrutMin: 3.20 },

  { region: "Autres", debut: "2022-01-01", fin: "2022-12-31",
    tauxConversion: 0.7812, ieMinJour: 2.65, ieMinHeure: 0.376,
    plafondCAF: 52.85, smic: 10.57, txBrutMin: 2.97 },

  { region: "Autres", debut: "2021-01-01", fin: "2021-12-31",
    tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3447,
    plafondCAF: 51.25, smic: 10.25, txBrutMin: 2.88 },

  { region: "Autres", debut: "2020-01-01", fin: "2020-12-31",
    tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3447,
    plafondCAF: 50.75, smic: 10.15, txBrutMin: 2.88 },

  { region: "Autres", debut: "2019-01-01", fin: "2019-12-31",
    tauxConversion: 0.7801, ieMinJour: 2.65, ieMinHeure: 0.3419,
    plafondCAF: 50.15, smic: 10.03, txBrutMin: 2.82 },

  // ============================================================
  // Region "Alsace-Moselle"
  // ============================================================
  { region: "Alsace-Moselle", debut: "2026-01-01", fin: "3000-01-01",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.425,
    plafondCAF: 8, smic: 12.02, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2025-09-01", fin: "2025-12-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 8, smic: 11.88, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2025-05-01", fin: "2025-08-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2025-01-01", fin: "2025-04-30",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2024-11-01", fin: "2024-12-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.422,
    plafondCAF: 59.40, smic: 11.88, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2024-05-01", fin: "2024-10-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.50 },

  { region: "Alsace-Moselle", debut: "2024-04-01", fin: "2024-04-30",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },

  { region: "Alsace-Moselle", debut: "2024-02-01", fin: "2024-03-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.45 },

  { region: "Alsace-Moselle", debut: "2024-01-01", fin: "2024-01-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.415,
    plafondCAF: 58.25, smic: 11.65, txBrutMin: 3.43 },

  { region: "Alsace-Moselle", debut: "2023-09-01", fin: "2023-12-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.410,
    plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.43 },

  { region: "Alsace-Moselle", debut: "2023-05-01", fin: "2023-08-31",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.410,
    plafondCAF: 57.60, smic: 11.52, txBrutMin: 3.36 },

  { region: "Alsace-Moselle", debut: "2023-01-01", fin: "2023-04-30",
    tauxConversion: 0.7682, ieMinJour: 2.65, ieMinHeure: 0.401,
    plafondCAF: 56.35, smic: 11.27, txBrutMin: 3.20 },

  { region: "Alsace-Moselle", debut: "2022-01-01", fin: "2022-12-31",
    tauxConversion: 0.7654, ieMinJour: 2.65, ieMinHeure: 0.376,
    plafondCAF: 52.85, smic: 10.57, txBrutMin: 2.97 },

  { region: "Alsace-Moselle", debut: "2021-01-01", fin: "2021-12-31",
    tauxConversion: 0.7651, ieMinJour: 2.65, ieMinHeure: 0.3447,
    plafondCAF: 51.25, smic: 10.25, txBrutMin: 2.88 },

  { region: "Alsace-Moselle", debut: "2020-01-01", fin: "2020-12-31",
    tauxConversion: 0.7651, ieMinJour: 2.65, ieMinHeure: 0.3447,
    plafondCAF: 50.75, smic: 10.15, txBrutMin: 2.88 },

  { region: "Alsace-Moselle", debut: "2019-01-01", fin: "2019-12-31",
    tauxConversion: 0.7651, ieMinJour: 2.65, ieMinHeure: 0.3419,
    plafondCAF: 50.15, smic: 10.03, txBrutMin: 2.82 },
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
