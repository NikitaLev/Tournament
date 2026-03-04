// Конфигурация
const FIRST_KILL_THRESHOLD = 0.4; // 40% для расчета Ci

// Маппинг ролей
const ROLE_ICONS = {
    'д': 'fas fa-hat-cowboy', // Дон - звезда (как шериф)
    'ш': 'fas fa-star', // Шериф - звезда
    'м': 'fas fa-gun',  // Мафия - пистолет
    '': '' // Мирный - без иконки
};

// Хранилище данных
let playersData = {};
let gameCount = 0;
let sheetNames = [];

// Загрузка данных из JSON
async function loadFromJSON() {
    console.log('Загрузка данных из data.json...');
    
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        gameCount = data.games.length;
        sheetNames = data.games.map(g => g.name);
        
        console.log(`✅ Загружено ${gameCount} игр`);
        console.log('📊 Игры:', sheetNames);
        
        // Очищаем данные
        playersData = {};
        
        // Обрабатываем каждую игру
        data.games.forEach((game, gameIndex) => {
            processGameData(game.players, gameIndex, game.name);
        });
        
        // Рассчитываем Ci
        calculateCiForAllPlayers();
        
        // Создаем и заполняем таблицу
        createDynamicTable();
        updateTableFromData();
        
        console.log('🎉 Данные успешно загружены и обработаны');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        alert('Ошибка загрузки данных.json. Убедитесь, что файл существует.');
        return false;
    }
}

// Функция для обработки данных одной игры
function processGameData(gamePlayers, gameIndex, sheetName) {
    gamePlayers.forEach(playerData => {
        const nickname = playerData.nickname;
        
        // Инициализируем данные игрока если нужно
        if (!playersData[nickname]) {
            playersData[nickname] = {
                name: nickname,
                games: [],
                firstKillGames: [],
                totalMain: 0,
                totalBonus: 0,
                totalCi: 0
            };
        }
        
        // Сохраняем данные для игры
        playersData[nickname].games[gameIndex] = {
            main: playerData.main_score || 0,
            bonus: playerData.bonus_score || 0,
            ci: 0,
            role: playerData.role || '',
            sheetName: sheetName
        };
        
        // Учитываем первый отстрел для Ci
        if (playerData.first_shot) {
            playersData[nickname].firstKillGames.push(gameIndex);
        }
    });
}

// Функция для расчета Ci
function calculateCiForAllPlayers() {
    const thresholdGames = Math.ceil(gameCount * FIRST_KILL_THRESHOLD);
    
    Object.keys(playersData).forEach(nickname => {
        const player = playersData[nickname];
        const firstKills = player.firstKillGames.length;
        let ciValue = 0;
        
        if (firstKills > thresholdGames) {
            ciValue = 0.6;
        } else if (firstKills > 0) {
            ciValue = (firstKills * 0.6) / thresholdGames;
        }
        
        ciValue = Math.round(ciValue * 1000) / 1000;
        
        // Добавляем Ci в игры, где был первый отстрел
        player.firstKillGames.forEach(gameIndex => {
            if (player.games[gameIndex]) {
                player.games[gameIndex].ci = ciValue;
            }
        });
        
        player.totalCi = ciValue;
    });
}

// Функция для динамического создания таблицы
function createDynamicTable() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;
    
    const table = document.createElement('table');
    table.className = 'results-table';
    
    const thead = document.createElement('thead');
    
    // Первая строка заголовка
    const headerRow1 = document.createElement('tr');
    
    const thPlayer = document.createElement('th');
    thPlayer.textContent = 'Игрок';
    thPlayer.rowSpan = 2;
    headerRow1.appendChild(thPlayer);
    
    // Колонки для каждой игры
    for (let i = 1; i <= gameCount; i++) {
        const th = document.createElement('th');
        th.colSpan = 2;
        th.textContent = sheetNames[i-1] || `Игра ${i}`;
        headerRow1.appendChild(th);
    }
    
    // Итоговые колонки
    const thTotalMain = document.createElement('th');
    thTotalMain.textContent = 'Осн';
    thTotalMain.rowSpan = 2;
    headerRow1.appendChild(thTotalMain);
    
    const thTotalBonus = document.createElement('th');
    thTotalBonus.textContent = 'Бон';
    thTotalBonus.rowSpan = 2;
    headerRow1.appendChild(thTotalBonus);
    
    const thTotalCi = document.createElement('th');
    thTotalCi.textContent = 'Σ Ci';
    thTotalCi.rowSpan = 2;
    headerRow1.appendChild(thTotalCi);
    
    const thGrandTotal = document.createElement('th');
    thGrandTotal.textContent = 'Всего';
    thGrandTotal.rowSpan = 2;
    headerRow1.appendChild(thGrandTotal);
    
    thead.appendChild(headerRow1);
    
    // Вторая строка заголовка
    const headerRow2 = document.createElement('tr');
    headerRow2.className = 'sub-header';
    
    for (let i = 1; i <= gameCount; i++) {
        const thMain = document.createElement('th');
        thMain.textContent = 'осн';
        headerRow2.appendChild(thMain);
        
        const thBonus = document.createElement('th');
        thBonus.textContent = 'бон';
        headerRow2.appendChild(thBonus);
    }
    
    thead.appendChild(headerRow2);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    tableWrapper.innerHTML = '';
    tableWrapper.appendChild(table);
}

// Функция для обновления таблицы данными
function updateTableFromData() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const players = Object.values(playersData).sort((a, b) => a.name.localeCompare(b.name));
    
    players.forEach(player => {
        const row = document.createElement('tr');
        
        // Имя игрока
        const nameCell = document.createElement('td');
        nameCell.className = 'player-name';
        nameCell.innerHTML = `<i class="fas fa-user"></i> ${player.name}`;
        row.appendChild(nameCell);
        
        // Данные по играм
        for (let game = 0; game < gameCount; game++) {
            const gameData = player.games[game] || { main: 0, bonus: 0, role: '' };
            
            const mainCell = document.createElement('td');
            mainCell.className = 'score-main';
            if (gameData.role && ROLE_ICONS[gameData.role]) {
                mainCell.innerHTML = `<i class="${ROLE_ICONS[gameData.role]}"></i>${formatNumber(gameData.main)}`;
            } else {
                mainCell.textContent = formatNumber(gameData.main);
            }
            row.appendChild(mainCell);
            
            const bonusCell = document.createElement('td');
            bonusCell.className = 'score-bonus';
            
            let bonusText = formatNumber(gameData.bonus);
            
            if (gameData.ci > 0) {
                bonusCell.innerHTML = `${bonusText} <span class="ci-badge">${formatCi(gameData.ci)}</span>`;
            } else {
                bonusCell.textContent = bonusText;
            }
            
            row.appendChild(bonusCell);
        }
        
        // Подсчет итогов
        let totalMain = 0;
        let totalBonus = 0;
        let totalCi = 0;
        
        player.games.forEach(game => {
            totalMain += game.main || 0;
            totalBonus += game.bonus || 0;
            totalCi += game.ci || 0;
        });
        
        const totalMainCell = document.createElement('td');
        totalMainCell.className = 'total-main';
        totalMainCell.textContent = formatNumber(totalMain);
        row.appendChild(totalMainCell);
        
        const totalBonusCell = document.createElement('td');
        totalBonusCell.className = 'total-bonus';
        totalBonusCell.textContent = formatNumber(totalBonus);
        row.appendChild(totalBonusCell);
        
        const totalCiCell = document.createElement('td');
        totalCiCell.className = 'total-ci';
        totalCiCell.textContent = formatCi(totalCi);
        row.appendChild(totalCiCell);
        
        const grandTotalCell = document.createElement('td');
        grandTotalCell.className = 'grand-total';
        grandTotalCell.textContent = formatNumber(totalMain + totalBonus + totalCi);
        row.appendChild(grandTotalCell);
        
        tbody.appendChild(row);
    });
    
    updateFooterStats();
}

// Форматирование чисел
function formatNumber(num) {
    if (num === 0) return '0';
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toFixed(2).replace('.', ',');
}

function formatCi(num) {
    if (num === 0) return '0';
    if (Math.abs(num) < 0.1) {
        return num.toFixed(3).replace('.', ',');
    }
    return num.toFixed(2).replace('.', ',');
}

// Обновление статистики
function updateFooterStats() {
    const grandTotalCells = document.querySelectorAll('td.grand-total');
    let maxTotal = -Infinity;
    let winners = [];
    
    grandTotalCells.forEach(cell => {
        const cellText = cell.textContent.replace(',', '.');
        const value = parseFloat(cellText);
        if (!isNaN(value) && value > maxTotal) {
            maxTotal = value;
        }
    });
    
    grandTotalCells.forEach(cell => {
        const cellText = cell.textContent.replace(',', '.');
        const value = parseFloat(cellText);
        if (Math.abs(value - maxTotal) < 0.001) {
            const row = cell.closest('tr');
            const nameCell = row.querySelector('td.player-name');
            if (nameCell) {
                const name = nameCell.innerText || nameCell.textContent;
                winners.push(name.trim());
            }
        }
    });
    
    const maxScoreSpan = document.querySelector('.stats-item .manual-stat');
    const winnerSpan = document.querySelector('.stats-item:last-child .manual-stat');
    
    if (maxScoreSpan) {
        maxScoreSpan.textContent = formatNumber(maxTotal);
    }
    if (winnerSpan) {
        winnerSpan.textContent = winners.join(', ');
    }
}

// Функция для добавления кнопки загрузки
function addLoadButton() {
    const footer = document.querySelector('.tournament-footer');
    if (!footer) return;
    
    const button = document.createElement('button');
    button.className = 'btn-load';
    button.innerHTML = '<i class="fas fa-sync-alt"></i> Загрузить данные';
    button.onclick = loadFromJSON;
    
    button.style.background = '#0F9D58';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px 20px';
    button.style.borderRadius = '30px';
    button.style.marginLeft = '10px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '0.95em';
    
    footer.appendChild(button);
}

// Автоматическая загрузка при старте
document.addEventListener('DOMContentLoaded', function() {
    loadFromJSON();
    setTimeout(addLoadButton, 500);
});

// Для ручной загрузки из консоли
window.reloadData = loadFromJSON;