import { CONFIG } from './config.js';
import { GAME } from './game-state.js';
import { el } from './utils.js';

// Bejelentkezés kezelése
export async function handleLogin() {
    const user = el.usernameInput.value.trim();
    const pass = el.passwordInput.value;

    // Frontend validálás
    if (!user || !pass) {
        el.loginMsg.textContent = "Felhasználónév és jelszó nem lehet üres";
        el.loginMsg.style.color = "red";
        return false;
    }

    // API hívás
    try {
        const res = await fetch('public/api/login.php', {
            method: 'POST',
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            await loadGame(data.user);
            return true;
        } else {
            el.loginMsg.textContent = data.error;
            el.loginMsg.style.color = "red";
            return false;
        }
    } catch (err) {
        el.loginMsg.textContent = "Hiba a kapcsolódáskor.";
        el.loginMsg.style.color = "red";
        return false;
    }
}

// Regisztráció kezelése
export async function handleRegister() {
    const user = document.getElementById('register-username').value.trim();
    const pass = document.getElementById('register-password').value;
    const registerMsg = document.getElementById('register-msg');

    // Frontend validálás
    if (!user || !pass) {
        registerMsg.textContent = "Felhasználónév és jelszó nem lehet üres";
        registerMsg.style.color = "red";
        return;
    }

    if (user.length < 3) {
        registerMsg.textContent = "Felhasználónév legalább 3 karakter kell legyen";
        registerMsg.style.color = "red";
        return;
    }

    if (pass.length < 4) {
        registerMsg.textContent = "Jelszó legalább 4 karakter kell legyen";
        registerMsg.style.color = "red";
        return;
    }

    // API hívás
    try {
        const res = await fetch('public/api/register.php', {
            method: 'POST',
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            registerMsg.textContent = "Sikeres regisztráció! Jelentkezz be.";
            registerMsg.style.color = "lightgreen";

            // Close popup after 2 seconds
            setTimeout(() => {
                document.getElementById('register-popup').classList.add('hidden');
                document.getElementById('register-username').value = '';
                document.getElementById('register-password').value = '';
                registerMsg.textContent = '';
            }, 2000);
        } else {
            registerMsg.textContent = data.error;
            registerMsg.style.color = "red";
        }
    } catch (err) {
        registerMsg.textContent = "Hiba.";
    }
}

// Játék betöltése szerverről
export async function loadGame(userData) {
    GAME.username = userData.username;
    GAME.xp.level = parseInt(userData.xp_level);
    GAME.xp.points = parseInt(userData.xp_points);

    if (userData.save_data) {
        const save = JSON.parse(userData.save_data);
        if (save.money !== undefined) GAME.money = save.money;
        if (save.oil !== undefined) GAME.oil = save.oil;
        if (save.inventory) {
            // Először biztosítsuk, hogy az összes meglévő épület létezzen a leltárban (az új épületek számára, amelyek nincsenek mentve)
            CONFIG.buildings.forEach(b => {
                if (!GAME.inventory.buildings.hasOwnProperty(b.id)) {
                    GAME.inventory.buildings[b.id] = 0;
                }
            });

            // Ezután egyesítsük a mentett épület darabszámokat
            if (save.inventory.buildings) {
                Object.keys(save.inventory.buildings).forEach(buildingId => {
                    GAME.inventory.buildings[buildingId] = save.inventory.buildings[buildingId];
                });
            }

            // Egyesítsük a mentett upgrade-eket
            if (save.inventory.upgrades) {
                GAME.inventory.upgrades = save.inventory.upgrades;
            }
        }

        // Olajfejlesztések betöltése - egyesítés az alapértékekkel az új fejlesztések kezeléséhez
        if (save.oilUpgrades) {
            GAME.oilUpgrades = {
                canLevel: save.oilUpgrades.canLevel || 0,
                tankCapacityLevel: save.oilUpgrades.tankCapacityLevel || 0,
                hasAutoRefill: save.oilUpgrades.hasAutoRefill || false,
                recyclingLevel: save.oilUpgrades.recyclingLevel || 0
            };
        }

        // Hőmérséklet szint betöltése
        if (save.temperatureLevel !== undefined) {
            GAME.temperatureLevel = save.temperatureLevel;
        }

        // Ostor szint betöltése
        if (save.whipLevel !== undefined) {
            GAME.whipLevel = save.whipLevel;
        }

        // Kritikus csapás szint betöltése
        if (save.critLevel !== undefined) {
            GAME.critLevel = save.critLevel;
        }

        // Recepteskönyv szint betöltése
        if (save.recipeBookLevel !== undefined) {
            GAME.recipeBookLevel = save.recipeBookLevel;
        }
    }

    // UI frissítése
    el.displayUsername.textContent = GAME.username;
    el.loginScreen.classList.add('hidden');
    el.gameScreen.classList.remove('hidden');

    // Megjegyzés: renderBuildings, renderUpgrades, és renderOilUpgrades a main.js-ben lesznek meghívva
}

// Játék mentése szerverre
export async function saveGame() {
    if (!GAME.username) return;

    const saveData = {
        money: GAME.money,
        oil: GAME.oil,
        inventory: GAME.inventory,
        oilUpgrades: GAME.oilUpgrades,
        temperatureLevel: GAME.temperatureLevel,
        whipLevel: GAME.whipLevel,
        critLevel: GAME.critLevel,
        recipeBookLevel: GAME.recipeBookLevel
    };

    // API hívás
    try {
        await fetch('public/api/save.php', {
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

// Kijelentkezés kezelése
export function handleLogout() {
    saveGame().then(() => {
        location.reload();
    });
}
