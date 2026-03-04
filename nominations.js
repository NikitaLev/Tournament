// ============================================
// НОМИНАЦИИ ТУРНИРА - ЗАГРУЗКА И ОТОБРАЖЕНИЕ
// ============================================

// Глобальная переменная для хранения данных номинаций
let nominationsData = null;

// Функция для загрузки номинаций из JSON
async function loadNominations() {
    try {
        console.log('🏆 Загрузка номинаций...');
        const response = await fetch('data.json');
        const data = await response.json();
        
        if (data.nominations) {
            nominationsData = data.nominations;
            displayNominations(nominationsData);
            console.log('✅ Номинации загружены:', nominationsData);
        } else {
            console.warn('⚠️ В данных нет номинаций');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки номинаций:', error);
    }
}

// Функция для отображения карточек номинаций
function displayNominations(nominations) {
    const grid = document.getElementById('nominationsGrid');
    if (!grid) return;
    
    const nomConfigs = [
        {
            key: 'best_don',
            title: 'Лучший Дон',
            icon: 'fas fa-crown',
            iconClass: 'don',
            color: 'gold'
        },
        {
            key: 'best_sheriff',
            title: 'Лучший Шериф',
            icon: 'fas fa-star',
            iconClass: 'sheriff',
            color: '#3b82f6'
        },
        {
            key: 'best_mafia',
            title: 'Лучший Мафия',
            icon: 'fas fa-gun',
            iconClass: 'mafia',
            color: '#ef4444'
        },
        {
            key: 'best_civil',
            title: 'Лучший Мирный',
            icon: 'fas fa-user',
            iconClass: 'civil',
            color: '#6b7280'
        }
    ];
    
    let html = '';
    
    nomConfigs.forEach(config => {
        const nom = nominations[config.key];
        
        if (nom && nom.player) {
            html += `
                <div class="nomination-card" onclick="showNominationDetails('${config.key}')">
                    <div class="nomination-icon ${config.iconClass}">
                        <i class="${config.icon}" style="color: ${config.color}"></i>
                    </div>
                    <div class="nomination-title">${config.title}</div>
                    <div class="nomination-player">${nom.player}</div>
                    <div class="nomination-score">${nom.total_score} очков</div>
                    <div class="nomination-stats">
                        <span><i class="fas fa-gamepad"></i> ${nom.games_count} игр</span>
                        <span><i class="fas fa-chart-line"></i> ${(nom.total_score / nom.games_count).toFixed(2)} ср.</span>
                    </div>
                    <button class="view-details-btn" onclick="event.stopPropagation(); showNominationDetails('${config.key}')">
                        <i class="fas fa-info-circle"></i> Подробнее
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="nomination-card">
                    <div class="nomination-icon ${config.iconClass}">
                        <i class="${config.icon}" style="color: ${config.color}"></i>
                    </div>
                    <div class="nomination-title">${config.title}</div>
                    <div class="nomination-empty">Нет номинантов</div>
                </div>
            `;
        }
    });
    
    grid.innerHTML = html;
}

// Функция для отображения деталей номинации в модальном окне
function showNominationDetails(nomKey) {
    if (!nominationsData || !nominationsData[nomKey] || !nominationsData[nomKey].player) {
        alert('Нет данных для этой номинации');
        return;
    }
    
    const nom = nominationsData[nomKey];
    const modal = document.getElementById('nominationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Настройки для разных номинаций
    const nomTitles = {
        'best_don': { title: 'Лучший Дон', icon: '👑' },
        'best_sheriff': { title: 'Лучший Шериф', icon: '⭐' },
        'best_mafia': { title: 'Лучший Мафия', icon: '🔫' },
        'best_civil': { title: 'Лучший Мирный', icon: '👤' }
    };
    
    const titleInfo = nomTitles[nomKey] || { title: 'Номинация', icon: '🏆' };
    modalTitle.innerHTML = `${titleInfo.icon} ${titleInfo.title}`;
    
    // Формируем содержимое модального окна
    let gamesHtml = '';
    
    if (nom.games_details && nom.games_details.length > 0) {
        // Сортируем игры по убыванию баллов (сначала лучшие)
        const sortedGames = [...nom.games_details].sort((a, b) => b.score - a.score);
        
        gamesHtml = '<div class="games-list">';
        sortedGames.forEach((game, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
            gamesHtml += `
                <div class="game-detail-card">
                    <div class="game-info">
                        <h4>${medal} Игра ${game.game}</h4>
                        <p>Место: ${game.place} | Команда: ${game.winning_team || 'не указана'}</p>
                    </div>
                    <div class="game-score">
                        <span class="main-score">${game.score} очков</span>
                        <span class="bonus-score">осн: ${game.main} / бон: ${game.bonus}</span>
                    </div>
                </div>
            `;
        });
        gamesHtml += '</div>';
    } else {
        gamesHtml = '<p class="nomination-empty">Нет детальной информации по играм</p>';
    }
    
    modalBody.innerHTML = `
        <div class="player-summary">
            <h3>${nom.player}</h3>
            <p>Всего очков: <strong>${nom.total_score}</strong> (${nom.games_count} игр)</p>
            <p>Средний балл: <strong>${(nom.total_score / nom.games_count).toFixed(2)}</strong></p>
        </div>
        <h4 style="margin: 20px 0 10px 0; color: #4b5563;">📊 Игры по убыванию результата:</h4>
        ${gamesHtml}
    `;
    
    // Показываем модальное окно
    modal.style.display = 'block';
}

// Закрытие модального окна
document.addEventListener('DOMContentLoaded', function() {
    // Создаем обработчик для закрытия модального окна
    const modal = document.getElementById('nominationModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Загружаем номинации после загрузки страницы
    setTimeout(loadNominations, 800);
});

// Функция для ручного обновления номинаций
window.refreshNominations = function() {
    loadNominations();
};

// Добавляем кнопку обновления номинаций
function addNominationsRefreshButton() {
    const footer = document.querySelector('.tournament-footer');
    if (!footer) return;
    
    const btn = document.createElement('button');
    btn.className = 'refresh-nominations-btn';
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить номинации';
    btn.onclick = loadNominations;
    btn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '10px 20px';
    btn.style.borderRadius = '30px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '0.95em';
    btn.style.marginLeft = '10px';
    btn.style.transition = 'all 0.2s';
    
    btn.onmouseover = function() {
        this.style.opacity = '0.9';
        this.style.transform = 'scale(1.02)';
    };
    
    btn.onmouseout = function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    };
    
    footer.appendChild(btn);
}

// Добавляем кнопку после загрузки
setTimeout(addNominationsRefreshButton, 1200);