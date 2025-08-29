import asyncio
import json
from googletrans import Translator


async def translate_text(text: str, target_lang: str = 'en') -> str:
    """Переводит текст на указанный язык."""
    translator = Translator()
    translation = await translator.translate(text, dest=target_lang)
    print(text, ">", translation.text)
    return translation.text


async def generate_localizations(template_dict: dict, target_lang: str = 'en') -> dict:
    """
    Создает словарь локализаций на указанном языке.

    Заменяет символы '_' на пробелы и переводит строки.
    """
    localized_dict = {}
    for key, value in template_dict.items():
        cleaned_value = value.replace("_", " ")
        localized_dict[key] = await translate_text(cleaned_value, target_lang)
    return localized_dict


if __name__ == "__main__":
    template = {
        "translator_title": "Translate to:",
        "settings_title": "Settings",
        "enter_text": "Enter the text...",
        "translate": "Translate"
    }

    localized_result = asyncio.run(generate_localizations(template, target_lang="ru"))
    print(json.dumps(localized_result, ensure_ascii=False, indent=4))
