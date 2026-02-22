// Функция для обновления всех сумм в таблице
function calculateAllTotals() {
    console.log('Пересчет сумм...');
    
    // Находим все строки с игроками (все tr в tbody)
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach((row, index) => {
        // Находим все ячейки с основными баллами (score-main) в этой строке
        const mainCells = row.querySelectorAll('td.score-main');
        // Находим все ячейки с бонусными баллами (score-bonus) в этой строке
        const bonusCells = row.querySelectorAll('td.score-bonus');
        
        let totalMain = 0;
        let totalBonus = 0;
        
        // Считаем основные баллы
        mainCells.forEach(cell => {
            // Извлекаем число из текста ячейки (игнорируем иконки)
            const cellText = cell.innerText || cell.textContent;
            // Ищем первое число в тексте (на случай если есть иконка)
            const numberMatch = cellText.match(/\d+/);
            if (numberMatch) {
                totalMain += parseInt(numberMatch[0], 10);
            }
        });
        
        // Считаем бонусные баллы
        bonusCells.forEach(cell => {
            const cellText = cell.innerText || cell.textContent;
            const numberMatch = cellText.match(/\d+/);
            if (numberMatch) {
                totalBonus += parseInt(numberMatch[0], 10);
            }
        });
        
        // Находим итоговые ячейки в этой строке
        const totalMainCell = row.querySelector('td.total-main');
        const totalBonusCell = row.querySelector('td.total-bonus');
        const grandTotalCell = row.querySelector('td.grand-total');
        
        // Обновляем значения
        if (totalMainCell) {
            totalMainCell.textContent = totalMain;
        }
        if (totalBonusCell) {
            totalBonusCell.textContent = totalBonus;
        }
        if (grandTotalCell) {
            grandTotalCell.textContent = totalMain + totalBonus;
        }
        
        // Для отладки (можно убрать)
        console.log(`Игрок ${index + 1}: осн=${totalMain}, бон=${totalBonus}, всего=${totalMain + totalBonus}`);
    });
    
    // Обновляем статистику в подвале
    updateFooterStats();
}

// Функция для обновления статистики в подвале
function updateFooterStats() {
    // Находим все итоговые ячейки
    const grandTotalCells = document.querySelectorAll('td.grand-total');
    let maxTotal = -Infinity;
    let winners = [];
    
    // Находим максимальную сумму
    grandTotalCells.forEach(cell => {
        const value = parseInt(cell.textContent, 10);
        if (value > maxTotal) {
            maxTotal = value;
        }
    });
    
    // Находим всех игроков с максимальной суммой
    grandTotalCells.forEach((cell, index) => {
        const value = parseInt(cell.textContent, 10);
        if (value === maxTotal) {
            // Получаем имя игрока из первой ячейки в этой строке
            const row = cell.closest('tr');
            const nameCell = row.querySelector('td.player-name');
            if (nameCell) {
                const name = nameCell.innerText || nameCell.textContent;
                winners.push(name.trim());
            }
        }
    });
    
    // Обновляем отображение в подвале
    const maxScoreSpan = document.querySelector('.stats-item .manual-stat');
    const winnerSpan = document.querySelector('.stats-item:last-child .manual-stat');
    
    if (maxScoreSpan) {
        maxScoreSpan.textContent = maxTotal;
    }
    if (winnerSpan) {
        winnerSpan.textContent = winners.join(', ');
    }
}

// Функция для очистки иконок из ячеек (если нужно)
function cleanCellIcons() {
    const mainCells = document.querySelectorAll('td.score-main');
    const bonusCells = document.querySelectorAll('td.score-bonus');
    
    // Обрабатываем ячейки с основными баллами
    mainCells.forEach(cell => {
        const html = cell.innerHTML;
        // Если есть иконка, оставляем только число
        if (html.includes('<i')) {
            const numberMatch = html.match(/\d+/);
            if (numberMatch) {
                cell.innerHTML = numberMatch[0];
            }
        }
    });
    
    // Обрабатываем ячейки с бонусными баллами
    bonusCells.forEach(cell => {
        const html = cell.innerHTML;
        if (html.includes('<i')) {
            const numberMatch = html.match(/\d+/);
            if (numberMatch) {
                cell.innerHTML = numberMatch[0];
            }
        }
    });
}

// Функция для добавления иконок обратно (если нужно)
function addRoleIcons() {
    // Здесь можно добавить логику для расстановки иконок по ролям
    // Но пока оставим как есть
}

// Функция для форматирования чисел (добавляет ведущие нули и т.д.)
function formatNumber(num) {
    return num.toString();
}

// Автоматический пересчет при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, начинаем расчет...');
    calculateAllTotals();
});

// Функция для ручного пересчета (можно вызвать из консоли)
window.recalculate = function() {
    calculateAllTotals();
};

// Функция для проверки конкретного игрока
window.checkPlayer = function(playerNumber) {
    // playerNumber от 1 до 10
    const rows = document.querySelectorAll('tbody tr');
    if (playerNumber >= 1 && playerNumber <= rows.length) {
        const row = rows[playerNumber - 1];
        const mainCells = row.querySelectorAll('td.score-main');
        const bonusCells = row.querySelectorAll('td.score-bonus');
        
        console.log(`=== Игрок ${playerNumber} ===`);
        console.log('Основные баллы:');
        mainCells.forEach((cell, i) => {
            console.log(`  Игра ${i+1}: ${cell.innerText}`);
        });
        console.log('Бонусные баллы:');
        bonusCells.forEach((cell, i) => {
            console.log(`  Игра ${i+1}: ${cell.innerText}`);
        });
    }
};

// Функция для экспорта данных в CSV
window.exportToCSV = function() {
    const rows = document.querySelectorAll('tbody tr');
    let csv = 'Игрок,';
    
    // Заголовки для игр
    for (let i = 1; i <= 10; i++) {
        csv += `Игра ${i} осн,Игра ${i} бон,`;
    }
    csv += 'Всего осн,Всего бон,Всего\n';
    
    // Данные игроков
    rows.forEach(row => {
        // Имя игрока
        const nameCell = row.querySelector('td.player-name');
        let name = nameCell ? (nameCell.innerText || nameCell.textContent).trim() : 'Неизвестный';
        csv += `"${name}",`;
        
        // Основные и бонусные баллы по играм
        const mainCells = row.querySelectorAll('td.score-main');
        const bonusCells = row.querySelectorAll('td.score-bonus');
        
        for (let i = 0; i < 10; i++) {
            const mainVal = mainCells[i] ? (mainCells[i].innerText || mainCells[i].textContent).match(/\d+/)[0] : '0';
            const bonusVal = bonusCells[i] ? (bonusCells[i].innerText || bonusCells[i].textContent).match(/\d+/)[0] : '0';
            csv += `${mainVal},${bonusVal},`;
        }
        
        // Итоги
        const totalMain = row.querySelector('td.total-main')?.textContent || '0';
        const totalBonus = row.querySelector('td.total-bonus')?.textContent || '0';
        const grandTotal = row.querySelector('td.grand-total')?.textContent || '0';
        
        csv += `${totalMain},${totalBonus},${grandTotal}\n`;
    });
    
    console.log('=== CSV данные ===');
    console.log(csv);
    
    // Создаем ссылку для скачивания
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'турнир_мафия.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return csv;
};

// Добавляем кнопку для пересчета (опционально)
function addRecalcButton() {
    const footer = document.querySelector('.tournament-footer');
    if (footer) {
        const button = document.createElement('button');
        button.className = 'btn-recalculate';
        button.innerHTML = '<i class="fas fa-calculator"></i> Пересчитать суммы';
        button.onclick = calculateAllTotals;
        
        // Стили для кнопки
        button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '10px 20px';
        button.style.borderRadius = '30px';
        button.style.fontSize = '0.95em';
        button.style.fontWeight = '500';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.gap = '8px';
        button.style.transition = 'all 0.3s';
        
        button.onmouseover = function() {
            this.style.opacity = '0.9';
            this.style.transform = 'scale(1.02)';
        };
        
        button.onmouseout = function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        };
        
        footer.appendChild(button);
    }
}

// Добавляем кнопку после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addRecalcButton, 100); // Небольшая задержка для гарантии
});