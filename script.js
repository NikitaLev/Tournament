function calculateAllTotals() {
    console.log('Пересчет сумм (поддержка дробных и отрицательных)...');
    
    // Находим все строки с игроками (все tr в tbody)
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach((row, index) => {
        // Находим все ячейки с основными баллами (score-main) в этой строке
        const mainCells = row.querySelectorAll('td.score-main');
        // Находим все ячейки с бонусными баллами (score-bonus) в этой строке
        const bonusCells = row.querySelectorAll('td.score-bonus');
        
        let totalMain = 0;
        let totalBonus = 0;
        
        // Считаем основные баллы (с поддержкой дробных и отрицательных)
        mainCells.forEach(cell => {
            const cellText = cell.innerText || cell.textContent;
            // Ищем число (целое или дробное, может быть с минусом)
            const numberMatch = cellText.match(/-?\d+[,.]?\d*/);
            if (numberMatch) {
                const value = parseFloat(numberMatch[0].replace(',', '.'));
                if (!isNaN(value)) {
                    totalMain += value;
                }
            }
        });
        
        // Считаем бонусные баллы (с поддержкой дробных и отрицательных)
        bonusCells.forEach(cell => {
            const cellText = cell.innerText || cell.textContent;
            const numberMatch = cellText.match(/-?\d+[,.]?\d*/);
            if (numberMatch) {
                const value = parseFloat(numberMatch[0].replace(',', '.'));
                if (!isNaN(value)) {
                    totalBonus += value;
                }
            }
        });
        
        // Округляем до двух знаков после запятой
        totalMain = Math.round(totalMain * 100) / 100;
        totalBonus = Math.round(totalBonus * 100) / 100;
        const grandTotal = Math.round((totalMain + totalBonus) * 100) / 100;
        
        // Находим итоговые ячейки
        const totalMainCell = row.querySelector('td.total-main');
        const totalBonusCell = row.querySelector('td.total-bonus');
        const grandTotalCell = row.querySelector('td.grand-total');
        
        // Обновляем значения
        if (totalMainCell) {
            totalMainCell.textContent = formatNumber(totalMain);
        }
        if (totalBonusCell) {
            totalBonusCell.textContent = formatNumber(totalBonus);
        }
        if (grandTotalCell) {
            grandTotalCell.textContent = formatNumber(grandTotal);
        }
        
        console.log(`Игрок ${index + 1}: осн=${totalMain}, бон=${totalBonus}, всего=${grandTotal}`);
    });
    
    updateFooterStats();
}

// Функция для форматирования чисел (убирает .0 у целых чисел)
function formatNumber(num) {
    // Проверяем, является ли число целым
    if (Number.isInteger(num)) {
        return num.toString();
    } else {
        // Для дробных оставляем два знака после запятой
        return num.toFixed(2).replace('.', ','); // Меняем точку на запятую для красоты
    }
}

// Функция для обновления статистики в подвале
function updateFooterStats() {
    // Находим все итоговые ячейки
    const grandTotalCells = document.querySelectorAll('td.grand-total');
    let maxTotal = -Infinity;
    let winners = [];
    
    // Находим максимальную сумму
    grandTotalCells.forEach(cell => {
        const cellText = cell.textContent.replace(',', '.');
        const value = parseFloat(cellText);
        if (!isNaN(value) && value > maxTotal) {
            maxTotal = value;
        }
    });
    
    // Находим всех игроков с максимальной суммой
    grandTotalCells.forEach((cell, index) => {
        const cellText = cell.textContent.replace(',', '.');
        const value = parseFloat(cellText);
        if (Math.abs(value - maxTotal) < 0.001) { // Сравнение с учётом погрешности
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
        maxScoreSpan.textContent = formatNumber(maxTotal);
    }
    if (winnerSpan) {
        winnerSpan.textContent = winners.join(', ');
    }
}

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
        
        // Показываем итоги
        const totalMain = row.querySelector('td.total-main')?.textContent;
        const totalBonus = row.querySelector('td.total-bonus')?.textContent;
        const grandTotal = row.querySelector('td.grand-total')?.textContent;
        
        console.log(`\nИтоги: осн=${totalMain}, бон=${totalBonus}, всего=${grandTotal}`);
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
            // Извлекаем числа с поддержкой дробных
            const mainText = mainCells[i] ? (mainCells[i].innerText || mainCells[i].textContent) : '0';
            const bonusText = bonusCells[i] ? (bonusCells[i].innerText || bonusCells[i].textContent) : '0';
            
            const mainMatch = mainText.match(/\d+[,.]?\d*/);
            const bonusMatch = bonusText.match(/\d+[,.]?\d*/);
            
            const mainVal = mainMatch ? mainMatch[0].replace(',', '.') : '0';
            const bonusVal = bonusMatch ? bonusMatch[0].replace(',', '.') : '0';
            
            csv += `${mainVal},${bonusVal},`;
        }
        
        // Итоги
        const totalMain = row.querySelector('td.total-main')?.textContent || '0';
        const totalBonus = row.querySelector('td.total-bonus')?.textContent || '0';
        const grandTotal = row.querySelector('td.grand-total')?.textContent || '0';
        
        csv += `${totalMain.replace(',', '.')},${totalBonus.replace(',', '.')},${grandTotal.replace(',', '.')}\n`;
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

// Функция для очистки иконок из ячеек (если нужно)
function cleanCellIcons() {
    const mainCells = document.querySelectorAll('td.score-main');
    const bonusCells = document.querySelectorAll('td.score-bonus');
    
    // Обрабатываем ячейки с основными баллами
    mainCells.forEach(cell => {
        const html = cell.innerHTML;
        // Если есть иконка, оставляем только число
        if (html.includes('<i')) {
            const numberMatch = html.match(/\d+[,.]?\d*/);
            if (numberMatch) {
                cell.innerHTML = numberMatch[0];
            }
        }
    });
    
    // Обрабатываем ячейки с бонусными баллами
    bonusCells.forEach(cell => {
        const html = cell.innerHTML;
        if (html.includes('<i')) {
            const numberMatch = html.match(/\d+[,.]?\d*/);
            if (numberMatch) {
                cell.innerHTML = numberMatch[0];
            }
        }
    });
}

// Добавляем кнопку для пересчета
function addRecalcButton() {
    const footer = document.querySelector('.tournament-footer');
    if (footer && !document.querySelector('.btn-recalculate')) {
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

// Автоматический пересчет при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, начинаем расчет (дробные числа)...');
    calculateAllTotals();
    setTimeout(addRecalcButton, 100);
});

// Функция для ручного пересчета (можно вызвать из консоли)
window.recalculate = function() {
    calculateAllTotals();
};


// Функция для подсветки игроков по сумме баллов (градация)
function highlightPlayersByScore() {
    console.log('Подсвечиваем игроков по сумме баллов...');
    
    // Находим все итоговые ячейки
    const grandTotalCells = document.querySelectorAll('td.grand-total');
    let scores = [];
    
    // Собираем все суммы
    grandTotalCells.forEach(cell => {
        const cellText = cell.textContent.replace(',', '.');
        const value = parseFloat(cellText);
        if (!isNaN(value)) {
            scores.push(value);
        }
    });
    
    if (scores.length === 0) return;
    
    // Находим min, max и среднее
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const range = maxScore - minScore;
    
    console.log(`Диапазон: от ${minScore} до ${maxScore}, среднее: ${avgScore.toFixed(2)}`);
    
    // Удаляем старую подсветку
    document.querySelectorAll('tr').forEach(row => {
        row.classList.remove(
            'score-legendary', 'score-gold', 'score-silver', 
            'score-bronze', 'score-good', 'score-medium', 
            'score-low', 'score-minimal'
        );
    });
    
    // Подсвечиваем каждую строку в зависимости от суммы
    grandTotalCells.forEach((cell, index) => {
        const row = cell.closest('tr');
        if (!row) return;
        
        const cellText = cell.textContent.replace(',', '.');
        const score = parseFloat(cellText);
        
        // Определяем категорию
        if (score === maxScore) {
            row.classList.add('score-legendary'); // Победители (особая подсветка)
        } else if (score >= maxScore - range * 0.2) {
            row.classList.add('score-gold'); // Близкие к лидерам (топ-20% диапазона)
        } else if (score >= maxScore - range * 0.4) {
            row.classList.add('score-silver'); // Выше среднего
        } else if (score >= avgScore) {
            row.classList.add('score-bronze'); // Чуть выше среднего
        } else if (score >= avgScore - range * 0.2) {
            row.classList.add('score-good'); // Чуть ниже среднего
        } else if (score >= minScore + range * 0.3) {
            row.classList.add('score-medium'); // Ниже среднего
        } else if (score > minScore) {
            row.classList.add('score-low'); // Близкие к минимуму
        } else {
            row.classList.add('score-minimal'); // Минимум
        }
    });
    
    
    console.log('Подсветка применена!');
}

// Функция для сброса подсветки
function resetHighlight() {
    document.querySelectorAll('tr').forEach(row => {
        row.classList.remove(
            'score-legendary', 'score-gold', 'score-silver', 
            'score-bronze', 'score-good', 'score-medium', 
            'score-low', 'score-minimal'
        );
    });
    
    // Удаляем легенду
    const legend = document.querySelector('.score-legend');
    if (legend) legend.remove();
    
    console.log('Подсветка сброшена');
}

// Расширяем функцию обновления статистики
const originalUpdateFooterStats = updateFooterStats;
updateFooterStats = function() {
    originalUpdateFooterStats();
    // Автоматически подсвечиваем после обновления статистики
    highlightPlayersByScore();
};

// Добавляем кнопки управления в подвал
function addHighlightButtons() {
    const footer = document.querySelector('.tournament-footer');
    if (!footer) return;
    
    // Создаём контейнер для кнопок
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'highlight-buttons';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.flexWrap = 'wrap';
    
    // Кнопка подсветки
    const highlightBtn = document.createElement('button');
    highlightBtn.innerHTML = '<i class="fas fa-highlighter"></i> Подсветить градацию';
    highlightBtn.onclick = highlightPlayersByScore;
    highlightBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    highlightBtn.style.color = 'white';
    highlightBtn.style.border = 'none';
    highlightBtn.style.padding = '8px 16px';
    highlightBtn.style.borderRadius = '30px';
    highlightBtn.style.fontSize = '0.9em';
    highlightBtn.style.cursor = 'pointer';
    highlightBtn.style.display = 'flex';
    highlightBtn.style.alignItems = 'center';
    highlightBtn.style.gap = '6px';
    
    // Кнопка сброса
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<i class="fas fa-undo"></i> Сбросить подсветку';
    resetBtn.onclick = resetHighlight;
    resetBtn.style.background = 'linear-gradient(135deg, #94a3b8, #64748b)';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.borderRadius = '30px';
    resetBtn.style.fontSize = '0.9em';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.display = 'flex';
    resetBtn.style.alignItems = 'center';
    resetBtn.style.gap = '6px';
    
    // Эффекты наведения
    [highlightBtn, resetBtn].forEach(btn => {
        btn.onmouseover = function() {
            this.style.opacity = '0.9';
            this.style.transform = 'scale(1.02)';
        };
        btn.onmouseout = function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        };
    });
    
    buttonContainer.appendChild(highlightBtn);
    buttonContainer.appendChild(resetBtn);
    footer.appendChild(buttonContainer);
}

// Обновляем DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, начинаем расчет...');
    calculateAllTotals();
    setTimeout(() => {
        addRecalcButton();
        addHighlightButtons();
        // Автоматическая подсветка при загрузке
        setTimeout(highlightPlayersByScore, 200);
    }, 100);
});

// Добавляем функции в глобальную область видимости
window.highlightPlayers = highlightPlayersByScore;
window.resetHighlight = resetHighlight;