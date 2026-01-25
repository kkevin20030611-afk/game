// DOM elemek
export const el = {
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
    lpcCounter: document.getElementById('lpc-counter'),
    lpsCounter: document.getElementById('lps-counter'),
    clickerBtn: document.getElementById('btn-clicker'),
    oilBar: document.getElementById('oil-bar-fill'),
    oilText: document.getElementById('oil-percentage'),
    xpText: document.getElementById('xp-text'),

    eventLog: document.getElementById('event-log'),

    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    buildingsList: document.getElementById('tab-buildings'),
    upgradesList: document.getElementById('tab-upgrades')
};

export function formatNum(n) {
    return n.toLocaleString('hu-HU', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export function logEvent(msg) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span>[${time}]</span> ${msg}`;
    el.eventLog.insertBefore(div, el.eventLog.firstChild);
}

// TAB váltás
export function switchTab(tabId) {
    el.tabContents.forEach(content => content.classList.remove('active'));
    el.tabBtns.forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.target.classList.add('active');
}
