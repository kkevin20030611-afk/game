export const CONFIG = {
    buildings: [
        { id: 'apprentice', name: 'Inas', baseCost: 1.5, lps: 0.001, oil: 0.05 },
        { id: 'baker', name: 'Pék', baseCost: 10, lps: 0.002, oil: 0.08 },
        { id: 'master_baker', name: 'Mester Pék', baseCost: 50, lps: 0.015, oil: 0.15 },
        { id: 'gordon_ramsay', name: 'Gordon Ramsay', baseCost: 350, lps: 0.032, oil: 0.45, levelRequired: 6 },
        { id: 'chef', name: 'Séf', baseCost: 1400, lps: 0.08, oil: 3.5, levelRequired: 10 }
    ],
    upgrades: [
        //{ id: 'plastic_fork', name: 'Műanyag Villa', cost: 500, clickBonus: 0.005 },
        //{ id: 'garlic_brush', name: 'Fokhagymás Ecset', cost: 10000, clickBonus: 0.020 },
        //{ id: 'spicy_steve', name: 'Erős Pista', cost: 2500000, clickBonus: 1.000 }
    ],
    temperatureUpgrades: [
        { level: 1, temperature: 20, cost: 10, clickBonus: 0.001, name: 'Hőmérséklet I' },
        { level: 2, temperature: 25, cost: 25, clickBonus: 0.003, name: 'Hőmérséklet II' },
        { level: 3, temperature: 30, cost: 60, clickBonus: 0.005, name: 'Hőmérséklet III' },
        { level: 4, temperature: 40, cost: 150, clickBonus: 0.008, name: 'Hőmérséklet IV' },
        { level: 5, temperature: 50, cost: 400, clickBonus: 0.012, name: 'Hőmérséklet V' },
        { level: 6, temperature: 60, cost: 1000, clickBonus: 0.028, name: 'Hőmérséklet VI' },
        { level: 7, temperature: 80, cost: 2500, clickBonus: 0.055, name: 'Hőmérséklet VII' },
        { level: 8, temperature: 100, cost: 4500, clickBonus: 0.15, name: 'Hőmérséklet VIII' }
    ],
    whipUpgrades: [
        { level: 1, cost: 100, lpsMultiplier: 1.01, name: 'Ostor I', levelRequired: 5 },
        { level: 2, cost: 250, lpsMultiplier: 1.03, name: 'Ostor II', levelRequired: 5 },
        { level: 3, cost: 500, lpsMultiplier: 1.05, name: 'Ostor III', levelRequired: 5 }
    ],
    critUpgrades: [
        { level: 1, cost: 200, critChance: 0.01, name: 'Krit I', levelRequired: 15 },
        { level: 2, cost: 400, critChance: 0.02, name: 'Krit II', levelRequired: 15 },
        { level: 3, cost: 800, critChance: 0.03, name: 'Krit III', levelRequired: 15 },
        { level: 4, cost: 1600, critChance: 0.04, name: 'Krit IV', levelRequired: 15 },
        { level: 5, cost: 3200, critChance: 0.05, name: 'Krit V', levelRequired: 15 },
        { level: 6, cost: 6400, critChance: 0.06, name: 'Krit VI', levelRequired: 15 },
        { level: 7, cost: 12800, critChance: 0.07, name: 'Krit VII', levelRequired: 15 },
        { level: 8, cost: 25600, critChance: 0.08, name: 'Krit VIII', levelRequired: 15 },
        { level: 9, cost: 51200, critChance: 0.09, name: 'Krit IX', levelRequired: 15 },
        { level: 10, cost: 102400, critChance: 0.10, name: 'Krit X', levelRequired: 15 }
    ],
    recipeBookUpgrades: [
        { level: 1, cost: 250, lpcMultiplier: 1.01, name: 'Recepteskönyv I', levelRequired: 6 },
        { level: 2, cost: 500, lpcMultiplier: 1.03, name: 'Recepteskönyv II', levelRequired: 6 },
        { level: 3, cost: 1000, lpcMultiplier: 1.05, name: 'Recepteskönyv III', levelRequired: 6 }
    ],
    oilUpgrades: {
        tankCapacity: [
            { level: 1, cost: 8, capacity: 150, name: 'Tartály Bővítés I' },
            { level: 2, cost: 15, capacity: 220, name: 'Tartály Bővítés II' },
            { level: 3, cost: 30, capacity: 300, name: 'Tartály Bővítés III' },
            { level: 4, cost: 55, capacity: 500, name: 'Tartály Bővítés IV' },
            { level: 5, cost: 100, capacity: 750, name: 'Tartály Bővítés V' }
        ],
        recycling: [
            { level: 1, cost: 650, chance: 0.01, name: 'Újrahasznosítás I', levelRequired: 10 },
            { level: 2, cost: 1500, chance: 0.03, name: 'Újrahasznosítás II', levelRequired: 10 },
            { level: 3, cost: 3000, chance: 0.05, name: 'Újrahasznosítás III', levelRequired: 10 },
            { level: 4, cost: 6000, chance: 0.07, name: 'Újrahasznosítás IV', levelRequired: 10 },
            { level: 5, cost: 12000, chance: 0.10, name: 'Újrahasznosítás V', levelRequired: 10 }
        ],
        autoRefill: { cost: 10000, name: 'Automatikus Újratöltés', levelRequired: 30 }
    },
    /*
    *baseOilCost - az olajos kanna alap ára
    *baseOilCapacity - az olajos kanna alap kapacitása
    *taxRate - az adó mértéke
    *inflationRate - az infláció mértéke
    *navChance - a NAV esélye percenként
    *navPenalty - a NAV büntetése
    */


    baseOilCost: 3,
    baseOilCapacity: 100,
    taxRate: 0.27,
    inflationRate: 1.25,
    navChance: 0.10,
    navPenalty: 0.25
};
