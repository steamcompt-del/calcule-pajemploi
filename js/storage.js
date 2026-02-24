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
