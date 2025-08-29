import os
from pathlib import Path

def print_directory_tree(startpath, padding='', max_depth=None, current_depth=0, blacklist=None):
    """
    Рекурсивно выводит дерево директорий с файлами
    :param startpath: начальная директория
    :param padding: отступ для визуализации вложенности
    :param max_depth: максимальная глубина рекурсии (None - без ограничений)
    :param current_depth: текущая глубина рекурсии (для внутреннего использования)
    """
    if max_depth is not None and current_depth > max_depth:
        return

    try:
        entries = sorted(os.listdir(startpath))
    except PermissionError:
        print(f"{padding}└── [Доступ запрещен]")
        return

    for i, entry in enumerate(entries):
        if blacklist and entry in blacklist:
            continue

        path = os.path.join(startpath, entry)
        is_last = i == len(entries) - 1

        if os.path.isdir(path):
            # Вывод директории с иконкой 📁
            print(f"{padding}{'└── ' if is_last else '├── '}📁 {entry}/")
            new_padding = padding + ('    ' if is_last else '│   ')
            print_directory_tree(path, new_padding, max_depth, current_depth + 1)
        else:
            # Вывод файла с иконкой 📄 и размером
            size = os.path.getsize(path)
            print(f"{padding}{'└── ' if is_last else '├── '}📄 {entry} ({size} bytes)")

def main():
    import argparse
    blacklist = ['.git', '__pycache__', '.test']
    
    parser = argparse.ArgumentParser(description='Вывод дерева директорий')
    parser.add_argument('path', nargs='?', default='.', help='Путь к директории (по умолчанию: текущая)')
    parser.add_argument('--depth', type=int, default=None, help='Максимальная глубина рекурсии')
    args = parser.parse_args()

    startpath = Path(args.path).resolve()
    print(f"\nДерево директорий: {startpath}\n{'═' * 50}")
    print_directory_tree(startpath, max_depth=args.depth, blacklist=blacklist)
    print(f"{'═' * 50}\nВсего файлов и папок: {sum(1 for _ in Path(startpath).rglob('*'))}")

if __name__ == "__main__":
    main()