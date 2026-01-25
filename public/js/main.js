// Fő program belépési pont
import { CONFIG } from './config.js';
import { GAME } from './game-state.js';
import { handleLogin, handleRegister, handleLogout, loadGame, saveGame } from './database.js';
import { gameLoop, handleClick, addXP, navCheck } from './game-mechanics.js';
import * as Shop from './shop.js';
import * as UI from './ui.js';
import { el, switchTab } from './utils.js';

// Alkalmazás inicializálása
function init() {
    // Épület készlet inicializálása
    CONFIG.buildings.forEach(b => GAME.inventory.buildings[b.id] = 0);

    // Eseményfigyelők - Bejelentkezés/Regisztráció
    el.loginBtn.addEventListener('click', async () => {
        const success = await handleLogin();
        if (success) {
            // Re-render after login
            UI.renderBuildings();
            UI.renderUpgrades();
            UI.renderOilUpgrades(Shop.getMaxOilCapacity, Shop.getOilCost);
        }
    });

    // Show register popup
    document.getElementById('btn-show-register').addEventListener('click', () => {
        document.getElementById('register-popup').classList.remove('hidden');
    });

    // Close register popup
    document.getElementById('btn-close-register').addEventListener('click', () => {
        document.getElementById('register-popup').classList.add('hidden');
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-msg').textContent = '';
    });

    // Register button in popup
    document.getElementById('btn-register').addEventListener('click', handleRegister);

    el.logoutBtn.addEventListener('click', handleLogout);

    // Kattintás kezelő
    el.clickerBtn.addEventListener('click', () => {
        handleClick(
            UI.updateUI,
            Shop.getMaxOilCapacity,
            UI.showFloatingText,
            UI.showCritFloatingText,
            UI.showOilFloatingText,
            (amount) => addXP(amount, () => UI.renderOilUpgrades(Shop.getMaxOilCapacity, Shop.getOilCost), UI.renderBuildings, UI.renderUpgrades),
            Shop.getOilCost
        );
    });

    // Tab váltás
    el.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    // Játék ciklus indítása (100ms intervallumok)
    setInterval(() => {
        gameLoop(
            (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
            UI.renderBuildings,
            Shop.getMaxOilCapacity,
            () => Shop.buyOil(
                (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
                Shop.trackSpending
            )
        );
    }, 100);

    // NAV ellenőrzés percenként
    setInterval(navCheck, 60000);

    // Automatikus mentés 30 másodpercenként
    setInterval(saveGame, 30000);
}

// A bolt funkciók globálisan elérhetővé tétele a HTML onclick kezelőkhöz
// Ez egy megoldás, mivel az inline onclick nem fér hozzá a modulokhoz
window.buyBuilding = (id) => Shop.buyBuilding(id, UI.renderBuildings, Shop.trackSpending);
window.buyUpgrade = (id) => Shop.buyUpgrade(id, UI.renderUpgrades, Shop.trackSpending);
window.buyTemperatureUpgrade = () => Shop.buyTemperatureUpgrade(
    UI.renderUpgrades,
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyWhipUpgrade = () => Shop.buyWhipUpgrade(
    UI.renderUpgrades,
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyCritUpgrade = () => Shop.buyCritUpgrade(
    UI.renderUpgrades,
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyRecipeBookUpgrade = () => Shop.buyRecipeBookUpgrade(
    UI.renderUpgrades,
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyOil = () => Shop.buyOil(
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyTankCapacityUpgrade = () => Shop.buyTankCapacityUpgrade(
    () => UI.renderOilUpgrades(Shop.getMaxOilCapacity, Shop.getOilCost),
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyAutoRefill = () => Shop.buyAutoRefill(
    () => UI.renderOilUpgrades(Shop.getMaxOilCapacity, Shop.getOilCost),
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);
window.buyRecycling = () => Shop.buyRecycling(
    () => UI.renderOilUpgrades(Shop.getMaxOilCapacity, Shop.getOilCost),
    (oilConsumption) => UI.updateUI(oilConsumption, Shop.getMaxOilCapacity, Shop.getOilCost),
    Shop.trackSpending
);

/*
* Teszteléshez "Csalások"

Pénz, XP, Olaj:
GAME.money = 30000
GAME.xp.level = 50
GAME.oil = 100

Helperek:
GAME.inventory.buildings.baker = 10
GAME.inventory.buildings.gordon_ramsay = 10

UPGRADE:
GAME.temperatureLevel = 8
GAME.critLevel = 10
GAME.whipLevel = 3

UI Frissítés ha kéne:
UI.updateUI(0, Shop.getMaxOilCapacity, Shop.getOilCost)
UI.renderBuildings()
*/


window.GAME = GAME;
window.CONFIG = CONFIG;
window.Shop = Shop;
window.UI = UI;

// Indítás
init();
