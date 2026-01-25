import { CONFIG } from './config.js';
import { GAME } from './game-state.js';
import { el, formatNum } from './utils.js';

// Segédfüggvények: getOilCost() és getMaxOilCapacity() a shop.js-ből vannak importálva

// Normál lebegő szöveg megjelenítése kattintáskor
export function showFloatingText(amount) {
    const button = el.clickerBtn;
    const rect = button.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.textContent = `+${formatNum(amount)}`;

    // Pozíció véletlenszerű helyen a gomb közelében
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;
    text.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
    text.style.top = `${rect.top + rect.height / 2 + offsetY}px`;
    text.style.position = 'fixed';

    document.body.appendChild(text);

    // Animáció után eltávolítás
    setTimeout(() => text.remove(), 1000);
}

// Olaj feltöltés lebegő szöveg megjelenítése
export function showOilFloatingText(amount) {
    const button = el.clickerBtn;
    const rect = button.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.textContent = `+${amount.toFixed(1)} olaj`;
    text.style.color = '#3498db';

    // RND pozi megvalósítása
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;
    text.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
    text.style.top = `${rect.top + rect.height / 2 + offsetY}px`;
    text.style.position = 'fixed';

    document.body.appendChild(text);

    // Animáció után eltávolítás
    setTimeout(() => text.remove(), 1000);
}

// Kritikus találat lebegő szöveg megjelenítése
export function showCritFloatingText(amount) {
    const button = el.clickerBtn;
    const rect = button.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.textContent = `KRIT! +${formatNum(amount)}`;
    text.style.color = '#f1c40f';
    text.style.fontWeight = 'bold';
    text.style.fontSize = '1.5em';

    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;
    text.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
    text.style.top = `${rect.top + rect.height / 2 + offsetY}px`;
    text.style.position = 'fixed';

    document.body.appendChild(text);

    setTimeout(() => text.remove(), 1000);
}

// Fő UI frissítő függvény
export function updateUI(currentOilConsumption = 0, getMaxOilCapacity, getOilCost) {
    el.langosCounter.textContent = formatNum(GAME.money) + " Lángos";

    // LPC számítása és megjelenítése
    let lpc = 0.001; // Base
    CONFIG.upgrades.forEach(u => {
        if (GAME.inventory.upgrades.includes(u.id)) {
            lpc += u.clickBonus;
        }
    });

    // Hőmérséklet bónusz - minden szint összeadódik
    if (GAME.temperatureLevel > 0) {
        for (let i = 0; i < GAME.temperatureLevel; i++) {
            lpc += CONFIG.temperatureUpgrades[i].clickBonus;
        }
    }

    // A csipesz upgrade-ek az LPS-t befolyásolják, nem az LPC-t

    lpc *= (1 + (GAME.xp.level * 0.01));

    // Receptkönyv LPC szorzó
    if (GAME.recipeBookLevel > 0) {
        const recipeBook = CONFIG.recipeBookUpgrades[GAME.recipeBookLevel - 1];
        lpc *= recipeBook.lpcMultiplier;
    }

    if (GAME.oil <= 0) {
        lpc *= 0.2; // 80%-kal csökken
    }
    el.lpcCounter.textContent = formatNum(lpc) + " LPC";

    el.lpsCounter.textContent = formatNum(GAME.lps) + " LPS";

    el.displayLevel.textContent = `[Lvl ${GAME.xp.level}]`;
    const xpReq = GAME.xp.level * 100;
    const xpPct = (GAME.xp.points / xpReq) * 100;
    el.xpBar.style.width = `${xpPct}%`;
    el.xpText.textContent = `${GAME.xp.points}/${xpReq} XP`;

    const maxCapacity = getMaxOilCapacity();
    el.oilText.textContent = `${Math.round(GAME.oil)}/${maxCapacity}L - ${Math.round((GAME.oil / maxCapacity) * 100)}%`;
    el.oilBar.style.width = `${(GAME.oil / maxCapacity) * 100}%`;

    // Olaj színek és kritikus animáció
    const oilPercentage = (GAME.oil / maxCapacity) * 100;
    if (oilPercentage < 20) {
        el.oilBar.style.backgroundColor = 'var(--danger)';
        el.oilBar.classList.add('critical');
    } else {
        el.oilBar.classList.remove('critical');
        if (oilPercentage < 50) {
            el.oilBar.style.backgroundColor = 'var(--warning)';
        } else {
            el.oilBar.style.backgroundColor = 'var(--warning)';
        }
    }

    // Gombok állapotának frissítése
    document.querySelectorAll('.btn-buy-building').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        btn.disabled = GAME.money < cost;
    });

    // Upgrade gombok állapotának frissítése
    document.querySelectorAll('.btn-buy-upgrade').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        btn.disabled = GAME.money < cost;
    });

    // Olaj upgrade gombok állapotának frissítése újrarajzolás nélkül
    const oilCost = getOilCost();
    const oilTax = oilCost * CONFIG.taxRate;
    const oilTotal = oilCost + oilTax;
    const oilMaxCap = getMaxOilCapacity();

    const oilBtn = document.getElementById('btn-buy-oil');
    if (oilBtn) {
        oilBtn.disabled = GAME.money < oilTotal || GAME.oil >= oilMaxCap;
    }

    // Tartálykapacitás gomb frissítése, ha létezik
    document.querySelectorAll('[onclick^="buyTankCapacityUpgrade"]').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        if (!isNaN(cost)) {
            btn.disabled = GAME.money < cost;
        }
    });

    // Automatikus feltöltés gomb frissítése, ha létezik
    document.querySelectorAll('[onclick^="buyAutoRefill"]').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        if (!isNaN(cost)) {
            btn.disabled = GAME.money < cost;
        }
    });

    // Újrahasznosítás gomb frissítése, ha létezik
    document.querySelectorAll('[onclick^="buyRecycling"]').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        if (!isNaN(cost)) {
            btn.disabled = GAME.money < cost;
        }
    });
}

// Épületek tab renderelése
export function renderBuildings() {
    el.buildingsList.innerHTML = '';
    CONFIG.buildings.forEach(b => {
        const count = GAME.inventory.buildings[b.id];
        const cost = b.baseCost * Math.pow(CONFIG.inflationRate, count);
        const tax = cost * CONFIG.taxRate;
        const total = cost + tax;

        const isLocked = b.levelRequired && GAME.xp.level < b.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelText = b.levelRequired ? `<span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${b.levelRequired}</span>` : '';

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.position = 'relative';
        div.innerHTML = `
            ${levelText ? `<div style="position: absolute; top: -13px; right: 5px;">${levelText}</div>` : ''}
            <div class="info">
                <h4>${b.name} (x${count})</h4>
                <p>+${b.lps} LPS | Olaj: ${b.oil}/mp</p>
            </div>
            <button class="btn-buy btn-buy-building" data-id="${b.id}" data-cost="${total}" onclick="buyBuilding('${b.id}')" ${isLocked ? 'disabled' : ''}>
                ${isLocked ? 'ZÁRVA' : formatNum(total) + ' L'}
            </button>
        `;
        el.buildingsList.appendChild(div);
    });
}

// Upgradek tab renderelése
export function renderUpgrades() {
    el.upgradesList.innerHTML = '';

    // Régi upgradek
    CONFIG.upgrades.forEach(u => {
        if (GAME.inventory.upgrades.includes(u.id)) return;

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>${u.name}</h4>
                <p>+${u.clickBonus} Click</p>
            </div>
            <button class="btn-buy btn-buy-upgrade" data-cost="${u.cost}" onclick="buyUpgrade('${u.id}')">
                ${formatNum(u.cost)} L
            </button>
        `;
        el.upgradesList.appendChild(div);
    });

    // Hőmérséklet upgradek
    const nextTempLevel = GAME.temperatureLevel + 1;
    if (nextTempLevel <= CONFIG.temperatureUpgrades.length) {
        const upgrade = CONFIG.temperatureUpgrades[nextTempLevel - 1];
        const tax = upgrade.cost * CONFIG.taxRate;
        const total = upgrade.cost + tax;
        const canAfford = GAME.money >= total;

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>${upgrade.name}</h4>
                <p>${upgrade.temperature}°C | +${upgrade.clickBonus} LPC bónusz</p>
            </div>
            <button class="btn-buy btn-buy-upgrade" data-cost="${total}" onclick="buyTemperatureUpgrade()" ${!canAfford ? 'disabled' : ''}>
                ${formatNum(total)} L
            </button>
        `;
        el.upgradesList.appendChild(div);
    } else {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>Hőmérséklet VIII </h4> 
                <p style="color: #2ecc71;">✓ Max szint elérve (100°C)</p>
            </div>
        `;
        el.upgradesList.appendChild(div);
    }

    // Csipesz upgradek
    const nextWhipLevel = GAME.whipLevel + 1;
    if (nextWhipLevel <= CONFIG.whipUpgrades.length) {
        const upgrade = CONFIG.whipUpgrades[nextWhipLevel - 1];
        const tax = upgrade.cost * CONFIG.taxRate;
        const total = upgrade.cost + tax;
        const canAfford = GAME.money >= total;
        const multiplierPercent = ((upgrade.lpsMultiplier - 1) * 100).toFixed(0);

        const isLocked = upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelText = upgrade.levelRequired ? `<span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${upgrade.levelRequired}</span>` : '';

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.position = 'relative';
        div.innerHTML = `
            ${levelText ? `<div style="position: absolute; top: -13px; right: 5px;">${levelText}</div>` : ''}
            <div class="info">
                <h4>${upgrade.name}</h4>
                <p>Munkára fel! | +${multiplierPercent}% LPS szorzó</p>
            </div>
            <button class="btn-buy btn-buy-upgrade" data-cost="${total}" onclick="buyWhipUpgrade()" ${isLocked || !canAfford ? 'disabled' : ''}>
                ${isLocked ? 'ZÁRVA' : formatNum(total) + ' L'}
            </button>
        `;
        el.upgradesList.appendChild(div);
    } else {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>Ostor III</h4>
                <p style="color: #2ecc71;">✓ Max szint elérve</p>
            </div>
        `;
        el.upgradesList.appendChild(div);
    }

    // Receptkönyv upgradek (átkerült a kritikus bónusz elé)
    const nextRecipeLevel = GAME.recipeBookLevel + 1;
    if (nextRecipeLevel <= CONFIG.recipeBookUpgrades.length) {
        const upgrade = CONFIG.recipeBookUpgrades[nextRecipeLevel - 1];
        const tax = upgrade.cost * CONFIG.taxRate;
        const total = upgrade.cost + tax;
        const canAfford = GAME.money >= total;
        const multiplierPercent = ((upgrade.lpcMultiplier - 1) * 100).toFixed(0);

        const isLocked = upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelText = upgrade.levelRequired ? `<span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${upgrade.levelRequired}</span>` : '';

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.position = 'relative';
        div.innerHTML = `
            ${levelText ? `<div style="position: absolute; top: -10px; right: 5px;">${levelText}</div>` : ''}
            <div class="info">
                <h4>${upgrade.name}</h4>
                <p>+${multiplierPercent}% LPC szorzó</p>
            </div>
            <button class="btn-buy btn-buy-upgrade" data-cost="${total}" onclick="buyRecipeBookUpgrade()" ${isLocked || !canAfford ? 'disabled' : ''}>
                ${isLocked ? 'ZÁRVA' : formatNum(total) + ' L'}
            </button>
        `;
        el.upgradesList.appendChild(div);
    } else {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>Recepteskönyv III</h4>
                <p style="color: #2ecc71;">✓ Max szint elérve (5% bonus)</p>
            </div>
        `;
        el.upgradesList.appendChild(div);
    }

    // Kritikus bónusz upgradek
    const nextCritLevel = GAME.critLevel + 1;
    if (nextCritLevel <= CONFIG.critUpgrades.length) {
        const upgrade = CONFIG.critUpgrades[nextCritLevel - 1];
        const tax = upgrade.cost * CONFIG.taxRate;
        const total = upgrade.cost + tax;
        const canAfford = GAME.money >= total;
        const chancePercent = (upgrade.critChance * 100).toFixed(0);

        const isLocked = upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelText = upgrade.levelRequired ? `<span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${upgrade.levelRequired}</span>` : '';

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.position = 'relative';
        div.innerHTML = `
            ${levelText ? `<div style="position: absolute; top: -10px; right: 5px;">${levelText}</div>` : ''}
            <div class="info">
                <h4>${upgrade.name}</h4>
                <p>${chancePercent}% kritikus esély (1.5x sebzés)</p>
            </div>
            <button class="btn-buy btn-buy-upgrade" data-cost="${total}" onclick="buyCritUpgrade()" ${isLocked || !canAfford ? 'disabled' : ''}>
                ${isLocked ? 'ZÁRVA' : formatNum(total) + ' L'}
            </button>
        `;
        el.upgradesList.appendChild(div);
    } else {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>Krit X</h4>
                <p style="color: #2ecc71;">✓ Max szint elérve (10% esély)</p>
            </div>
        `;
        el.upgradesList.appendChild(div);
    }
}

// Olaj upgradek tab renderelése
export function renderOilUpgrades(getMaxOilCapacity, getOilCost) {
    const oilTab = document.getElementById('tab-oil');
    if (!oilTab) return;

    const maxCapacity = getMaxOilCapacity();
    const oilCost = getOilCost();
    const oilTax = oilCost * CONFIG.taxRate;
    const oilTotal = oilCost + oilTax;
    const canAffordOil = GAME.money >= oilTotal && GAME.oil < maxCapacity;

    let html = `
        <!-- Oil Can Purchase -->
        <div class="shop-item">
            <div class="info">
                <h4>Kannás olaj</h4>
                <p>Olaj maxra töltése</p>
            </div>
            <button id="btn-buy-oil" class="btn-buy" onclick="buyOil()" ${!canAffordOil ? 'disabled' : ''}>
                ${formatNum(oilTotal)} L
            </button>
        </div>
    `;

    const nextTankLevel = GAME.oilUpgrades.tankCapacityLevel + 1;
    if (nextTankLevel <= CONFIG.oilUpgrades.tankCapacity.length) {
        const upgrade = CONFIG.oilUpgrades.tankCapacity[nextTankLevel - 1];
        const tankTax = upgrade.cost * CONFIG.taxRate;
        const tankTotal = upgrade.cost + tankTax;
        const canAffordTank = GAME.money >= tankTotal;
        html += `
            <div class="shop-item">
                <div class="info">
                    <h4>${upgrade.name}</h4>
                    <p>Max olaj: ${upgrade.capacity}L</p>
                </div>
                <button class="btn-buy" data-cost="${tankTotal}" onclick="buyTankCapacityUpgrade()" ${!canAffordTank ? 'disabled' : ''}>
                    ${formatNum(tankTotal)} L
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="shop-item">
                <div class="info">
                    <h4>Tartály Bővítés V</h4>
                    <p style="color: #2ecc71;">✓ Max szint elérve (${maxCapacity}L)</p>
                </div>
            </div>
        `;
    }

    // Újrahasznosítás upgradek
    const nextRecyclingLevel = GAME.oilUpgrades.recyclingLevel + 1;
    if (nextRecyclingLevel <= CONFIG.oilUpgrades.recycling.length) {
        const upgrade = CONFIG.oilUpgrades.recycling[nextRecyclingLevel - 1];
        const recyclingTax = upgrade.cost * CONFIG.taxRate;
        const recyclingTotal = upgrade.cost + recyclingTax;
        const canAffordRecycling = GAME.money >= recyclingTotal;
        const chancePercent = (upgrade.chance * 100).toFixed(0);

        const isLocked = upgrade.levelRequired && GAME.xp.level < upgrade.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelBadge = upgrade.levelRequired ? `<div style="position: absolute; top: -13px; right: 5px;"><span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${upgrade.levelRequired}</span></div>` : '';

        html += `
            <div class="shop-item" style="position: relative;">
                ${levelBadge}
                <div class="info">
                    <h4>${upgrade.name}</h4>
                    <p>${chancePercent}% esély 1% olaj vissza töltésre</p>
                </div>
                <button class="btn-buy" data-cost="${recyclingTotal}" onclick="buyRecycling()" ${isLocked || !canAffordRecycling ? 'disabled' : ''}>
                    ${isLocked ? 'ZÁRVA' : formatNum(recyclingTotal) + ' L'}
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="shop-item">
                <div class="info">
                    <h4>Újrahasznosítás V</h4>
                    <p style="color: #2ecc71;">✓ Max szint elérve (10% esély)</p>
                </div>
            </div>
        `;
    }

    // Automata feltöltés
    if (!GAME.oilUpgrades.hasAutoRefill) {
        const autoRefillCost = CONFIG.oilUpgrades.autoRefill.cost;
        const autoRefillTax = autoRefillCost * CONFIG.taxRate;
        const autoRefillTotal = autoRefillCost + autoRefillTax;
        const canAffordAutoRefill = GAME.money >= autoRefillTotal;

        const isLocked = CONFIG.oilUpgrades.autoRefill.levelRequired && GAME.xp.level < CONFIG.oilUpgrades.autoRefill.levelRequired;
        const levelColor = isLocked ? '#e74c3c' : '#2ecc71';
        const levelBadge = CONFIG.oilUpgrades.autoRefill.levelRequired ? `<div style="position: absolute; top: -10px; right: 5px;"><span style="color: ${levelColor}; font-size: 0.9em;">${isLocked ? '🔒' : '✓'} Lv. ${CONFIG.oilUpgrades.autoRefill.levelRequired}</span></div>` : '';

        html += `
            <div class="shop-item" style="position: relative;">
                ${levelBadge}
                <div class="info">
                    <h4>${CONFIG.oilUpgrades.autoRefill.name}</h4>
                    <p>Automatikus töltés 15% alatt</p>
                </div>
                <button class="btn-buy" data-cost="${autoRefillTotal}" onclick="buyAutoRefill()" ${isLocked || !canAffordAutoRefill ? 'disabled' : ''}>
                    ${isLocked ? 'ZÁRVA' : formatNum(autoRefillTotal) + ' L'}
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="shop-item">
                <div class="info">
                    <h4>${CONFIG.oilUpgrades.autoRefill.name}</h4>
                    <p style="color: #2ecc71;">✓ Aktiválva</p>
                </div>
            </div>
        `;
    }

    oilTab.innerHTML = html;
}
