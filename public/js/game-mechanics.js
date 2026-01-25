import { CONFIG } from './config.js';
import { GAME } from './game-state.js';
import { logEvent, el } from './utils.js';

// Játékmenet
export function gameLoop(updateUI, renderBuildings, getMaxOilCapacity, buyOil) {
    if (!GAME.username) return;

    // LPS számítása
    let rawLps = 0;
    let oilConsumption = 0;

    CONFIG.buildings.forEach(b => {
        const count = GAME.inventory.buildings[b.id];
        rawLps += count * b.lps;
        oilConsumption += count * b.oil;
    });

    // Olaj logika
    // Fogyasztás másodpercenként, a ciklus 0.1s
    const oilDrain = oilConsumption / 10;
    GAME.oil = Math.max(0, GAME.oil - oilDrain);

    // Olaj büntetés
    let effectiveLps = rawLps;
    if (GAME.oil <= 0) {
        effectiveLps = 0; // 0%-on kikapcsol
        // Figyelmeztetés
        if (!GAME.oilWarningShown) {
            logEvent("<span style='color: #f8d615ff;'> »Olaj« FIGYELEM! Az olaj elfogyott! Automata termelés leállt!</span>");
            GAME.oilWarningShown = true;
        }
    }

    // Szint szorzó
    const levelMult = 1 + (GAME.xp.level * 0.01);
    effectiveLps *= levelMult;

    // Ostor szorzó
    if (GAME.whipLevel > 0) {
        const whipUpgrade = CONFIG.whipUpgrades[GAME.whipLevel - 1];
        effectiveLps *= whipUpgrade.lpsMultiplier;
    }

    GAME.lps = effectiveLps;

    // Pénz hozzáadása (tick-enként)
    GAME.money += effectiveLps / 10;

    // Séf különlegessége: 3% esély 1 inas elvesztésére per perc (nem tick-enként)
    GAME.chefTimer += 0.1; // Növelés 0.1 másodpercenként
    if (GAME.chefTimer >= 60) { // Ellenőrzés percenként
        GAME.chefTimer = 0; // Reset timer
        const chefCount = GAME.inventory.buildings['chef'] || 0;
        if (chefCount > 0 && GAME.inventory.buildings['apprentice'] > 0) {
            if (Math.random() < 0.03) { // 3% esély
                GAME.inventory.buildings['apprentice']--;
                logEvent(`<span style="color: #e74c3c;">»Séf« Egy Inas eltűnt!</span>`);
                renderBuildings();
            }
        }
    }

    // Automata tankolás (ha be van kapcsolva és az olaj < 15%)
    const maxCapacity = getMaxOilCapacity();
    const oilPercentage = (GAME.oil / maxCapacity) * 100;
    if (GAME.oilUpgrades.hasAutoRefill && oilPercentage < 15 && GAME.oil < maxCapacity) {
        buyOil();
    }

    updateUI(oilConsumption);
}

// Kattintás kezelése
export function handleClick(updateUI, getMaxOilCapacity, showFloatingText, showCritFloatingText, showOilFloatingText, addXP, getOilCost) {
    let clickVal = 0.001; // Alap

    // Régi fejlesztések (jelenleg üres)
    CONFIG.upgrades.forEach(u => {
        if (GAME.inventory.upgrades.includes(u.id)) {
            clickVal += u.clickBonus;
        }
    });

    // Hőmérséklet szorzó
    if (GAME.temperatureLevel > 0) {
        for (let i = 0; i < GAME.temperatureLevel; i++) {
            clickVal += CONFIG.temperatureUpgrades[i].clickBonus;
        }
    }

    // Ostor szorzó
    if (GAME.whipLevel > 0) {
        const whipUpgrade = CONFIG.whipUpgrades[GAME.whipLevel - 1];
        clickVal *= whipUpgrade.lpsMultiplier;
    }

    // Szint szorzó
    clickVal *= (1 + (GAME.xp.level * 0.01));

    // Receptkönyv szorzó
    if (GAME.recipeBookLevel > 0) {
        const recipeBook = CONFIG.recipeBookUpgrades[GAME.recipeBookLevel - 1];
        clickVal *= recipeBook.lpcMultiplier;
    }

    // Olaj büntetés: 80% csökkentés 0% olajnál (csak 20% marad)
    if (GAME.oil <= 0) {
        clickVal *= 0.2;
    }

    // Kritikus ütés: 1.5x szorzó
    let isCrit = false;
    if (GAME.critLevel > 0) {
        const critUpgrade = CONFIG.critUpgrades[GAME.critLevel - 1];
        if (Math.random() < critUpgrade.critChance) {
            clickVal *= 1.5;
            isCrit = true;
        }
    }

    GAME.money += clickVal;

    // Újrahasznosítás: 1% esély olaj tankolására kattintáskor
    if (GAME.oilUpgrades.recyclingLevel > 0) {
        const recycling = CONFIG.oilUpgrades.recycling[GAME.oilUpgrades.recyclingLevel - 1];
        if (Math.random() < recycling.chance) {
            const maxCapacity = getMaxOilCapacity();
            const oilRestore = maxCapacity * 0.01;
            GAME.oil = Math.min(maxCapacity, GAME.oil + oilRestore);
            showOilFloatingText(oilRestore);
        }
    }

    // XP logika
    GAME.stats.totalClicks++;
    GAME.stats.manualClicksSinceXP++;
    if (GAME.stats.manualClicksSinceXP >= 100) {
        addXP(1);
        GAME.stats.manualClicksSinceXP = 0;
    }

    updateUI(0, getMaxOilCapacity, getOilCost);

    // Animáció
    el.clickerBtn.style.transform = 'scale(0.9)';
    setTimeout(() => el.clickerBtn.style.transform = 'scale(1)', 50);

    // Lebegő szöveg (kritikus vagy normál)
    if (isCrit) {
        showCritFloatingText(clickVal);
    } else {
        showFloatingText(clickVal);
    }
}

// XP hozzáadása és szint növelés
export function addXP(amount, renderOilUpgrades, renderBuildings, renderUpgrades) {
    GAME.xp.points += amount;
    const required = GAME.xp.level * 100;
    if (GAME.xp.points >= required) {
        GAME.xp.level++;
        GAME.xp.points = 0;
        logEvent(`<span style="color: #2ecc71;">»XP« Szint növekedés! Mostantól Lv. ${GAME.xp.level}</span>`);

        // Frissítse az összes boltot, hogy tükrözze az új szint követelményeit
        renderOilUpgrades();
        renderBuildings();
        renderUpgrades();
    }
}

// NAV ellenőrzés
export function navCheck() {
    // 10% esély per perc
    if (Math.random() < CONFIG.navChance / 60) {
        const penalty = GAME.money * CONFIG.navPenalty;
        GAME.money -= penalty;
        logEvent(`<span style="color: #e74c3c;">»NAV« Bírság! -${penalty.toFixed(3)} L</span>`);
    }
}
