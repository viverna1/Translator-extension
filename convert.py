
import os
import zipfile


# путь к файлу
file_path = "translator.xpi"

if os.path.exists(file_path):   # проверим, существует ли файл
    os.remove(file_path)        # удаляем
    print(f"Файл {file_path} удалён")
else:
    print("Файл не найден")


files = os.listdir(path=".")
files.remove("convert.py")

with zipfile.ZipFile("translator.xpi", "a") as archive:
    for file in files:
        archive.write(file)
