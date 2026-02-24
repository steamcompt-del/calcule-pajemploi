// js/calculs.js
// Moteur de calcul Pajemploi -- fonctions pures

/**
 * Round to 2 decimal places using standard rounding.
 * @param {number} n
 * @returns {number}
 */
function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate mensualisation (monthly smoothed values).
 *
 * heuresMensu     = heuresParSemaine * nbSemContrat / 12
 * joursMensu      = joursParSemaine  * nbSemContrat / 12
 *
 * If majorationHS and heuresParSemaine > 45:
 *   heuresMajoMensu    = (heuresParSemaine - 45) * nbSemContrat / 12
 *   heuresNormalesMensu = heuresMensu - heuresMajoMensu
 *
 * mensualisationBrute = taux * normales + taux * (1 + %majo) * majorees
 *
 * @param {object} contrat - contract parameters
 * @param {number} contrat.nbSemContrat - number of contract weeks (e.g. 52 for AC)
 * @param {number} contrat.heuresParSemaine - hours per week
 * @param {number} contrat.joursParSemaine - days per week
 * @param {number} contrat.tauxHoraire - gross hourly rate
 * @param {boolean} contrat.majorationHS - whether overtime surcharge is mensualized
 * @param {number} contrat.pourcentMajo - surcharge percentage as decimal (e.g. 0.10)
 * @returns {object} { heuresMensu, joursMensu, heuresMajoMensu, heuresNormalesMensu, mensualisationBrute }
 */
function calculMensualisation(contrat) {
  var nbSemContrat = contrat.nbSemContrat;
  var heuresParSemaine = contrat.heuresParSemaineContrat > 0
    ? contrat.heuresParSemaineContrat
    : contrat.heuresParSemaine;
  var joursParSemaine = contrat.joursParSemaine;
  var tauxHoraire = contrat.tauxHoraire;
  var majorationHS = contrat.majorationHS;
  var pourcentMajo = contrat.pourcentMajo;

  var heuresMensu = heuresParSemaine * nbSemContrat / 12;
  var joursMensu = joursParSemaine * nbSemContrat / 12;

  var heuresMajoMensu = 0;
  var heuresNormalesMensu = heuresMensu;

  if (majorationHS && heuresParSemaine > 45) {
    heuresMajoMensu = (heuresParSemaine - 45) * nbSemContrat / 12;
    heuresNormalesMensu = heuresMensu - heuresMajoMensu;
  }

  var mensualisationBrute;
  if (majorationHS && heuresParSemaine > 45) {
    mensualisationBrute =
      tauxHoraire * heuresNormalesMensu +
      tauxHoraire * (1 + pourcentMajo) * heuresMajoMensu;
  } else {
    mensualisationBrute = tauxHoraire * heuresMensu;
  }

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
 *
 * deduction = mensualisationBrute * heuresDeduites / heuresPotentielles
 *
 * @param {number} mensualisationBrute - monthly gross salary (mensualized)
 * @param {number} heuresDeduites - total hours to deduct this month
 * @param {number} heuresPotentielles - total potential hours this month (contract hours for working days)
 * @returns {number} deduction amount (positive), rounded to 2 decimals
 */
function calculDeduction(mensualisationBrute, heuresDeduites, heuresPotentielles) {
  if (heuresPotentielles === 0 || heuresDeduites === 0) return 0;
  return round2(mensualisationBrute * heuresDeduites / heuresPotentielles);
}

/**
 * Calculate daily IE (indemnite d'entretien) for one worked day.
 *
 * IE = MAX(
 *   ieMinConvJour,                      // minimum conventionnel par jour (2.65)
 *   heuresReelles * ieMinLegalHeure,     // minimum legal horaire
 *   heuresReelles * ieContractuelHeure,  // contractuel horaire (si defini)
 *   ieContractuelJour                    // contractuel journalier (si defini)
 * )
 * Arrondi au centime superieur (ceil).
 *
 * @param {number} heuresReelles - actual hours worked that day
 * @param {object} params
 * @param {number} params.ieMinConvJour - conventional daily minimum IE
 * @param {number} params.ieMinLegalHeure - legal hourly minimum IE
 * @param {number} params.ieContractuelHeure - contractual hourly IE (0 if not defined)
 * @param {number} params.ieContractuelJour - contractual daily IE (0 if not defined)
 * @returns {number} IE for the day (rounded up to cent)
 */
function calculIEJour(heuresReelles, params) {
  if (heuresReelles <= 0) return 0;

  var ieMinConvJour = params.ieMinConvJour;
  var ieMinLegalHeure = params.ieMinLegalHeure;
  var ieContractuelHeure = params.ieContractuelHeure || 0;
  var ieContractuelJour = params.ieContractuelJour || 0;

  var ie = Math.max(
    ieMinConvJour,
    heuresReelles * ieMinLegalHeure,
    heuresReelles * ieContractuelHeure,
    ieContractuelJour
  );

  // Round up to cent (centime superieur)
  return Math.ceil(ie * 100) / 100;
}

/**
 * Calculate all monthly totals from daily attendance data.
 *
 * Aggregates daily values, computes deduction, complementary/overtime pay,
 * net salary, and produces the Pajemploi declaration values.
 *
 * @param {Array} jours - array of daily data objects (one per calendar day)
 * @param {object} contrat - contract parameters
 * @param {object} parametrage - current month parametrage row from getParametrage()
 * @returns {object} monthly totals and Pajemploi declaration values
 */
function calculMois(jours, contrat, parametrage) {
  var mensu = calculMensualisation(contrat);

  // Build IE params from parametrage + contrat
  var ieParams = {
    ieMinConvJour: parametrage.ieMinJour,
    ieMinLegalHeure: parametrage.ieMinHeure,
    ieContractuelHeure: contrat.ieContractuelHeure || 0,
    ieContractuelJour: contrat.ieContractuelJour || 0,
  };

  // Sum daily values
  var totalHeuresPrevues = 0;
  var totalHeuresPotentielles = 0;
  var totalHeuresRealisees = 0;
  var totalHeuresDeduire = 0;
  var totalJoursAbsence = 0;
  var totalHeuresComp = 0;
  var totalHeuresMajo = 0;
  var totalIE = 0;
  var totalIR = 0;
  var totalIK = 0;
  var joursEnPlus = 0;

  jours.forEach(function(j) {
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

    // Absence detection: absent if all contract hours are deducted
    if (j.heuresPrevues > 0 && j.heuresDeduire >= j.heuresPrevues) {
      totalJoursAbsence++;
    }
  });

  // Deduction (Cour de Cassation method)
  var deduction = calculDeduction(
    mensu.mensualisationBrute,
    totalHeuresDeduire,
    totalHeuresPotentielles
  );

  // Salary base after deduction
  var salaireBase = round2(mensu.mensualisationBrute - deduction);

  // Complementary hours pay (at base rate)
  var payComp = round2(totalHeuresComp * contrat.tauxHoraire);

  // Majorated hours pay (non-mensualized, at surcharged rate)
  var payMajo = round2(
    totalHeuresMajo * contrat.tauxHoraire * (1 + (contrat.pourcentMajo || 0))
  );

  // Total gross salary
  var totalBrut = round2(salaireBase + payComp + payMajo);

  // Net salary via conversion rate
  var tauxConversion = parametrage.tauxConversion;
  var salaireNet = round2(totalBrut * tauxConversion);
  var tauxHoraireNet = round2(contrat.tauxHoraire * tauxConversion);

  // Pajemploi declaration: normal hours adjusted for deduction
  var heuresNormalesBase = (contrat.majorationHS && contrat.heuresParSemaine > 45)
    ? mensu.heuresNormalesMensu
    : mensu.heuresMensu;

  var heuresNormalesPajemploi = round2(
    heuresNormalesBase + (deduction > 0 ? -(deduction / contrat.tauxHoraire) : 0)
  );

  var joursActivite = Math.round(mensu.joursMensu - totalJoursAbsence + joursEnPlus);

  return {
    // Mensualisation values
    heuresMensu: mensu.heuresMensu,
    joursMensu: mensu.joursMensu,
    heuresMajoMensu: mensu.heuresMajoMensu,
    heuresNormalesMensu: mensu.heuresNormalesMensu,
    mensualisationBrute: mensu.mensualisationBrute,

    // Monthly totals
    totalHeuresPrevues: round2(totalHeuresPrevues),
    totalHeuresPotentielles: round2(totalHeuresPotentielles),
    totalHeuresRealisees: round2(totalHeuresRealisees),
    totalHeuresDeduire: round2(totalHeuresDeduire),
    totalJoursAbsence: totalJoursAbsence,
    totalHeuresComp: round2(totalHeuresComp),
    totalHeuresMajo: round2(totalHeuresMajo),
    totalIE: round2(totalIE),
    totalIR: round2(totalIR),
    totalIK: round2(totalIK),

    // Salary breakdown
    deduction: deduction,
    salaireBase: salaireBase,
    payComp: payComp,
    payMajo: payMajo,
    totalBrut: totalBrut,
    salaireNet: salaireNet,
    tauxHoraireNet: tauxHoraireNet,
    tauxConversion: tauxConversion,

    // Pajemploi declaration values
    pajemploi: {
      heuresNormales: Math.round(heuresNormalesPajemploi),
      heuresComplementaires: Math.round(totalHeuresComp),
      heuresMajorees: Math.round(totalHeuresMajo + mensu.heuresMajoMensu),
      joursActivite: joursActivite,
      salaireNet: salaireNet,
      tauxHoraireNet: tauxHoraireNet,
      ie: round2(totalIE),
      ir: round2(totalIR),
      ik: round2(totalIK),
    },
  };
}

/**
 * Generate the list of days for a given month with pre-filled contract hours.
 *
 * Each day object indicates whether it is a working day per the contract,
 * and pre-fills heuresPrevues / heuresPotentielles accordingly.
 *
 * @param {number} year
 * @param {number} month - 1-12
 * @param {object} contrat - contract parameters with joursTravailles and heuresParJour
 * @returns {Array} array of day objects
 */
function genererJoursMois(year, month, contrat) {
  var nbJours = new Date(year, month, 0).getDate();
  var joursSemaine = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  var jours = [];

  for (var d = 1; d <= nbJours; d++) {
    var date = new Date(year, month - 1, d);
    var jourSemaine = date.getDay(); // 0=Dim, 1=Lun, ..., 6=Sam
    var nomJour = joursSemaine[jourSemaine];

    // Check if this day-of-week is worked per contract
    var estTravaille = contrat.joursTravailles
      ? (contrat.joursTravailles[jourSemaine] || false)
      : false;

    // Pre-fill hours from contract day config
    var heuresPrevues = 0;
    if (estTravaille && contrat.heuresParJour) {
      heuresPrevues = contrat.heuresParJour[jourSemaine] || 0;
    }

    jours.push({
      numero: d,
      nomJour: nomJour,
      jourSemaine: jourSemaine,
      estTravaille: estTravaille,
      heuresPrevues: heuresPrevues,
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

/**
 * Calcule le report d'heures de la dernière semaine partielle d'un mois.
 *
 * Parcourt les jours depuis la fin du mois, remonte jusqu'au dernier lundi
 * et additionne les heuresRealisees.
 * Si le mois se termine un dimanche, la semaine est complète → report = 0.
 *
 * @param {Array} jours - tableau de jours du mois (issu de genererJoursMois / loadMois)
 * @returns {number} total heuresRealisees de la dernière semaine partielle
 */
function calculReportSemaineFin(jours) {
  if (!jours || jours.length === 0) return 0;

  var lastDay = jours[jours.length - 1];
  // Dimanche (jourSemaine === 0) → semaine complète, pas de report
  if (lastDay.jourSemaine === 0) return 0;

  var report = 0;
  for (var i = jours.length - 1; i >= 0; i--) {
    report += jours[i].heuresRealisees || 0;
    // Si on atteint un lundi (jourSemaine === 1), on a la semaine complète depuis lundi
    if (jours[i].jourSemaine === 1) break;
  }

  return round2(report);
}

/**
 * Regroupe les jours d'un mois en semaines (lundi → dimanche).
 * La première semaine peut être partielle (commence après lundi).
 * La dernière semaine peut être partielle (se termine avant dimanche).
 *
 * @param {Array} jours - tableau de jours du mois
 * @returns {Array} tableau de semaines, chaque élément = { startIdx, endIdx, jours: [...] }
 */
function grouperParSemaine(jours) {
  if (!jours || jours.length === 0) return [];

  var semaines = [];
  var currentWeek = { startIdx: 0, jours: [] };

  for (var i = 0; i < jours.length; i++) {
    // Nouvelle semaine si c'est lundi ET pas le premier jour
    if (jours[i].jourSemaine === 1 && i > 0) {
      currentWeek.endIdx = i - 1;
      semaines.push(currentWeek);
      currentWeek = { startIdx: i, jours: [] };
    }
    currentWeek.jours.push(jours[i]);
  }

  // Dernière semaine
  currentWeek.endIdx = jours.length - 1;
  semaines.push(currentWeek);

  return semaines;
}
