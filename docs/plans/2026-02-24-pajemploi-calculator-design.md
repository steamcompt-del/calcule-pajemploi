# Design : Calculateur Pajemploi

**Date** : 2026-02-24
**Statut** : Validé

## Objectif

Site web personnel pour simplifier les déclarations Pajemploi mensuelles d'une assistante maternelle. Remplace un fichier Excel complexe par une interface claire avec calcul en temps réel.

## Périmètre

- Feuille de présence mensuelle (saisie jour par jour)
- Calcul automatique des valeurs à déclarer sur Pajemploi
- Sauvegarde locale des données (contrat + mois)
- Support des contrats AC (52 semaines) et AI (46 semaines ou moins)
- Support des heures majorées (>45h/semaine)

**Hors périmètre** : bulletin de salaire complet, récapitulatif annuel, calcul CP, régularisation, fin de contrat.

## Architecture

### Tech stack

- HTML / CSS / JavaScript pur (pas de framework)
- Hébergement statique (GitHub Pages, Netlify, ou local)
- Stockage : localStorage du navigateur

### Layout : Hybride tableau + panneau latéral

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER : "Calcul Pajemploi"     [Mois ▼] [Année ▼]               │
├─────────────────────────────────────┬───────────────────────────────┤
│  ZONE CENTRALE                      │  PANNEAU LATÉRAL FIXE         │
│                                     │                               │
│  [Contrat] [Présence] ← onglets    │  Déclaration Pajemploi        │
│                                     │  (résultats temps réel)       │
│  Contenu de l'onglet actif          │                               │
│                                     │  [Copier les valeurs]         │
│                                     │  [Historique des mois ▼]      │
├─────────────────────────────────────┴───────────────────────────────┤
│  FOOTER : Taux applicables au mois sélectionné                     │
└─────────────────────────────────────────────────────────────────────┘
```

Le panneau latéral met à jour les résultats en temps réel pendant la saisie.

## Onglet Contrat

Paramètres saisis une fois et sauvegardés :

| Champ | Type | Exemple |
|-------|------|---------|
| Type de contrat | AC / AI | AC |
| Nb de semaines de contrat | nombre | 52 |
| Heures par semaine | nombre | 40 |
| Jours par semaine | nombre | 5 |
| Jours travaillés | checkboxes Lu-Ve | Lu, Ma, Je, Ve |
| Heures par jour | nombre par jour | 8, 8, 8, 8 |
| Majoration HS mensualisée | Oui/Non | Oui |
| % de majoration | nombre | 10% |
| Taux horaire brut | nombre | 4.50 |
| IE contractuelle (par jour ou heure) | nombre | 3.80/j |
| Tarifs repas (3 types) | nombres | 4.00, 5.00, 7.00 |
| Tarif km | nombre | 0.35 |
| Région | Autres / Alsace-Moselle | Autres |

## Onglet Feuille de présence

Tableau mensuel avec une ligne par jour :

| Colonne | Saisie | Auto-calculé |
|---------|--------|--------------|
| Jour (Lu 1, Ma 2...) | - | oui |
| Heures prévues au contrat | - | pré-rempli depuis contrat |
| Heures potentielles | - | pré-rempli |
| Heures réalisées | saisie | - |
| Heures à déduire | saisie | suggestion auto |
| Absent (Oui/Non) | - | auto si déduire = prévu |
| Heures complémentaires | saisie | - |
| Heures majorées | saisie | - |
| IE | - | auto-calculé |
| IR (type 1/2/3) | saisie (1, 2 ou 3) | - |
| IK (km) | saisie | - |
| Commentaire | saisie | - |

- Jours non travaillés (weekends, jours hors planning) grisés
- Ligne de totaux en bas
- Saisie intelligente : détection auto des absences et heures supplémentaires

## Panneau latéral : Déclaration Pajemploi

Valeurs affichées en temps réel :

- Heures normales
- Heures complémentaires
- Heures majorées
- Jours d'activité
- Nombre de CP
- Salaire net
- Taux horaire net
- IE (total)
- IR (total)
- IK (total)
- Indemnité de rupture (si applicable)
- ICCP (si applicable)

Bouton **"Copier les valeurs"** : copie formatée dans le presse-papier.

## Moteur de calcul

### Mensualisation

```
heures_mensu = (h_semaine / nb_sem_contrat) * 52 / 12
jours_mensu  = (j_semaine / nb_sem_contrat) * 52 / 12

Si majoration >45h :
  h_majo_mensu    = (h_semaine - 45) / nb_sem * 52 / 12
  h_normales_mensu = h_mensu - h_majo_mensu

mensualisation_brute = taux * h_normales + taux * (1 + %majo) * h_majo
```

### Déduction d'absence (Cour de Cassation)

```
déduction = mensualisation_brute * heures_déduites / heures_potentielles
```

### Indemnité d'entretien (par jour travaillé)

```
IE_jour = MAX(
  IE_min_conventionnel_jour,
  heures_réelles * IE_min_légal_heure,
  heures_réelles * IE_contractuel_heure,
  IE_contractuel_jour
)
Arrondi au centime supérieur.
```

### Conversion brut/net

```
taux_conversion = lookup(région, date_mois) depuis table de paramètrage
salaire_net     = total_brut * taux_conversion
taux_horaire_net = taux_horaire_brut * taux_conversion
```

### Calcul Pajemploi

```
heures_normales = h_mensu_normales + ajustement_déduction
h_complémentaires = somme(AC55)
h_majorées = somme(heures_majo_prévues + non_prévues)
jours_activité = jours_mensu - jours_absence + jours_en_plus
salaire_net = total_brut * taux_conversion
```

## Paramètrage intégré

Table de référence intégrée en JavaScript couvrant 2019-2026 :

- 2 régions : "Autres" et "Alsace-Moselle"
- Par période : taux de conversion brut/net, IE minimums (jour + heure), plafond CAF, SMIC, taux horaire brut minimum
- Mise à jour manuelle quand les taux changent (environ 1-2 fois/an)

## Stockage localStorage

```
pajemploi_contrat   → objet JSON des paramètres du contrat
pajemploi_YYYY_MM   → objet JSON des données du mois (heures jour par jour)
pajemploi_params    → table de paramètrage (optionnel, sinon en dur dans le code)
```

## Responsive

- Desktop : layout hybride (tableau + panneau latéral)
- Mobile : panneau latéral passe en dessous du tableau, ou accessible via bouton flottant "Voir résultats"
