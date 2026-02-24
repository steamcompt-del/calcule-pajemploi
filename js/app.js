// js/app.js
// Application principale -- orchestration UI, evenements, rendu

var joursData = [];
var currentContrat = null;

// ============================================================
// Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  initSelectors();
  initTabs();
  initContratForm();
  initPresenceListener();
  initCopyButton();

  // Load saved contract
  var saved = loadContrat();
  if (saved) {
    currentContrat = saved;
    fillContratForm(saved);
  }

  loadAndDisplay();
});

// ============================================================
// Month / Year selectors
// ============================================================
function initSelectors() {
  var selectMonth = document.getElementById('select-month');
  var selectYear = document.getElementById('select-year');
  var moisNoms = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];

  var now = new Date();
  var currentMonth = now.getMonth() + 1; // 1-12
  var currentYear = now.getFullYear();

  // Populate months
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = moisNoms[i];
    if (i + 1 === currentMonth) opt.selected = true;
    selectMonth.appendChild(opt);
  }

  // Populate years
  for (var y = 2019; y <= 2027; y++) {
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    selectYear.appendChild(opt);
  }

  selectMonth.addEventListener('change', function () { loadAndDisplay(); });
  selectYear.addEventListener('change', function () { loadAndDisplay(); });
}

function getSelectedMonth() {
  return parseInt(document.getElementById('select-month').value);
}

function getSelectedYear() {
  return parseInt(document.getElementById('select-year').value);
}

// ============================================================
// Tab switching
// ============================================================
function initTabs() {
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      // Deactivate all tabs
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });

      // Activate clicked tab
      this.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');
    });
  });
}

// ============================================================
// Contract form
// ============================================================
function initContratForm() {
  var form = document.getElementById('form-contrat');
  var checkbox = document.getElementById('majorationHS');
  var groupMajo = document.getElementById('group-pourcentMajo');

  // Show/hide % majoration based on checkbox
  checkbox.addEventListener('change', function () {
    groupMajo.style.display = this.checked ? '' : 'none';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var contrat = readContratForm();
    currentContrat = contrat;
    saveContrat(contrat);
    showNotification('Contrat enregistre');
    loadAndDisplay();
  });
}

function readContratForm() {
  var typeContrat = document.getElementById('typeContrat').value;
  var nbSemContrat = parseFloat(document.getElementById('nbSemContrat').value) || 52;
  var tauxHoraire = parseFloat(document.getElementById('tauxHoraire').value) || 0;
  var majorationHS = document.getElementById('majorationHS').checked;
  var pourcentMajo = majorationHS ? (parseFloat(document.getElementById('pourcentMajo').value) || 0) / 100 : 0;
  var region = document.getElementById('region').value;

  // Day configs
  var joursTravailles = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  var heuresParJour = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  var heuresParSemaine = 0;
  var joursParSemaine = 0;

  for (var dow = 1; dow <= 6; dow++) {
    var cb = document.getElementById('jour-' + dow);
    var input = document.getElementById('heures-' + dow);
    if (cb && cb.checked) {
      joursTravailles[dow] = true;
      var h = parseFloat(input.value) || 0;
      heuresParJour[dow] = h;
      heuresParSemaine += h;
      joursParSemaine++;
    }
  }

  // Indemnites
  var ieContractuelJour = parseFloat(document.getElementById('ieContractuelJour').value) || 0;
  var ieContractuelHeure = parseFloat(document.getElementById('ieContractuelHeure').value) || 0;
  var tarifRepas1 = parseFloat(document.getElementById('tarifRepas1').value) || 0;
  var tarifRepas2 = parseFloat(document.getElementById('tarifRepas2').value) || 0;
  var tarifRepas3 = parseFloat(document.getElementById('tarifRepas3').value) || 0;
  var tarifKm = parseFloat(document.getElementById('tarifKm').value) || 0;

  return {
    typeContrat: typeContrat,
    nbSemContrat: nbSemContrat,
    heuresParSemaine: heuresParSemaine,
    joursParSemaine: joursParSemaine,
    joursTravailles: joursTravailles,
    heuresParJour: heuresParJour,
    tauxHoraire: tauxHoraire,
    majorationHS: majorationHS,
    pourcentMajo: pourcentMajo,
    region: region,
    ieContractuelJour: ieContractuelJour,
    ieContractuelHeure: ieContractuelHeure,
    tarifRepas1: tarifRepas1,
    tarifRepas2: tarifRepas2,
    tarifRepas3: tarifRepas3,
    tarifKm: tarifKm,
  };
}

function fillContratForm(c) {
  if (!c) return;

  document.getElementById('typeContrat').value = c.typeContrat || 'AC';
  document.getElementById('nbSemContrat').value = c.nbSemContrat || 52;
  document.getElementById('tauxHoraire').value = c.tauxHoraire || 3.50;
  document.getElementById('region').value = c.region || 'Autres';
  document.getElementById('majorationHS').checked = !!c.majorationHS;
  document.getElementById('group-pourcentMajo').style.display = c.majorationHS ? '' : 'none';
  document.getElementById('pourcentMajo').value = c.pourcentMajo ? Math.round(c.pourcentMajo * 100) : 10;

  // Day configs
  for (var dow = 1; dow <= 6; dow++) {
    var cb = document.getElementById('jour-' + dow);
    var input = document.getElementById('heures-' + dow);
    if (cb && c.joursTravailles) {
      cb.checked = !!c.joursTravailles[dow];
    }
    if (input && c.heuresParJour) {
      input.value = c.heuresParJour[dow] || 0;
    }
  }

  // Indemnites
  document.getElementById('ieContractuelJour').value = c.ieContractuelJour || 0;
  document.getElementById('ieContractuelHeure').value = c.ieContractuelHeure || 0;
  document.getElementById('tarifRepas1').value = c.tarifRepas1 || 0;
  document.getElementById('tarifRepas2').value = c.tarifRepas2 || 0;
  document.getElementById('tarifRepas3').value = c.tarifRepas3 || 0;
  document.getElementById('tarifKm').value = c.tarifKm || 0;
}

// ============================================================
// Load & Display (main orchestrator)
// ============================================================
function loadAndDisplay() {
  var year = getSelectedYear();
  var month = getSelectedMonth();

  if (!currentContrat) {
    // No contract saved yet -- clear everything
    joursData = [];
    document.getElementById('tbody-presence').innerHTML = '';
    document.getElementById('tfoot-presence').innerHTML = '';
    clearResultats();
    renderFooter(null);
    renderHistory();
    return;
  }

  var parametrage = getParametrage(currentContrat.region, year, month);
  if (!parametrage) {
    showNotification('Pas de parametrage pour cette periode');
    return;
  }

  // Load saved month data or generate fresh
  var saved = loadMois(year, month);
  if (saved) {
    joursData = saved;
  } else {
    joursData = genererJoursMois(year, month, currentContrat);
  }

  renderPresence();
  recalculer();
  renderFooter(parametrage);
  renderHistory();
}

// ============================================================
// Presence table rendering
// ============================================================
function renderPresence() {
  var tbody = document.getElementById('tbody-presence');
  tbody.innerHTML = '';

  if (!currentContrat || joursData.length === 0) return;

  var parametrage = getParametrage(currentContrat.region, getSelectedYear(), getSelectedMonth());
  var ieParams = {
    ieMinConvJour: parametrage ? parametrage.ieMinJour : 2.65,
    ieMinLegalHeure: parametrage ? parametrage.ieMinHeure : 0.425,
    ieContractuelHeure: currentContrat.ieContractuelHeure || 0,
    ieContractuelJour: currentContrat.ieContractuelJour || 0,
  };

  for (var i = 0; i < joursData.length; i++) {
    var j = joursData[i];
    var tr = document.createElement('tr');
    if (!j.estTravaille) tr.classList.add('jour-off');

    // Calculate IE for this day
    var ieJour = calculIEJour(j.heuresRealisees || 0, ieParams);

    // Absent badge
    var isAbsent = j.heuresPrevues > 0 && (j.heuresDeduire || 0) >= j.heuresPrevues;

    tr.innerHTML =
      // Jour
      '<td>' + j.nomJour + ' ' + j.numero + '</td>' +
      // Prevu (auto)
      '<td class="col-auto">' + (j.heuresPrevues || '') + '</td>' +
      // Potentielles (auto)
      '<td class="col-auto">' + (j.heuresPotentielles || '') + '</td>' +
      // Realise (input)
      '<td><input type="number" data-idx="' + i + '" data-field="heuresRealisees" value="' + (j.heuresRealisees || 0) + '" min="0" max="24" step="0.25"></td>' +
      // Deduire (input)
      '<td><input type="number" data-idx="' + i + '" data-field="heuresDeduire" value="' + (j.heuresDeduire || 0) + '" min="0" max="24" step="0.25"></td>' +
      // Absent (auto badge)
      '<td class="col-auto">' + (isAbsent ? '<span class="badge-absent">ABS</span>' : '') + '</td>' +
      // H.Comp (input)
      '<td><input type="number" data-idx="' + i + '" data-field="heuresComp" value="' + (j.heuresComp || 0) + '" min="0" max="24" step="0.25"></td>' +
      // H.Majo (input)
      '<td><input type="number" data-idx="' + i + '" data-field="heuresMajo" value="' + (j.heuresMajo || 0) + '" min="0" max="24" step="0.25"></td>' +
      // IE (auto)
      '<td class="col-auto">' + (ieJour > 0 ? ieJour.toFixed(2) : '') + '</td>' +
      // IR (3 selects)
      '<td class="ir-cell">' +
        buildIRSelect(i, 'irType1', j.irType1 || 0) +
        buildIRSelect(i, 'irType2', j.irType2 || 0) +
        buildIRSelect(i, 'irType3', j.irType3 || 0) +
      '</td>' +
      // IK km (input)
      '<td><input type="number" data-idx="' + i + '" data-field="km" value="' + (j.km || 0) + '" min="0" step="0.1"></td>' +
      // Commentaire (input)
      '<td><input type="text" data-idx="' + i + '" data-field="commentaire" value="' + escapeHtml(j.commentaire || '') + '"></td>';

    tbody.appendChild(tr);
  }

  renderTotals();
}

function buildIRSelect(idx, field, value) {
  var options = '';
  for (var n = 0; n <= 3; n++) {
    options += '<option value="' + n + '"' + (value === n ? ' selected' : '') + '>' + n + '</option>';
  }
  return '<select data-idx="' + idx + '" data-field="' + field + '">' + options + '</select>';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// Presence input handler (event delegation, attached ONCE)
// ============================================================
function initPresenceListener() {
  var tbody = document.getElementById('tbody-presence');
  tbody.addEventListener('input', handlePresenceInput);
  tbody.addEventListener('change', handlePresenceInput);
}

function handlePresenceInput(e) {
  var el = e.target;
  var idx = parseInt(el.getAttribute('data-idx'));
  var field = el.getAttribute('data-field');

  if (isNaN(idx) || !field || !joursData[idx]) return;

  // Update data
  if (field === 'commentaire') {
    joursData[idx][field] = el.value;
  } else if (el.tagName === 'SELECT') {
    joursData[idx][field] = parseInt(el.value) || 0;
  } else {
    joursData[idx][field] = parseFloat(el.value) || 0;
  }

  // Auto-save
  saveMois(getSelectedYear(), getSelectedMonth(), joursData);

  // Recalculate and re-render totals + results
  recalculer();
  renderTotals();

  // Update IE and absent badge for this row (without full re-render)
  updateRowAuto(idx);
}

function updateRowAuto(idx) {
  var j = joursData[idx];
  var tbody = document.getElementById('tbody-presence');
  var row = tbody.children[idx];
  if (!row) return;

  var parametrage = getParametrage(currentContrat.region, getSelectedYear(), getSelectedMonth());
  var ieParams = {
    ieMinConvJour: parametrage ? parametrage.ieMinJour : 2.65,
    ieMinLegalHeure: parametrage ? parametrage.ieMinHeure : 0.425,
    ieContractuelHeure: currentContrat.ieContractuelHeure || 0,
    ieContractuelJour: currentContrat.ieContractuelJour || 0,
  };

  // Update IE cell (col index 8)
  var ieJour = calculIEJour(j.heuresRealisees || 0, ieParams);
  row.cells[8].innerHTML = ieJour > 0 ? ieJour.toFixed(2) : '';
  row.cells[8].className = 'col-auto';

  // Update absent badge (col index 5)
  var isAbsent = j.heuresPrevues > 0 && (j.heuresDeduire || 0) >= j.heuresPrevues;
  row.cells[5].innerHTML = isAbsent ? '<span class="badge-absent">ABS</span>' : '';
  row.cells[5].className = 'col-auto';
}

// ============================================================
// Totals (tfoot)
// ============================================================
function renderTotals() {
  var tfoot = document.getElementById('tfoot-presence');
  if (!currentContrat || joursData.length === 0) {
    tfoot.innerHTML = '';
    return;
  }

  var parametrage = getParametrage(currentContrat.region, getSelectedYear(), getSelectedMonth());
  var ieParams = {
    ieMinConvJour: parametrage ? parametrage.ieMinJour : 2.65,
    ieMinLegalHeure: parametrage ? parametrage.ieMinHeure : 0.425,
    ieContractuelHeure: currentContrat.ieContractuelHeure || 0,
    ieContractuelJour: currentContrat.ieContractuelJour || 0,
  };

  var totPrev = 0, totPot = 0, totReal = 0, totDed = 0, totAbs = 0;
  var totComp = 0, totMajo = 0, totIE = 0, totIR = 0, totIK = 0;

  for (var i = 0; i < joursData.length; i++) {
    var j = joursData[i];
    totPrev += j.heuresPrevues || 0;
    totPot += j.heuresPotentielles || 0;
    totReal += j.heuresRealisees || 0;
    totDed += j.heuresDeduire || 0;
    totComp += j.heuresComp || 0;
    totMajo += j.heuresMajo || 0;
    totIE += calculIEJour(j.heuresRealisees || 0, ieParams);
    totIK += (j.km || 0) * (currentContrat.tarifKm || 0);

    if (j.irType1) totIR += j.irType1 * (currentContrat.tarifRepas1 || 0);
    if (j.irType2) totIR += j.irType2 * (currentContrat.tarifRepas2 || 0);
    if (j.irType3) totIR += j.irType3 * (currentContrat.tarifRepas3 || 0);

    if (j.heuresPrevues > 0 && (j.heuresDeduire || 0) >= j.heuresPrevues) {
      totAbs++;
    }
  }

  tfoot.innerHTML =
    '<tr>' +
    '<td><strong>TOTAL</strong></td>' +
    '<td>' + round2(totPrev) + '</td>' +
    '<td>' + round2(totPot) + '</td>' +
    '<td>' + round2(totReal) + '</td>' +
    '<td>' + round2(totDed) + '</td>' +
    '<td>' + totAbs + '</td>' +
    '<td>' + round2(totComp) + '</td>' +
    '<td>' + round2(totMajo) + '</td>' +
    '<td>' + round2(totIE).toFixed(2) + '</td>' +
    '<td>' + round2(totIR).toFixed(2) + '</td>' +
    '<td>' + round2(totIK).toFixed(2) + '</td>' +
    '<td></td>' +
    '</tr>';
}

// ============================================================
// Recalculate and render results
// ============================================================
function recalculer() {
  if (!currentContrat || joursData.length === 0) {
    clearResultats();
    return;
  }

  var year = getSelectedYear();
  var month = getSelectedMonth();
  var parametrage = getParametrage(currentContrat.region, year, month);
  if (!parametrage) return;

  var resultats = calculMois(joursData, currentContrat, parametrage);
  renderResultats(resultats);
}

function renderResultats(resultats) {
  if (!resultats || !resultats.pajemploi) return;
  var p = resultats.pajemploi;

  document.getElementById('res-heures-normales').textContent = p.heuresNormales + ' h';
  document.getElementById('res-heures-comp').textContent = p.heuresComplementaires + ' h';
  document.getElementById('res-heures-majo').textContent = p.heuresMajorees + ' h';
  document.getElementById('res-jours-activite').textContent = p.joursActivite + ' j';
  document.getElementById('res-salaire-net').textContent = p.salaireNet.toFixed(2) + ' EUR';
  document.getElementById('res-taux-net').textContent = p.tauxHoraireNet.toFixed(2) + ' EUR/h';
  document.getElementById('res-ie').textContent = p.ie.toFixed(2) + ' EUR';
  document.getElementById('res-ir').textContent = p.ir.toFixed(2) + ' EUR';
  document.getElementById('res-ik').textContent = p.ik.toFixed(2) + ' EUR';
}

function clearResultats() {
  var ids = [
    'res-heures-normales', 'res-heures-comp', 'res-heures-majo',
    'res-jours-activite', 'res-salaire-net', 'res-taux-net',
    'res-ie', 'res-ir', 'res-ik'
  ];
  ids.forEach(function (id) {
    document.getElementById(id).textContent = '--';
  });
}

// ============================================================
// Copy button
// ============================================================
function initCopyButton() {
  document.getElementById('btn-copy').addEventListener('click', function () {
    if (!currentContrat || joursData.length === 0) {
      showNotification('Aucune donnee a copier');
      return;
    }

    var year = getSelectedYear();
    var month = getSelectedMonth();
    var parametrage = getParametrage(currentContrat.region, year, month);
    if (!parametrage) return;

    var resultats = calculMois(joursData, currentContrat, parametrage);
    var p = resultats.pajemploi;

    var moisNoms = [
      'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ];

    var lines = [
      'Declaration Pajemploi - ' + moisNoms[month - 1] + ' ' + year,
      '---',
      'Heures normales : ' + p.heuresNormales + ' h',
      'Heures complementaires : ' + p.heuresComplementaires + ' h',
      'Heures majorees : ' + p.heuresMajorees + ' h',
      'Jours d\'activite : ' + p.joursActivite + ' j',
      'Salaire net : ' + p.salaireNet.toFixed(2) + ' EUR',
      'Taux horaire net : ' + p.tauxHoraireNet.toFixed(2) + ' EUR/h',
      'Indemnites entretien : ' + p.ie.toFixed(2) + ' EUR',
      'Indemnites repas : ' + p.ir.toFixed(2) + ' EUR',
      'Indemnites km : ' + p.ik.toFixed(2) + ' EUR',
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(function () {
      showNotification('Valeurs copiees dans le presse-papier');
    }).catch(function () {
      showNotification('Erreur lors de la copie');
    });
  });
}

// ============================================================
// Footer (parametrage info)
// ============================================================
function renderFooter(parametrage) {
  var el = document.getElementById('footer-rates');
  if (!parametrage) {
    el.innerHTML = '<span>Enregistrez un contrat pour voir les taux en vigueur.</span>';
    return;
  }

  el.innerHTML =
    '<span>Taux conversion : ' + parametrage.tauxConversion + '</span>' +
    '<span>IE min/jour : ' + parametrage.ieMinJour.toFixed(2) + ' EUR</span>' +
    '<span>IE min/heure : ' + parametrage.ieMinHeure.toFixed(3) + ' EUR</span>' +
    '<span>SMIC : ' + parametrage.smic.toFixed(2) + ' EUR</span>' +
    '<span>Taux brut min : ' + parametrage.txBrutMin.toFixed(2) + ' EUR</span>';
}

// ============================================================
// History
// ============================================================
function renderHistory() {
  var list = document.getElementById('history-list');
  var moisSauv = listMoisSauvegardes();

  var moisNoms = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];

  list.innerHTML = '';

  if (moisSauv.length === 0) {
    list.innerHTML = '<li style="color:var(--text-light);font-size:0.85rem;">Aucun mois enregistre</li>';
    return;
  }

  moisSauv.forEach(function (m) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = moisNoms[m.month - 1] + ' ' + m.year;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('select-month').value = m.month;
      document.getElementById('select-year').value = m.year;
      loadAndDisplay();
    });
    li.appendChild(a);
    list.appendChild(li);
  });
}

// ============================================================
// Notification
// ============================================================
function showNotification(msg) {
  var div = document.createElement('div');
  div.className = 'notification';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(function () {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 2000);
}
