// ============================================
// СОРТИРОВКА И ПОДСВЕТКА ТОП-3
// ============================================

// Текущее состояние
let currentSort = 'none'; // 'none', 'desc', 'asc', 'alpha'
let highlightEnabled = true; // Подсветка включена/выключена

// Функция подсветки топ-3 (работает всегда, независимо от сортировки)
function highlightTop3() {
    const rows = document.querySelectorAll('tbody tr');
    
    // Сначала убираем все классы подсветки
    rows.forEach(row => {
        row.classList.remove('score-gold', 'score-silver', 'score-bronze');
    });
    
    // Если подсветка выключена - ничего не делаем
    if (!highlightEnabled) return;
    
    // Создаем массив строк с их суммами
    const rowsWithScores = Array.from(rows).map(row => {
        const grandTotal = row.querySelector('td.grand-total');
        const score = grandTotal ? parseFloat(grandTotal.textContent.replace(',', '.') || '0') : 0;
        return { row, score };
    });
    
    // Сортируем по убыванию для определения топ-3
    rowsWithScores.sort((a, b) => b.score - a.score);
    
    // Подсвечиваем топ-3
    if (rowsWithScores.length >= 1) {
        rowsWithScores[0].row.classList.add('score-gold');
    }
    if (rowsWithScores.length >= 2) {
        rowsWithScores[1].row.classList.add('score-silver');
    }
    if (rowsWithScores.length >= 3) {
        rowsWithScores[2].row.classList.add('score-bronze');
    }
}

// Функция сортировки (не влияет на подсветку)
function sortPlayers(type) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    switch(type) {
        case 'desc': // По убыванию (сначала лучшие)
            rows.sort((a, b) => {
                const scoreA = parseFloat(a.querySelector('td.grand-total').textContent.replace(',', '.') || '0');
                const scoreB = parseFloat(b.querySelector('td.grand-total').textContent.replace(',', '.') || '0');
                return scoreB - scoreA;
            });
            currentSort = 'desc';
            break;
            
        case 'asc': // По возрастанию (сначала худшие)
            rows.sort((a, b) => {
                const scoreA = parseFloat(a.querySelector('td.grand-total').textContent.replace(',', '.') || '0');
                const scoreB = parseFloat(b.querySelector('td.grand-total').textContent.replace(',', '.') || '0');
                return scoreA - scoreB;
            });
            currentSort = 'asc';
            break;
            
        case 'alpha': // По алфавиту
            rows.sort((a, b) => {
                const nameA = a.querySelector('td.player-name').innerText.trim();
                const nameB = b.querySelector('td.player-name').innerText.trim();
                return nameA.localeCompare(nameB);
            });
            currentSort = 'alpha';
            break;
            
        case 'none': // Исходный порядок (по алфавиту)
            rows.sort((a, b) => {
                const nameA = a.querySelector('td.player-name').innerText.trim();
                const nameB = b.querySelector('td.player-name').innerText.trim();
                return nameA.localeCompare(nameB);
            });
            currentSort = 'none';
            break;
    }
    
    // Перестраиваем таблицу
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    
    // Подсвечиваем топ-3 (независимо от сортировки)
    highlightTop3();
    
    // Обновляем активные кнопки
    updateActiveButtons();
    
    console.log(`Сортировка: ${type}`);
}

// Переключение подсветки
function toggleHighlight() {
    highlightEnabled = !highlightEnabled;
    
    if (highlightEnabled) {
        highlightTop3();
    } else {
        // Убираем всю подсветку
        document.querySelectorAll('tbody tr').forEach(row => {
            row.classList.remove('score-gold', 'score-silver', 'score-bronze');
        });
    }
    
    // Обновляем текст кнопки
    const highlightBtn = document.getElementById('toggleHighlightBtn');
    if (highlightBtn) {
        highlightBtn.innerHTML = highlightEnabled ? 
            '<i class="fas fa-eye"></i> Скрыть подсветку' : 
            '<i class="fas fa-eye-slash"></i> Показать подсветку';
    }
    
    console.log(`Подсветка ${highlightEnabled ? 'включена' : 'выключена'}`);
}

// Обновление активных кнопок
function updateActiveButtons() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sort === currentSort) {
            btn.classList.add('active');
        }
    });
}

// Функция для добавления панели сортировки
function addSortPanel() {
    const footer = document.querySelector('.tournament-footer');
    if (!footer) return;
    
    // Проверяем, не добавлена ли уже панель
    if (document.querySelector('.sort-panel')) return;
    
    const panel = document.createElement('div');
    panel.className = 'sort-panel';
    panel.style.marginTop = '20px';
    panel.style.padding = '15px';
    panel.style.background = '#f8fafc';
    panel.style.borderRadius = '30px';
    panel.style.display = 'flex';
    panel.style.flexWrap = 'wrap';
    panel.style.gap = '10px';
    panel.style.justifyContent = 'center';
    panel.style.alignItems = 'center';
    
    panel.innerHTML = `
        <span style="color: #4b5563; font-weight: 500; margin-right: 5px;">
            <i class="fas fa-sort"></i> Сортировка:
        </span>
        <button class="sort-btn" data-sort="none" style="background: #0F9D58; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-undo"></i> Исходный
        </button>
        <button class="sort-btn" data-sort="desc" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-sort-amount-down-alt"></i> По убыванию
        </button>
        <button class="sort-btn" data-sort="asc" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-sort-amount-up-alt"></i> По возрастанию
        </button>
        <button class="sort-btn" data-sort="alpha" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fas fa-sort-alpha-down"></i> По алфавиту
        </button>
        <button id="toggleHighlightBtn" style="background: #8B5CF6; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; margin-left: 10px;">
            <i class="fas fa-eye"></i> Скрыть подсветку
        </button>
    `;
    
    footer.parentNode.insertBefore(panel, footer.nextSibling);
    
    // Добавляем обработчики
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => sortPlayers(btn.dataset.sort));
    });
    
    document.getElementById('toggleHighlightBtn').addEventListener('click', toggleHighlight);
    
    // Активируем кнопку "Исходный" по умолчанию
    setTimeout(() => {
        document.querySelector('[data-sort="none"]').classList.add('active');
    }, 100);
    
    // Добавляем стили для кнопок и подсветки
    const style = document.createElement('style');
    style.textContent = `
        .sort-btn, #toggleHighlightBtn {
            transition: all 0.2s ease;
            font-size: 0.95em;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .sort-btn:hover, #toggleHighlightBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            opacity: 0.9;
        }
        .sort-btn.active {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(15, 157, 88, 0.3);
            background: #0F9D58 !important;
        }
        /* Стили для подсветки топ-3 */
        tr.score-gold {
            background: linear-gradient(90deg, #FFD700, #FDB931) !important;
            border-left: 5px solid #B8860B;
        }
        tr.score-gold td:first-child {
            background: linear-gradient(90deg, #FFD700, #FDB931) !important;
        }
        tr.score-silver {
            background: linear-gradient(90deg, #E8E8E8, #D3D3D3) !important;
            border-left: 5px solid #808080;
        }
        tr.score-silver td:first-child {
            background: linear-gradient(90deg, #E8E8E8, #D3D3D3) !important;
        }
        tr.score-bronze {
            background: linear-gradient(90deg, #F4A460, #E9967A) !important;
            border-left: 5px solid #8B4513;
        }
        tr.score-bronze td:first-child {
            background: linear-gradient(90deg, #F4A460, #E9967A) !important;
        }
    `;
    document.head.appendChild(style);
}

// Обновляем функцию подсчета итогов, чтобы после пересчета обновлять подсветку
const originalCalculateAllTotals = calculateAllTotals;
calculateAllTotals = function() {
    originalCalculateAllTotals();
    setTimeout(() => {
        highlightTop3(); // Подсвечиваем топ-3 после пересчета
    }, 100);
};

// Добавляем панель сортировки после загрузки
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSortPanel, 500);
});

// Экспортируем функции в глобальную область
window.highlightTop3 = highlightTop3;
window.toggleHighlight = toggleHighlight;
window.sortPlayers = sortPlayers;