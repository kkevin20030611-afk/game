export let GAME = {
    username: null,
    money: 0.0,
    clickValue: 0.001,
    lps: 0.0,
    oil: 100.0,
    xp: { points: 0, level: 1 },
    inventory: {
        buildings: {}, // id: darabszám
        upgrades: []   // megszerzett upgrade id-k listája
    },
    oilUpgrades: {
        canLevel: 0, // Olajos kanna szint (0 = alap)
        tankCapacityLevel: 0, // Tank kapacitás szint (0-5)
        hasAutoRefill: false, // Automata tankolás bekapcsolva
        recyclingLevel: 0 // Újrahasznosítás szint (0-5)
    },
    temperatureLevel: 0, // Hőmérséklet szint (0-8, 0 = nincs fejlesztés)
    whipLevel: 0, // Ostor szint (0-3, 0 = nincs fejlesztés)
    critLevel: 0, // Kritikus ütés szint (0-10, 0 = nincs fejlesztés)
    recipeBookLevel: 0, // Receptkönyv szint (0-3, 0 = nincs fejlesztés)
    chefTimer: 0, // Segéd elvesztésének időzítője (0.1 másodpercenként növekszik)
    stats: {
        totalClicks: 0,
        manualClicksSinceXP: 0,
        moneySpentSinceXP: 0
    }
};