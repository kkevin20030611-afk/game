import { CONFIG } from './config.js';
import { GAME } from './game-state.js';
import { logEvent, formatNum } from './utils.js';

// Segéd: Aktuális olajköltség lekérése XP szint alapján
export function getOilCost() {
    // Formula: baseCost * (1 + level * 0.5)
    return CONFIG.baseOilCost * (1 + GAME.xp.level * 0.5);
}

// Segéd: Aktuális maximális olajkapacitás lekérése
export function getMaxOilCapacity() {
    if (GAME.oilUpgrades.tankCapacityLevel === 0) {
        return CONFIG.baseOilCapacity;
    }
    const upgrade = CONFIG.oilUpgrades.tankCapacity[GAME.oilUpgrades.tankCapacityLevel - 1];
    return upgrade ? upgrade.capacity : CONFIG.baseOilCapacity;
}

// Költés követése XP-hez
export function trackSpending(amount) {
    GAME.stats.moneySpentSinceXP += amount;
    // Megjegyzés: addXP a game-mechanics.js-ben kerül meghívásra, amikor a küszöb teljesül
}

// Épület vásárlás
export function buyBuilding(id, renderBuildings, trackSpending) {
    const building = CONFIG.buildings.find(b => b.id === id);

    // Szint követelmény ellenőrzés
    if (building.levelRequired && GAME.xp.level < building.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const count = GAME.inventory.buildings[id];
    const cost = building.baseCost * Math.pow(CONFIG.inflationRate, count);
    const tax = cost * CONFIG.taxRate;
    const total = cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.inventory.buildings[id]++;

        // Különleges: Séf ad 10 inast vásárláskor
        if (id === 'chef') {
            GAME.inventory.buildings['apprentice'] = (GAME.inventory.buildings['apprentice'] || 0) + 10;
            logEvent(`<span style="color: #3498db;">»Séf« +10 Inas ajándék!</span>`);
        }

        logEvent(`<span style="color: #ffffffff;">»Piac« Sikeres megvásároltad a(z) ${building.name} szolgát. [-${formatNum(total)} L]</span>`);
        trackSpending(total);
        renderBuildings(); // Ár frissítése
    }
}

// Fejlesztés vásárlás
export function buyUpgrade(id, renderUpgrades, trackSpending) {
    const upgrade = CONFIG.upgrades.find(u => u.id === id);
    if (!GAME.inventory.upgrades.includes(id) && GAME.money >= upgrade.cost) {
        GAME.money -= upgrade.cost;
        GAME.inventory.upgrades.push(id);
        logEvent(`<span style="color: #ffffffff;">»Fejleszt\u00e9s« Sikeres fejlesztetted a(z) ${upgrade.name} ? [-${formatNum(upgrade.cost)} L]</span>`);
        trackSpending(upgrade.cost);
        renderUpgrades(); // Letiltás
    }
}

// Hőmérséklet fejlesztés vásárlás
export function buyTemperatureUpgrade(renderUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.temperatureLevel + 1;
    if (nextLevel > CONFIG.temperatureUpgrades.length) return; // Max szint

    const upgrade = CONFIG.temperatureUpgrades[nextLevel - 1];
    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.temperatureLevel = nextLevel;
        logEvent(`<span style="color: #ffffffff;">»Fejleszt\u00e9s« ${upgrade.name} megvásárolva! (+${upgrade.clickBonus} LPC)</span>`);
        trackSpending(total);
        renderUpgrades();
        updateUI();
    }
}

// Ostor fejlesztés vásárlás
export function buyWhipUpgrade(renderUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.whipLevel + 1;
    if (nextLevel > CONFIG.whipUpgrades.length) return; // Max szint

    const upgrade = CONFIG.whipUpgrades[nextLevel - 1];

    // Szint követelmény ellenőrzés
    if (upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.whipLevel = nextLevel;
        const multiplierPercent = ((upgrade.lpsMultiplier - 1) * 100).toFixed(0);
        logEvent(`<span style="color: #ffffffff;">»Fejleszt\u00e9s« ${upgrade.name} megvásárolva! (+${multiplierPercent}% LPS)</span>`);
        trackSpending(total);
        renderUpgrades();
        updateUI();
    }
}

// Kritikus fejlesztés vásárlás
export function buyCritUpgrade(renderUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.critLevel + 1;
    if (nextLevel > CONFIG.critUpgrades.length) return; // Max szint

    const upgrade = CONFIG.critUpgrades[nextLevel - 1];

    // Szint követelmény ellenőrzés
    if (upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.critLevel = nextLevel;
        const chancePercent = (upgrade.critChance * 100).toFixed(0);
        logEvent(`<span style="color: #f1c40f;">»Krit« ${upgrade.name} megvásárolva! (${chancePercent}% esély, 1.5x sebzés)</span>`);
        trackSpending(total);
        renderUpgrades();
        updateUI();
    }
}

// Receptkönyv fejlesztés vásárlás
export function buyRecipeBookUpgrade(renderUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.recipeBookLevel + 1;
    if (nextLevel > CONFIG.recipeBookUpgrades.length) return; // Max szint

    const upgrade = CONFIG.recipeBookUpgrades[nextLevel - 1];

    // Szint követelmény ellenőrzés
    if (upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.recipeBookLevel = nextLevel;
        const multiplierPercent = ((upgrade.lpcMultiplier - 1) * 100).toFixed(0);
        logEvent(`<span style="color: #ffffffff;">»Receptesk\u00f6nyv« ${upgrade.name} megvásárolva! (+${multiplierPercent}% LPC)</span>`);
        trackSpending(total);
        renderUpgrades();
        updateUI();
    }
}

// Olaj vásárlás
export function buyOil(updateUI, trackSpending) {
    const oilCost = getOilCost();
    const tax = oilCost * CONFIG.taxRate;
    const total = oilCost + tax;
    const maxCapacity = getMaxOilCapacity();

    if (GAME.money >= total && GAME.oil < maxCapacity) {
        GAME.money -= total;
        GAME.oil = maxCapacity; // Feltöltés maxra
        //logEvent(`<span style="color: #3498db;">»Olaj« Tartály feltöltve ${maxCapacity}L-re. [-${formatNum(total)} L]</span>`);
        trackSpending(total);
        updateUI();
    }
}

// Tartály kapacitás fejlesztés vásárlás
export function buyTankCapacityUpgrade(renderOilUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.oilUpgrades.tankCapacityLevel + 1;
    if (nextLevel > CONFIG.oilUpgrades.tankCapacity.length) return; // Max szint

    const upgrade = CONFIG.oilUpgrades.tankCapacity[nextLevel - 1];
    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.oilUpgrades.tankCapacityLevel = nextLevel;
        logEvent(`<span style="color: #3498db;">»Olaj« ${upgrade.name} megvásárolva! (Max: ${upgrade.capacity}L)</span>`);
        trackSpending(total);
        renderOilUpgrades();
        updateUI();
    }
}

// Automatikus utántöltés vásárlás
export function buyAutoRefill(renderOilUpgrades, updateUI, trackSpending) {
    if (GAME.oilUpgrades.hasAutoRefill) return; // Már megvásárolva

    // Szint követelmény ellenőrzés
    if (CONFIG.oilUpgrades.autoRefill.levelRequired && GAME.xp.level < CONFIG.oilUpgrades.autoRefill.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const cost = CONFIG.oilUpgrades.autoRefill.cost;
    const tax = cost * CONFIG.taxRate;
    const total = cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.oilUpgrades.hasAutoRefill = true;
        logEvent(`<span style="color: #2ecc71;">»Olaj« ${CONFIG.oilUpgrades.autoRefill.name} megvásárolva!</span>`);
        trackSpending(total);
        renderOilUpgrades();
        updateUI();
    }
}

// Újrahasznosítás vásárlás
export function buyRecycling(renderOilUpgrades, updateUI, trackSpending) {
    const nextLevel = GAME.oilUpgrades.recyclingLevel + 1;
    if (nextLevel > CONFIG.oilUpgrades.recycling.length) return; // Max szint

    const upgrade = CONFIG.oilUpgrades.recycling[nextLevel - 1];

    // Szint követelmény ellenőrzés
    if (upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired) {
        return; // Visszatérés ha nincs meg a szint
    }

    const tax = upgrade.cost * CONFIG.taxRate;
    const total = upgrade.cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.oilUpgrades.recyclingLevel = nextLevel;
        const chancePercent = (upgrade.chance * 100).toFixed(0);
        logEvent(`<span style="color: #3498db;">»Újrahasznosítás« ${upgrade.name} megvásárolva! (${chancePercent}% esély)</span>`);
        trackSpending(total);
        renderOilUpgrades();
        updateUI();
    }
}