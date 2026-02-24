// js/app.js
// Application principale -- orchestration UI, evenements, rendu

var joursData = [];
var currentContrat = null;
var reportHeuresSemPrecedente = 0;

// ============================================================
// Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  initSelectors();
  initTabs();
  initContratForm();
  initPresenceListener();
  initReportListener();
  initCopyButton();
  initBackupButtons();

  // Load saved contract
  var saved = loadContrat();
  if (saved) {
    fillContratForm(saved);
    currentContrat = readContratForm();
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
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
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
    showNotification('Contrat enregistré');
    loadAndDisplay();
  });
}

function readContratForm() {
  var typeContrat = document.getElementById('typeContrat').value;
  var nbSemContrat = parseFloat(document.getElementById('nbSemContrat').value) || 52;
  var tauxHoraire = parseFloat(document.getElementById('tauxHoraire').value) || 0;
  var majorationHS = document.getElementById('majorationHS').checked;
  var pourcentMajo = (parseFloat(document.getElementById('pourcentMajo').value) || 0) / 100;
  var region = document.getElementById('region').value;
  var heuresParSemaineContrat = parseFloat(document.getElementById('heuresParSemaineContrat').value) || 0;

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
    heuresParSemaineContrat: heuresParSemaineContrat,
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
  document.getElementById('heuresParSemaineContrat').value = c.heuresParSemaineContrat || 0;

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
// Report heures semaine précédente
// ============================================================
function initReportListener() {
  var input = document.getElementById('report-heures');
  input.addEventListener('input', function () {
    reportHeuresSemPrecedente = parseFloat(this.value) || 0;
    renderPresence();
    recalculer();
  });
}

function autoRemplirReport(year, month) {
  var prevMonth = month - 1;
  var prevYear = year;
  if (prevMonth < 1) { prevMonth = 12; prevYear--; }

  var prevData = loadMois(prevYear, prevMonth);
  var report = prevData ? calculReportSemaineFin(prevData) : 0;

  reportHeuresSemPrecedente = report;
  document.getElementById('report-heures').value = report;

  var info = document.getElementById('report-info');
  if (report > 0) {
    var moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    info.textContent = '(auto depuis ' + moisNoms[prevMonth - 1] + ' ' + prevYear + ')';
  } else if (!prevData) {
    info.textContent = '(aucune donnée mois précédent)';
  } else {
    info.textContent = '';
  }
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
    showNotification('Pas de paramétrage pour cette période');
    return;
  }

  // Auto-remplir le report de la semaine précédente
  autoRemplirReport(year, month);

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

  // Regrouper par semaine pour afficher séparateurs
  var semaines = grouperParSemaine(joursData);

  for (var s = 0; s < semaines.length; s++) {
    var semaine = semaines[s];

    // Calculer le total heures réalisées de cette semaine
    var totalSemaine = 0;
    for (var k = 0; k < semaine.jours.length; k++) {
      totalSemaine += semaine.jours[k].heuresRealisees || 0;
    }
    // Pour la première semaine, ajouter le report
    var totalAvecReport = totalSemaine;
    if (s === 0) {
      totalAvecReport += reportHeuresSemPrecedente;
    }

    // Insérer un séparateur AVANT chaque semaine (sauf la première)
    if (s > 0) {
      var sepRow = document.createElement('tr');
      sepRow.className = 'semaine-separator';
      sepRow.innerHTML = '<td colspan="12"></td>';
      tbody.appendChild(sepRow);
    }

    // Rendre les jours de la semaine
    for (var k = 0; k < semaine.jours.length; k++) {
      var globalIdx = semaine.startIdx + k;
      var j = semaine.jours[k];
      var tr = document.createElement('tr');
      if (!j.estTravaille) tr.classList.add('jour-off');

      // Calculate IE for this day
      var ieJour = calculIEJour(j.heuresRealisees || 0, ieParams);

      // Absent badge
      var isAbsent = j.heuresPrevues > 0 && (j.heuresDeduire || 0) >= j.heuresPrevues;

      tr.innerHTML =
        '<td>' + j.nomJour + ' ' + j.numero + '</td>' +
        '<td class="col-auto">' + (j.heuresPrevues || '') + '</td>' +
        '<td class="col-auto">' + (j.heuresPotentielles || '') + '</td>' +
        '<td><input type="number" data-idx="' + globalIdx + '" data-field="heuresRealisees" value="' + (j.heuresRealisees || 0) + '" min="0" max="24" step="0.25"></td>' +
        '<td><input type="number" data-idx="' + globalIdx + '" data-field="heuresDeduire" value="' + (j.heuresDeduire || 0) + '" min="0" max="24" step="0.25"></td>' +
        '<td class="col-auto">' + (isAbsent ? '<span class="badge-absent">ABS</span>' : '') + '</td>' +
        '<td><input type="number" data-idx="' + globalIdx + '" data-field="heuresComp" value="' + (j.heuresComp || 0) + '" min="0" max="24" step="0.25"></td>' +
        '<td><input type="number" data-idx="' + globalIdx + '" data-field="heuresMajo" value="' + (j.heuresMajo || 0) + '" min="0" max="24" step="0.25"></td>' +
        '<td class="col-auto">' + (ieJour > 0 ? ieJour.toFixed(2) : '') + '</td>' +
        '<td class="ir-cell">' +
          buildIRSelect(globalIdx, 'irType1', j.irType1 || 0) +
          buildIRSelect(globalIdx, 'irType2', j.irType2 || 0) +
          buildIRSelect(globalIdx, 'irType3', j.irType3 || 0) +
        '</td>' +
        '<td><input type="number" data-idx="' + globalIdx + '" data-field="km" value="' + (j.km || 0) + '" min="0" step="0.1"></td>' +
        '<td><input type="text" data-idx="' + globalIdx + '" data-field="commentaire" value="' + escapeHtml(j.commentaire || '') + '"></td>';

      tbody.appendChild(tr);
    }

    // Ligne résumé de la semaine après les jours
    var summaryRow = document.createElement('tr');
    var isOver45 = totalAvecReport > 45;
    summaryRow.className = 'semaine-summary' + (isOver45 ? ' semaine-over45' : '');

    var label = 'Sem. ' + (s + 1) + ' : ' + round2(totalAvecReport) + ' h';
    if (s === 0 && reportHeuresSemPrecedente > 0) {
      label += ' (dont ' + reportHeuresSemPrecedente + ' h report)';
    }
    if (isOver45) {
      label += ' ⚠ >' + '45h → ' + round2(totalAvecReport - 45) + ' h majorées';
    }

    // Vérifier si c'est la dernière semaine et si elle est partielle (report pour mois suivant)
    var lastDayOfWeek = semaine.jours[semaine.jours.length - 1];
    if (s === semaines.length - 1 && lastDayOfWeek.jourSemaine !== 0) {
      label += ' (semaine partielle → report mois suivant)';
    }

    summaryRow.innerHTML = '<td colspan="12">' + label + '</td>';
    tbody.appendChild(summaryRow);
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
  document.getElementById('res-salaire-net').textContent = p.salaireNet.toFixed(2) + ' €';
  document.getElementById('res-taux-net').textContent = p.tauxHoraireNet.toFixed(2) + ' €/h';
  document.getElementById('res-ie').textContent = p.ie.toFixed(2) + ' €';
  document.getElementById('res-ir').textContent = p.ir.toFixed(2) + ' €';
  document.getElementById('res-ik').textContent = p.ik.toFixed(2) + ' €';
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
      showNotification('Aucune donnée à copier');
      return;
    }

    var year = getSelectedYear();
    var month = getSelectedMonth();
    var parametrage = getParametrage(currentContrat.region, year, month);
    if (!parametrage) return;

    var resultats = calculMois(joursData, currentContrat, parametrage);
    var p = resultats.pajemploi;

    var moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    var lines = [
      'Déclaration Pajemploi - ' + moisNoms[month - 1] + ' ' + year,
      '---',
      'Heures normales : ' + p.heuresNormales + ' h',
      'Heures complémentaires : ' + p.heuresComplementaires + ' h',
      'Heures majorées : ' + p.heuresMajorees + ' h',
      'Jours d\'activité : ' + p.joursActivite + ' j',
      'Salaire net : ' + p.salaireNet.toFixed(2) + ' €',
      'Taux horaire net : ' + p.tauxHoraireNet.toFixed(2) + ' €/h',
      'Indemnités entretien : ' + p.ie.toFixed(2) + ' €',
      'Indemnités repas : ' + p.ir.toFixed(2) + ' €',
      'Indemnités km : ' + p.ik.toFixed(2) + ' €',
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(function () {
      showNotification('Valeurs copiées dans le presse-papier');
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
    '<span>IE min/jour : ' + parametrage.ieMinJour.toFixed(2) + ' €</span>' +
    '<span>IE min/heure : ' + parametrage.ieMinHeure.toFixed(3) + ' €</span>' +
    '<span>SMIC : ' + parametrage.smic.toFixed(2) + ' €</span>' +
    '<span>Taux brut min : ' + parametrage.txBrutMin.toFixed(2) + ' €</span>';
}

// ============================================================
// History
// ============================================================
function renderHistory() {
  var list = document.getElementById('history-list');
  var moisSauv = listMoisSauvegardes();

  var moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  list.innerHTML = '';

  if (moisSauv.length === 0) {
    list.innerHTML = '<li style="color:var(--text-light);font-size:0.85rem;">Aucun mois enregistré</li>';
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

// ============================================================
// Backup : Export / Import
// ============================================================
function initBackupButtons() {
  // Export
  document.getElementById('btn-export').addEventListener('click', function () {
    var data = exporterDonnees();
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var today = new Date().toISOString().slice(0, 10);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pajemploi-backup-' + today + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Données exportées');
  });

  // Import : ouvrir le sélecteur de fichier
  document.getElementById('btn-import-trigger').addEventListener('click', function () {
    document.getElementById('btn-import-file').click();
  });

  // Import : traiter le fichier sélectionné
  document.getElementById('btn-import-file').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var data = JSON.parse(evt.target.result);
        var nbMois = data.mois ? Object.keys(data.mois).length : 0;
        var msg = 'Importer ' + (data.contrat ? '1 contrat' : '0 contrat') + ' et ' + nbMois + ' mois ?\nCela écrasera les données existantes.';

        if (!confirm(msg)) {
          showNotification('Import annulé');
          return;
        }

        var result = importerDonnees(data);

        // Recharger l'interface
        if (result.contrat) {
          currentContrat = loadContrat();
          fillContratForm(currentContrat);
        }
        loadAndDisplay();

        showNotification('Import réussi : ' + (result.contrat ? 'contrat + ' : '') + result.moisCount + ' mois');
      } catch (err) {
        showNotification('Erreur : ' + err.message);
      }
    };
    reader.readAsText(file);

    // Reset pour permettre de réimporter le même fichier
    this.value = '';
  });
}
