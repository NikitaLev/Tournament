import json
import re
import csv
from collections import defaultdict

def parse_float(value):
    """
    Преобразует строку в число, правильно обрабатывая запятую как десятичный разделитель
    """
    if not value or value == '':
        return 0.0
    
    value = str(value).strip().strip('"')
    
    if not value:
        return 0.0
    
    try:
        value = value.replace(',', '.')
        return float(value)
    except:
        return 0.0


def parse_csv_file(filename):
    """
    Парсит CSV файл с использованием встроенного модуля csv
    """
    print(f"📖 Читаем файл: {filename}")
    
    games = []
    current_game = None
    current_game_data = []
    headers = None
    
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=',', quotechar='"')
        
        for row_num, row in enumerate(reader, 1):
            if not row or all(cell == '' for cell in row):
                continue
            
            if row and row[0] and row[0].startswith('Игра'):
                if current_game and current_game_data:
                    games.append({
                        'name': current_game,
                        'data': current_game_data
                    })
                    print(f"  ✅ Игра {len(games)}: {len(current_game_data)} игроков")
                
                current_game = row[0]
                current_game_data = []
                headers = None
                print(f"\n🎮 Найдена: {current_game}")
                continue
            
            if row and row[0] == 'Место игрока':
                headers = row
                print(f"   Заголовки: {headers}")
                continue
            
            if headers and row and row[0] and row[0].isdigit():
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
    
    if current_game and current_game_data:
        games.append({
            'name': current_game,
            'data': current_game_data
        })
        print(f"  ✅ Игра {len(games)}: {len(current_game_data)} игроков")
    
    return games


# ============================================
# НОВАЯ ФУНКЦИЯ: СБОР СТАТИСТИКИ ПО РОЛЯМ
# ============================================
def collect_role_statistics(games):
    """
    Собирает детальную статистику по каждой роли для каждого игрока
    Возвращает словарь с информацией о том, кто и как играл на каждой роли
    """
    print("\n📊 СБОР СТАТИСТИКИ ПО РОЛЯМ")
    print("═" * 50)
    
    # Структура: role_stats[роль][игрок] = список игр с баллами
    role_stats = {
        'д': defaultdict(list),   # Дон
        'ш': defaultdict(list),   # Шериф
        'м': defaultdict(list),   # Мафия
        '': defaultdict(list)     # Мирные (пустая роль)
    }
    
    # Проходим по всем играм
    for game_idx, game in enumerate(games, 1):
        print(f"\n🎮 Игра {game_idx}:")
        
        for player in game['data']:
            nickname = player.get('Никнейм', '').strip()
            role = player.get('Роль', '').strip().lower()
            
            # Парсим баллы
            main_score = parse_float(player.get('Балл за победу', '0'))
            bonus_score = parse_float(player.get('Дополнительный балл', '0'))
            penalty_score = parse_float(player.get('Штрафной балл', '0'))
            total_score = main_score + (bonus_score - penalty_score)
            
            # Определяем роль для ключа
            role_key = role if role in ['д', 'ш', 'м'] else ''
            
            # Сохраняем информацию об игре
            game_info = {
                'game': game_idx,
                'main_score': main_score,
                'bonus_score': bonus_score - penalty_score,
                'total_score': total_score,
                'place': player.get('Место игрока', '0'),
                'winning_team': player.get('Победа', '')
            }
            
            role_stats[role_key][nickname].append(game_info)
            
            # Выводим информацию
            role_name = {
                'д': 'Дон', 
                'ш': 'Шериф', 
                'м': 'Мафия', 
                '': 'Мирный'
            }[role_key]
            
            print(f"      {role_name} {nickname}: +{total_score:.2f} (осн={main_score}, бон={bonus_score - penalty_score:.2f})")
    
    return role_stats


# ============================================
# НОВАЯ ФУНКЦИЯ: РАСЧЕТ НОМИНАЦИЙ
# ============================================
def calculate_nominations(role_stats):
    """
    Рассчитывает номинации на основе собранной статистики
    Лучший определяется по СУММЕ баллов за все игры на этой роли
    """
    print("\n" + "="*60)
    print("🏆 РАСЧЕТ НОМИНАЦИЙ")
    print("="*60)
    
    nominations = {}
    
    # Настройки номинаций
    nom_configs = [
        ('д', 'best_don', 'Лучший Дон', '👑'),
        ('ш', 'best_sheriff', 'Лучший Шериф', '⭐'),
        ('м', 'best_mafia', 'Лучший Мафия', '🔫'),
        ('', 'best_civil', 'Лучший Мирный', '👤')
    ]
    
    for role_key, nom_key, title, icon in nom_configs:
        print(f"\n{icon} {title}:")
        
        players_stats = role_stats[role_key]
        
        if not players_stats:
            print(f"   ❌ Нет игроков на этой роли")
            nominations[nom_key] = {
                'player': None,
                'total_score': 0,
                'games_count': 0,
                'games_details': []
            }
            continue
        
        # Собираем статистику по каждому игроку
        candidates = []
        for player, games in players_stats.items():
            total_score = sum(g['total_score'] for g in games)
            games_count = len(games)
            
            # Детальная информация по играм
            games_details = []
            for g in games:
                games_details.append({
                    'game': g['game'],
                    'score': round(g['total_score'], 2),
                    'main': round(g['main_score'], 2),
                    'bonus': round(g['bonus_score'], 2),
                    'place': g['place']
                })
            
            candidates.append({
                'player': player,
                'total_score': total_score,
                'games_count': games_count,
                'games_details': games_details
            })
            
            print(f"   {player}: {total_score:.2f} очков ({games_count} игр)")
        
        # Сортируем по сумме баллов (от большего к меньшему)
        candidates.sort(key=lambda x: x['total_score'], reverse=True)
        
        # Лучший - первый в списке
        best = candidates[0]
        
        print(f"\n   🏆 ПОБЕДИТЕЛЬ: {best['player']} ({best['total_score']:.2f} очков, {best['games_count']} игр)")
        
        # Показываем детали по играм победителя
        print(f"      Детали по играм:")
        for g in best['games_details']:
            print(f"         Игра {g['game']}: {g['score']:.2f} (осн={g['main']}, бон={g['bonus']})")
        
        nominations[nom_key] = {
            'player': best['player'],
            'total_score': round(best['total_score'], 2),
            'games_count': best['games_count'],
            'games_details': best['games_details']
        }
    
    return nominations


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
            
            main_score = parse_float(row.get('Балл за победу', '0'))
            bonus_score = parse_float(row.get('Дополнительный балл', '0'))
            penalty_score = parse_float(row.get('Штрафной балл', '0'))
            bonus_final = bonus_score - penalty_score
            
            first_shot = row.get('Первый отстрел', '').strip()
            winning_team = row.get('Победа', '').strip()
            
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
        
        winners = [p for p in game['data'] if p.get('Победа')]
        if winners:
            print(f"      Победила: {winners[0].get('Победа')}")
        
        for player in game['data']:
            name = player.get('Никнейм', '').strip()
            if name and name not in all_players:
                all_players[name] = True
        
        for j, player in enumerate(game['data'][:3]):
            role = player.get('Роль', 'мирный') or 'мирный'
            main = player.get('Балл за победу', '0')
            bonus = player.get('Дополнительный балл', '0')
            print(f"      {j+1}. {player['Никнейм']} - {role} (осн={main}, бон={bonus})")
    
    print(f"\n👥 Всего уникальных игроков: {len(all_players)}")


def save_to_json(data, nominations=None, output_file='data.json'):
    """Сохраняет данные в JSON файл с номинациями"""
    
    output_data = {
        "games": data["games"],
        "nominations": nominations,
        "total_games": data["total_games"],
        "total_players": data["total_players"]
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON сохранен в {output_file}")


def test_float_parsing():
    """Тестирует функцию parse_float"""
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
    
    # ============================================
    # НОВЫЙ ПОДХОД: СБОР СТАТИСТИКИ И РАСЧЕТ НОМИНАЦИЙ
    # ============================================
    
    # Шаг 1: Собираем детальную статистику по ролям
    role_stats = collect_role_statistics(games)
    
    # Шаг 2: Рассчитываем номинации на основе собранной статистики
    nominations = calculate_nominations(role_stats)
    
    # Шаг 3: Конвертируем игры в JSON
    json_data = convert_to_json(games)
    
    # Шаг 4: Сохраняем всё вместе
    save_to_json(json_data, nominations, output_file)
    
    print("\n📁 Финальная структура JSON:")
    print("   {")
    print("     'games': [...] (игры),")
    print("     'nominations': {")
    print("         'best_don': {'player': '...', 'total_score': 0.0, 'games_count': 0, 'games_details': [...]},")
    print("         'best_sheriff': {...},")
    print("         'best_mafia': {...},")
    print("         'best_civil': {...}")
    print("     },")
    print("     'total_games': 5,")
    print("     'total_players': 10")
    print("   }")


if __name__ == "__main__":
    main()