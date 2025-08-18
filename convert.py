import os
import zipfile

file_path = "translator.xpi"

# Удаляем старый XPI, если он существует
if os.path.exists(file_path):
    os.remove(file_path)
    print(f"Файл {file_path} удалён")
else:
    print("Файл не найден, создаём новый")

# Имя скрипта, который не хотим добавлять
exclude_file = "convert.py"

# Создаём новый архив
with zipfile.ZipFile(file_path, "w") as archive:
    # os.walk проходит по всем папкам рекурсивно
    for root, dirs, files in os.walk("."):
        for file in files:
            if file == exclude_file:
                continue  # пропускаем convert.py
            full_path = os.path.join(root, file)  # полный путь к файлу
            rel_path = os.path.relpath(full_path, ".")  # относительный путь для архива
            archive.write(full_path, rel_path)
    print(f"Файл {file_path} создан с рекурсивно добавленными файлами")
