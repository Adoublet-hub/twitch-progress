
// ==========================================
// 💜 MES STATISTIQUES TWITCH
// ==========================================

const statistiques = [
  { mois: "2026-03", revenus: 1.66, followers: 7,  subs: 1, viewers: 2.7, heures: 37.5 },
  { mois: "2026-04", revenus: 3.48, followers: 10, subs: 2, viewers: 3.6, heures: 39.49 },
  { mois: "2026-05", revenus: 11.44, followers: 7, subs: 6, viewers: 4.6, heures: 28.14 },
  { mois: "2026-06", revenus: 6.66, followers: 15, subs: 4, viewers: 5.6, heures: 42.10 },
  { mois: "2026-07", revenus: 6.82, followers: 10, subs: 4, viewers: 6, heures: 40.43 },
  { mois: "2026-08", revenus: 7.03, followers: 4, subs: 4, viewers: 5.3, heures: 31.51 },
  { mois: "2026-09", revenus: 4.03, followers: 6, subs: 2, viewers: 4, heures: 52.02 },
  { mois: "2026-10", revenus: 8.03, followers: 36, subs: 4, viewers: 7.9, heures: 43.16 }
];

// ==========================================
// 🎯 MES OBJECTIFS
// ==========================================

const objectifs = {
  followers: 1000,
  revenus: 50,
  viewersCourt: 20,
  viewersLong: 75
};

// Total connu à la fin de la dernière période.
// Mets-le à jour lorsque tu ajoutes un nouveau mois.
const followersActuels = 148;

// ==========================================
// 🎨 COULEURS ET FORMATS
// ==========================================

const couleurs = {
  revenus: "#a970ff",
  followers: "#24d9b0",
  subs: "#ffb86b",
  viewers: "#66aaff",
  heures: "#ff6f9f",
  objectif: "#e9c46a",
  objectifLong: "#c59cff"
};

const formatNombre = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2
});

function formatValeur(valeur, unite = "") {
  return `${formatNombre.format(valeur)}${unite ? " " + unite : ""}`;
}

function nomMois(mois) {
  const [annee, numero] = mois.split("-").map(Number);

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(annee, numero - 1, 1)));
}

const labels = statistiques.map(stat => nomMois(stat.mois));

// ==========================================
// 📈 RECONSTITUTION DES FOLLOWERS TOTAUX
// ==========================================
// Hypothèse : pas de pertes de followers.
// On part du total actuel et on remonte le temps.

const followersTotaux = new Array(statistiques.length);

let total = followersActuels;

for (let i = statistiques.length - 1; i >= 0; i--) {
  followersTotaux[i] = total;
  total -= statistiques[i].followers;
}

// ==========================================
// ⚙️ CONFIGURATION COMMUNE DES GRAPHIQUES
// ==========================================

Chart.defaults.font.family = "Inter, sans-serif";
Chart.defaults.color = "#a69bb5";

function creerCourbe(label, valeurs, couleur, options = {}) {
  return {
    label,
    data: valeurs,
    borderColor: couleur,
    backgroundColor: couleur,
    borderWidth: options.objectif ? 2 : 3,
    borderDash: options.objectif ? [8, 6] : [],
    pointRadius: options.objectif ? 0 : 4,
    pointHoverRadius: options.objectif ? 0 : 7,
    pointBackgroundColor: couleur,
    pointBorderColor: "#191421",
    pointBorderWidth: 2,
    tension: options.objectif ? 0 : 0.35,
    fill: false,
    unit: options.unit || ""
  };
}

function ligneObjectif(label, valeur, couleur) {
  return creerCourbe(
    label,
    statistiques.map(() => valeur),
    couleur,
    { objectif: true }
  );
}

function optionsGraphique(maxY = undefined) {
  return {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false
    },

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: "#251b32",
        titleColor: "#ffffff",
        bodyColor: "#e8dff5",
        borderColor: "#49365f",
        borderWidth: 1,
        padding: 14,
        displayColors: true,

        callbacks: {
          label(context) {
            const valeur = context.parsed.y;
            const unite = context.dataset.unit || "";

            return ` ${context.dataset.label} : ${formatValeur(valeur, unite)}`;
          }
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#a69bb5",
          maxRotation: 45,
          autoSkip: true
        },
        border: {
          color: "#382b48"
        }
      },

      y: {
        beginAtZero: true,
        suggestedMax: maxY,
        grid: {
          color: "#30263e"
        },
        ticks: {
          color: "#a69bb5",
          precision: 0
        },
        border: {
          display: false
        }
      }
    }
  };
}

function creerGraphique(id, datasets, maxY) {
  return new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: optionsGraphique(maxY)
  });
}

// ==========================================
// 📊 1. GRAND GRAPHIQUE PRINCIPAL
// ==========================================

const courbesPrincipales = [
  {
    key: "revenus",
    label: "Revenus",
    couleur: couleurs.revenus,
    unit: "€"
  },
  {
    key: "followers",
    label: "Nouveaux followers",
    couleur: couleurs.followers,
    unit: ""
  },
  {
    key: "subs",
    label: "Abonnements",
    couleur: couleurs.subs,
    unit: ""
  },
  {
    key: "viewers",
    label: "Spectateurs moyens",
    couleur: couleurs.viewers,
    unit: ""
  },
  {
    key: "heures",
    label: "Temps de stream",
    couleur: couleurs.heures,
    unit: "h"
  }
];

const datasetsPrincipaux = courbesPrincipales.map(courbe =>
  creerCourbe(
    courbe.label,
    statistiques.map(stat => stat[courbe.key]),
    courbe.couleur,
    { unit: courbe.unit }
  )
);

const graphiquePrincipal = creerGraphique(
  "progressChart",
  datasetsPrincipaux
);

// ==========================================
// 🟣 LÉGENDE INTERACTIVE DU GRAND GRAPHIQUE
// ==========================================

const legend = document.getElementById("legend");

courbesPrincipales.forEach((courbe, index) => {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "legend-button";
  bouton.setAttribute("aria-pressed", "true");

  const point = document.createElement("span");
  point.className = "legend-dot";
  point.style.backgroundColor = courbe.couleur;

  const texte = document.createElement("span");
  texte.textContent = courbe.label;

  bouton.append(point, texte);

  bouton.addEventListener("click", () => {
    const visible = graphiquePrincipal.isDatasetVisible(index);

    graphiquePrincipal.setDatasetVisibility(index, !visible);
    graphiquePrincipal.update();

    bouton.classList.toggle("inactive", visible);
    bouton.setAttribute("aria-pressed", String(!visible));
  });

  legend.appendChild(bouton);
});

// ==========================================
// 💚 2. GRAPHIQUE FOLLOWERS TOTAUX
// ==========================================

creerGraphique("followersChart", [
  creerCourbe(
    "Followers totaux (estimés)",
    followersTotaux,
    couleurs.followers
  ),
  ligneObjectif(
    "Objectif 1 000",
    objectifs.followers,
    couleurs.objectif
  )
], 1050);

// ==========================================
// 💜 3. GRAPHIQUE REVENUS
// ==========================================

creerGraphique("revenusChart", [
  creerCourbe(
    "Revenus",
    statistiques.map(stat => stat.revenus),
    couleurs.revenus,
    { unit: "€" }
  ),
  {
    ...ligneObjectif(
      "Objectif 50 €",
      objectifs.revenus,
      couleurs.objectif
    ),
    unit: "€"
  }
], 55);

// ==========================================
// 💙 4. GRAPHIQUE SPECTATEURS MOYENS
// ==========================================

creerGraphique("viewersChart", [
  creerCourbe(
    "Spectateurs moyens",
    statistiques.map(stat => stat.viewers),
    couleurs.viewers
  ),
  ligneObjectif(
    "Objectif court terme : 20",
    objectifs.viewersCourt,
    couleurs.objectif
  ),
  ligneObjectif(
    "Objectif long terme : 75",
    objectifs.viewersLong,
    couleurs.objectifLong
  )
], 80);

// ==========================================
// 📊 CHIFFRES ET BARRES DE PROGRESSION
// ==========================================

const derniereStat = statistiques[statistiques.length - 1];

document.getElementById("followersValue").textContent =
  formatNombre.format(followersActuels);

document.getElementById("revenusValue").textContent =
  formatValeur(derniereStat.revenus, "€");

document.getElementById("viewersValue").textContent =
  formatNombre.format(derniereStat.viewers);

function mettreAJourBarre(id, valeur, objectif) {
  const pourcentage = Math.min(
    100,
    Math.max(0, (valeur / objectif) * 100)
  );

  document.getElementById(id).style.width =
    `${pourcentage}%`;
}

mettreAJourBarre(
  "followersBar",
  followersActuels,
  objectifs.followers
);

mettreAJourBarre(
  "revenusBar",
  derniereStat.revenus,
  objectifs.revenus
);

// ==========================================
// 📅 PÉRIODE AUTOMATIQUE
// ==========================================

if (statistiques.length > 0) {
  const debut = nomMois(statistiques[0].mois);
  const fin = nomMois(derniereStat.mois);

  document.getElementById("period").textContent =
    `${debut} — ${fin}`;
}
