import json
import re
import csv

def parse_float(value):
    """
    Преобразует строку в число, правильно обрабатывая запятую как десятичный разделитель
    Примеры: "2,5" -> 2.5, "0,75" -> 0.75, "-0,5" -> -0.5
    """
    if not value or value == '':
        return 0.0
    
    # Убираем пробелы и кавычки
    value = str(value).strip().strip('"')
    
    if not value:
        return 0.0
    
    try:
        # Заменяем запятую на точку для парсинга
        value = value.replace(',', '.')
        return float(value)
    except:
        return 0.0

def parse_csv_file(filename):
    """
    Парсит CSV файл с использованием встроенного модуля csv,
    который правильно обрабатывает кавычки
    """
    print(f"📖 Читаем файл: {filename}")
    
    games = []
    current_game = None
    current_game_data = []
    headers = None
    
    with open(filename, 'r', encoding='utf-8') as f:
        # Используем csv.reader для правильной обработки кавычек
        reader = csv.reader(f, delimiter=',', quotechar='"')
        
        for row_num, row in enumerate(reader, 1):
            # Пропускаем пустые строки
            if not row or all(cell == '' for cell in row):
                continue
            
            # Проверяем начало новой игры (первая ячейка начинается с "Игра")
            if row and row[0] and row[0].startswith('Игра'):
                # Сохраняем предыдущую игру
                if current_game and current_game_data:
                    games.append({
                        'name': current_game,
                        'data': current_game_data
                    })
                    print(f"  ✅ Игра {len(games)}: {len(current_game_data)} игроков")
                
                current_game = row[0]  # "Игра 1"
                current_game_data = []
                headers = None
                print(f"\n🎮 Найдена: {current_game}")
                continue
            
            # Если это строка с заголовками
            if row and row[0] == 'Место игрока':
                headers = row
                print(f"   Заголовки: {headers}")
                continue
            
            # Если это строка с данными игрока и у нас есть заголовки
            if headers and row and row[0] and row[0].isdigit():
                # Создаем запись игрока
                player = {}
                for i, header in enumerate(headers):
                    if i < len(row):
                        player[header] = row[i] if row[i] is not None else ''
                    else:
                        player[header] = ''
                
                nickname = player.get('Никнейм', '').strip()
                if nickname:
                    current_game_data.append(player)
                    print(f"      + {nickname} (место {player.get('Место игрока', '?')})")
    
    # Добавляем последнюю игру
    if current_game and current_game_data:
        games.append({
            'name': current_game,
            'data': current_game_data
        })
        print(f"  ✅ Игра {len(games)}: {len(current_game_data)} игроков")
    
    return games

def convert_to_json(games):
    """Конвертирует игры в нужный формат JSON"""
    result = {
        "games": [],
        "total_players": 10,
        "total_games": len(games)
    }
    
    for game_idx, game in enumerate(games, 1):
        players = []
        
        print(f"\n🔄 Обработка игры {game_idx}:")
        
        for row in game['data']:
            nickname = row.get('Никнейм', '').strip()
            if not nickname:
                continue
            
            role = row.get('Роль', '').strip().lower()
            
            # Парсим числа с правильной обработкой запятых
            main_score = parse_float(row.get('Балл за победу', '0'))
            bonus_score = parse_float(row.get('Дополнительный балл', '0'))
            penalty_score = parse_float(row.get('Штрафной балл', '0'))
            bonus_final = bonus_score - penalty_score
            
            first_shot = row.get('Первый отстрел', '').strip()
            winning_team = row.get('Победа', '').strip()
            
            # Преобразуем команду-победителя
            if winning_team == 'Мафии':
                winning_team = 'mafia'
            elif winning_team == 'Мирных':
                winning_team = 'peace'
            else:
                winning_team = 'unknown'
            
            player_data = {
                "nickname": nickname,
                "role": role,
                "main_score": round(main_score, 2),
                "bonus_score": round(bonus_final, 2),
                "first_shot": first_shot,
                "winning_team": winning_team
            }
            
            players.append(player_data)
            print(f"      + {nickname}: осн={main_score}, бон={bonus_final:.2f}")
        
        result["games"].append({
            "name": f"Игра {game_idx}",
            "players": players
        })
    
    return result

def print_statistics(games):
    """Выводит статистику по играм"""
    print("\n📊 Статистика по играм:")
    
    all_players = {}
    
    for i, game in enumerate(games, 1):
        print(f"\n   Игра {i}:")
        print(f"      Игроков: {len(game['data'])}")
        
        # Определяем победителя
        winners = [p for p in game['data'] if p.get('Победа')]
        if winners:
            print(f"      Победила: {winners[0].get('Победа')}")
        
        # Собираем статистику по игрокам
        for player in game['data']:
            name = player.get('Никнейм', '').strip()
            if name and name not in all_players:
                all_players[name] = True
        
        # Показываем первых 3 игроков
        for j, player in enumerate(game['data'][:3]):
            role = player.get('Роль', 'мирный') or 'мирный'
            main = player.get('Балл за победу', '0')
            bonus = player.get('Дополнительный балл', '0')
            print(f"      {j+1}. {player['Никнейм']} - {role} (осн={main}, бон={bonus})")
    
    print(f"\n👥 Всего уникальных игроков: {len(all_players)}")

def save_to_json(data, output_file='data.json'):
    """Сохраняет данные в JSON файл"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON сохранен в {output_file}")

def test_float_parsing():
    """Тестирует функцию parse_float на разных форматах"""
    test_values = [
        ('"2,5"', 2.5),
        ('"0,75"', 0.75),
        ('"-0,5"', -0.5),
        ('3', 3.0),
        ('"3,14"', 3.14),
        ('', 0.0),
        ('2.5', 2.5),
    ]
    
    print("🧪 Тестирование parse_float:")
    for input_val, expected in test_values:
        result = parse_float(input_val)
        status = "✅" if abs(result - expected) < 0.001 else "❌"
        print(f"   {status} '{input_val}' -> {result} (ожидалось {expected})")

def main():
    input_file = 'data/Турнир - Турнир 1.csv'
    output_file = 'data.json'
    
    print("🚀 Парсер турнирных данных\n")
    
    # Тестируем парсинг чисел
    test_float_parsing()
    print()
    
    # Парсим файл
    games = parse_csv_file(input_file)
    
    if not games:
        print("❌ Не найдено игр!")
        return
    
    print(f"\n📋 Всего найдено игр: {len(games)}")
    
    # Выводим статистику
    print_statistics(games)
    
    # Конвертируем в JSON
    json_data = convert_to_json(games)
    
    # Сохраняем
    save_to_json(json_data, output_file)
    
    # Показываем пример первых двух игроков из JSON
    if json_data["games"] and json_data["games"][0]["players"]:
        print("\n📝 Пример данных в JSON (первые 2 игрока первой игры):")
        for i, player in enumerate(json_data["games"][0]["players"][:2]):
            print(f"\n   Игрок {i+1}:")
            print(f"      nickname: {player['nickname']}")
            print(f"      role: {player['role']}")
            print(f"      main_score: {player['main_score']}")
            print(f"      bonus_score: {player['bonus_score']}")
            print(f"      first_shot: '{player['first_shot']}'")

if __name__ == "__main__":
    main()