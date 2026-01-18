const CONFIG = {
    buildings: [
        { id: 'nephew', name: 'Unokaöcsi', baseCost: 1000, lps: 0.005, oil: 0.05 },
        { id: 'gas', name: 'Gázpalack', baseCost: 25000, lps: 0.020, oil: 0.20 },
        { id: 'stall', name: 'Piaci Bódé', baseCost: 350000, lps: 0.150, oil: 0.80 },
        { id: 'buffet', name: 'Strand Büfé', baseCost: 5000000, lps: 2.500, oil: 2.50 },
        { id: 'factory', name: 'Lángos Gyár', baseCost: 75000000, lps: 50.00, oil: 10.0 }
    ],
    upgrades: [
        { id: 'napkin', name: 'Szalvéta', cost: 50, clickBonus: 0.001 },
        { id: 'plastic_fork', name: 'Műanyag Villa', cost: 500, clickBonus: 0.005 },
        { id: 'garlic_brush', name: 'Fokhagymás Ecset', cost: 10000, clickBonus: 0.020 },
        { id: 'spicy_steve', name: 'Erős Pista', cost: 2500000, clickBonus: 1.000 }
    ],
    oilCapacity: 100, // max oil
    oilCost: 100, // Lángos cost for refill
    taxRate: 0.27,
    inflationRate: 1.25,
    navChance: 0.10, // 10% chance per minute to simplify testing (spec said X%)
    navPenalty: 0.25
};

let GAME = {
    username: null,
    money: 0.0,
    clickValue: 0.001,
    lps: 0.0,
    oil: 100.0,
    xp: { points: 0, level: 1 },
    inventory: {
        buildings: {}, // id: count
        upgrades: []   // array of acquired upgrade ids
    },
    stats: {
        totalClicks: 0,
        manualClicksSinceXP: 0,
        moneySpentSinceXP: 0
    }
};

// --- DOM ELEMENTS ---
const el = {
    loginScreen: document.getElementById('login-screen'),
    gameScreen: document.getElementById('game-screen'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('btn-login'),
    registerBtn: document.getElementById('btn-register'),
    loginMsg: document.getElementById('login-msg'),
    
    displayUsername: document.getElementById('display-username'),
    displayLevel: document.getElementById('display-level'),
    xpBar: document.getElementById('xp-bar-fill'),
    logoutBtn: document.getElementById('btn-logout'),
    
    langosCounter: document.getElementById('langos-counter'),
    lpsCounter: document.getElementById('lps-counter'),
    clickerBtn: document.getElementById('btn-clicker'),
    oilBar: document.getElementById('oil-bar-fill'),
    oilText: document.getElementById('oil-percentage'),
    
    eventLog: document.getElementById('event-log'),
    
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    buildingsList: document.getElementById('tab-buildings'),
    upgradesList: document.getElementById('tab-upgrades'),
    buyOilBtn: document.getElementById('btn-buy-oil')
};

// --- INIT ---
function init() {
    // Init inventory
    CONFIG.buildings.forEach(b => GAME.inventory.buildings[b.id] = 0);
    
    // Render Shop
    renderBuildings();
    renderUpgrades();
    
    // Listeners
    el.loginBtn.addEventListener('click', handleLogin);
    el.registerBtn.addEventListener('click', handleRegister);
    el.logoutBtn.addEventListener('click', handleLogout);
    el.clickerBtn.addEventListener('click', handleClick);
    el.buyOilBtn.addEventListener('click', buyOil);
    
    el.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Start Loop
    setInterval(gameLoop, 100); // 10 ticks per second
    setInterval(navCheck, 60000); // Every minute
    setInterval(saveGame, 30000); // Auto save every 30s
}

// --- CORE LOGIC ---
function gameLoop() {
    if (!GAME.username) return;

    // Calculate LPS
    let rawLps = 0;
    let oilConsumption = 0;
    
    CONFIG.buildings.forEach(b => {
        const count = GAME.inventory.buildings[b.id];
        rawLps += count * b.lps;
        oilConsumption += count * b.oil;
    });

    // Oil Logic
    // Consumption is per second, loop is 0.1s
    const oilDrain = oilConsumption / 10;
    GAME.oil = Math.max(0, GAME.oil - oilDrain);
    
    // Oil Penalty
    let effectiveLps = rawLps;
    if (GAME.oil <= 0) {
        effectiveLps *= 0.1; // 90% reduction
    }

    // Level Multiplier
    const levelMult = 1 + (GAME.xp.level * 0.01);
    effectiveLps *= levelMult;
    
    GAME.lps = effectiveLps;
    
    // Add Money (per tick)
    GAME.money += effectiveLps / 10;

    updateUI(oilConsumption);
}

function handleClick() {
    let clickVal = 0.001; // Base
    
    // Upgrades
    CONFIG.upgrades.forEach(u => {
        if (GAME.inventory.upgrades.includes(u.id)) {
            clickVal += u.clickBonus;
        }
    });

    // Level Mult
    clickVal *= (1 + (GAME.xp.level * 0.01));
    
    GAME.money += clickVal;
    
    // XP Logic
    GAME.stats.totalClicks++;
    GAME.stats.manualClicksSinceXP++;
    if (GAME.stats.manualClicksSinceXP >= 100) {
        addXP(1);
        GAME.stats.manualClicksSinceXP = 0;
    }
    
    updateUI();
    
    // Animation
    el.clickerBtn.style.transform = 'scale(0.9)';
    setTimeout(() => el.clickerBtn.style.transform = 'scale(1)', 50);
}

function buyBuilding(id) {
    const building = CONFIG.buildings.find(b => b.id === id);
    const count = GAME.inventory.buildings[id];
    const cost = building.baseCost * Math.pow(CONFIG.inflationRate, count);
    const tax = cost * CONFIG.taxRate;
    const total = cost + tax;

    if (GAME.money >= total) {
        GAME.money -= total;
        GAME.inventory.buildings[id]++;
        logEvent(`Vettél egy: ${building.name} (-${formatNum(total)} L)`);
        trackSpending(total);
        renderBuildings(); // Update price
    }
}

function buyUpgrade(id) {
    const upgrade = CONFIG.upgrades.find(u => u.id === id);
    if (!GAME.inventory.upgrades.includes(id) && GAME.money >= upgrade.cost) {
        GAME.money -= upgrade.cost;
        GAME.inventory.upgrades.push(id);
        logEvent(`Fejlesztés: ${upgrade.name}!`);
        trackSpending(upgrade.cost);
        renderUpgrades(); // Remove or disable
    }
}

function buyOil() {
    if (GAME.money >= CONFIG.oilCost && GAME.oil < 100) {
        GAME.money -= CONFIG.oilCost;
        GAME.oil = 100;
        logEvent("Olaj újratöltve!");
    }
}

function trackSpending(amount) {
    GAME.stats.moneySpentSinceXP += amount;
    const xpGain = Math.floor(GAME.stats.moneySpentSinceXP / 1000);
    if (xpGain > 0) {
        addXP(xpGain);
        GAME.stats.moneySpentSinceXP %= 1000;
    }
}

function addXP(amount) {
    GAME.xp.points += amount;
    const req = GAME.xp.level * 100;
    if (GAME.xp.points >= req) {
        GAME.xp.points -= req;
        GAME.xp.level++;
        logEvent(`SZINTLÉPÉS! Új szint: ${GAME.xp.level}`);
        saveGame(); // Save on level up
    }
}

function navCheck() {
    if (!GAME.username) return;
    
    if (Math.random() < CONFIG.navChance) {
        const penalty = GAME.money * CONFIG.navPenalty;
        GAME.money -= penalty;
        logEvent(`NAV ELLENŐRZÉS! Elbuktál ${formatNum(penalty)} Lángost.`);
    }
}

// --- UI HELPERS ---
function updateUI(currentOilConsumption = 0) {
    el.langosCounter.textContent = formatNum(GAME.money) + " Lángos";
    el.lpsCounter.textContent = formatNum(GAME.lps) + " LPS";
    
    el.displayLevel.textContent = `[Lvl ${GAME.xp.level}]`;
    const xpReq = GAME.xp.level * 100;
    const xpPct = (GAME.xp.points / xpReq) * 100;
    el.xpBar.style.width = `${xpPct}%`;
    
    el.oilText.textContent = Math.round(GAME.oil) + "%";
    el.oilBar.style.width = `${GAME.oil}%`;
    
    // Oil colors
    if (GAME.oil < 20) {
        el.oilBar.style.backgroundColor = 'var(--danger)';
        el.oilBar.parentElement.classList.add('critical'); // You might want to animate parent background
    } else if (GAME.oil < 50) {
        el.oilBar.style.backgroundColor = 'var(--warning)';
    } else {
        el.oilBar.style.backgroundColor = 'var(--warning)'; // Default yellow
    }

    // Update buttons state
    document.querySelectorAll('.btn-buy-building').forEach(btn => {
        const cost = parseFloat(btn.dataset.cost);
        btn.disabled = GAME.money < cost;
    });
}

function renderBuildings() {
    el.buildingsList.innerHTML = '';
    CONFIG.buildings.forEach(b => {
        const count = GAME.inventory.buildings[b.id];
        const cost = b.baseCost * Math.pow(CONFIG.inflationRate, count);
        const tax = cost * CONFIG.taxRate;
        const total = cost + tax;
        
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>${b.name} (x${count})</h4>
                <p>+${b.lps} LPS | Olaj: ${b.oil}/mp</p>
            </div>
            <button class="btn-buy btn-buy-building" data-id="${b.id}" data-cost="${total}" onclick="buyBuilding('${b.id}')">
                ${formatNum(total)} L
            </button>
        `;
        el.buildingsList.appendChild(div);
    });
}

function renderUpgrades() {
    el.upgradesList.innerHTML = '';
    CONFIG.upgrades.forEach(u => {
        if (GAME.inventory.upgrades.includes(u.id)) return; // Already bought
        
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="info">
                <h4>${u.name}</h4>
                <p>+${u.clickBonus} Click</p>
            </div>
            <button class="btn-buy" onclick="buyUpgrade('${u.id}')">
                ${formatNum(u.cost)} L
            </button>
        `;
        el.upgradesList.appendChild(div);
    });
}

function logEvent(msg) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span>[${time}]</span> ${msg}`;
    el.eventLog.insertBefore(div, el.eventLog.firstChild);
}

function formatNum(n) {
    return n.toLocaleString('hu-HU', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function switchTab(tabId) {
    el.tabContents.forEach(t => t.classList.remove('active'));
    el.tabBtns.forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelector(`button[data-tab="${tabId}"]`).classList.add('active');
}

// --- API ---
async function handleLogin() {
    const user = el.usernameInput.value;
    const pass = el.passwordInput.value;
    
    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (data.success) {
            loadGame(data.user);
        } else {
            el.loginMsg.textContent = data.error;
        }
    } catch (err) {
        el.loginMsg.textContent = "Hiba a kapcsolódáskor.";
    }
}

async function handleRegister() {
    const user = el.usernameInput.value;
    const pass = el.passwordInput.value;
    
    try {
        const res = await fetch('api/register.php', {
            method: 'POST',
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (data.success) {
            el.loginMsg.textContent = "Sikeres regisztráció! Jelentkezz be.";
            el.loginMsg.style.color = "lightgreen";
        } else {
            el.loginMsg.textContent = data.error;
            el.loginMsg.style.color = "red";
        }
    } catch (err) {
        el.loginMsg.textContent = "Hiba.";
    }
}

function loadGame(userData) {
    GAME.username = userData.username;
    GAME.xp.level = parseInt(userData.xp_level);
    GAME.xp.points = parseInt(userData.xp_points);
    
    if (userData.save_data) {
        const save = JSON.parse( userData.save_data);
        if (save.money !== undefined) GAME.money = save.money;
        if (save.oil !== undefined) GAME.oil = save.oil;
        if (save.inventory) GAME.inventory = save.inventory;
        // Merge defaults if needed
    }
    
    el.displayUsername.textContent = GAME.username;
    el.loginScreen.classList.add('hidden');
    el.gameScreen.classList.remove('hidden');
    
    logEvent(`Üdvözöllek, ${GAME.username}! Jó munkát!`);
    
    renderBuildings();
    renderUpgrades();
}

async function saveGame() {
    if (!GAME.username) return;
    
    const saveData = {
        money: GAME.money,
        oil: GAME.oil,
        inventory: GAME.inventory
    };
    
    try {
        await fetch('api/save.php', {
            method: 'POST',
            body: JSON.stringify({
                username: GAME.username,
                save_data: saveData,
                xp_points: GAME.xp.points,
                xp_level: GAME.xp.level
            })
        });
        console.log("Game saved.");
    } catch (e) {
        console.error("Save failed", e);
    }
}

function handleLogout() {
    saveGame().then(() => {
        location.reload();
    });
}

// Start
init();
