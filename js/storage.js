// js/storage.js
// Gestion localStorage pour le contrat et les mois de presence

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

/**
 * Exporte toutes les données Pajemploi (contrat + mois) en un seul objet JSON.
 * @returns {object} { version, date, contrat, mois: { "YYYY_MM": data, ... } }
 */
function exporterDonnees() {
  var contrat = loadContrat();
  var moisList = listMoisSauvegardes();
  var mois = {};

  moisList.forEach(function (m) {
    var key = 'pajemploi_' + m.year + '_' + String(m.month).padStart(2, '0');
    var data = localStorage.getItem(key);
    if (data) {
      mois[m.year + '_' + String(m.month).padStart(2, '0')] = JSON.parse(data);
    }
  });

  return {
    version: 1,
    date: new Date().toISOString(),
    contrat: contrat,
    mois: mois,
  };
}

/**
 * Importe des données Pajemploi depuis un objet JSON.
 * Écrase le contrat et tous les mois existants.
 *
 * @param {object} data - objet issu de exporterDonnees()
 * @returns {{ contrat: boolean, moisCount: number }} résumé de l'import
 * @throws {Error} si la structure est invalide
 */
function importerDonnees(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Fichier invalide : pas un objet JSON');
  }
  if (!data.version) {
    throw new Error('Fichier invalide : version manquante');
  }

  var result = { contrat: false, moisCount: 0 };

  // Importer le contrat
  if (data.contrat && typeof data.contrat === 'object') {
    saveContrat(data.contrat);
    result.contrat = true;
  }

  // Importer les mois
  if (data.mois && typeof data.mois === 'object') {
    var keys = Object.keys(data.mois);
    keys.forEach(function (key) {
      var match = key.match(/^(\d{4})_(\d{2})$/);
      if (match) {
        var year = parseInt(match[1]);
        var month = parseInt(match[2]);
        saveMois(year, month, data.mois[key]);
        result.moisCount++;
      }
    });
  }

  return result;
}
