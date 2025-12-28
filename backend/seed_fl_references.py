"""Seed script for FL (Individual) reference data - all dictionaries from form-builder"""
import sqlite3
import json
import uuid
from datetime import datetime

conn = sqlite3.connect('subject_areas.db')
cursor = conn.cursor()

now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

def create_simple_reference(code: str, name: str, data: list[tuple[str, str]], sort_order: int = 0):
    """Create a reference with simple code/name structure"""
    ref_id = str(uuid.uuid4())

    cursor.execute('''
        INSERT INTO "references" (id, code, name, parent_id, sort_order, is_hierarchical, created_at, updated_at)
        VALUES (?, ?, ?, NULL, ?, 0, ?, ?)
    ''', (ref_id, code, name, sort_order, now, now))

    # Create fields: code, name
    field_code_id = str(uuid.uuid4())
    field_name_id = str(uuid.uuid4())

    cursor.execute('''
        INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order)
        VALUES (?, ?, 'code', 'Код', NULL, 1)
    ''', (field_code_id, ref_id))

    cursor.execute('''
        INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order)
        VALUES (?, ?, 'name', 'Наименование', NULL, 2)
    ''', (field_name_id, ref_id))

    # Insert data
    for code_val, name_val in data:
        data_json = {
            field_code_id: code_val,
            field_name_id: name_val,
        }
        cursor.execute('''
            INSERT INTO reference_data (id, reference_id, parent_id, data_json)
            VALUES (?, ?, NULL, ?)
        ''', (str(uuid.uuid4()), ref_id, json.dumps(data_json)))

    print(f"Created '{name}' (code: {code}) with {len(data)} records")
    return ref_id


# 1. Пол (gender)
create_simple_reference('gender', 'Пол', [
    ('M', 'Мужской'),
    ('F', 'Женский'),
], sort_order=1)

# 2. Категории клиентов ФЛ (client_category_fl)
create_simple_reference('client_category_fl', 'Категории клиентов ФЛ', [
    ('FL', 'Физическое лицо'),
    ('IP', 'Индивидуальный предприниматель'),
    ('SZ', 'Самозанятый'),
], sort_order=2)

# 3. Состояния клиента (client_status)
create_simple_reference('client_status', 'Состояния клиента', [
    ('ACTIVE', 'Активен'),
    ('CLOSED', 'Закрыт'),
    ('BLOCKED', 'Заблокирован'),
    ('SUSPENDED', 'Приостановлен'),
], sort_order=3)

# 4. Обращения (salutation)
create_simple_reference('salutation', 'Обращения', [
    ('MR', 'Господин'),
    ('MRS', 'Госпожа'),
    ('DEAR', 'Уважаемый(ая)'),
], sort_order=4)

# 5. Национальности (nationality)
create_simple_reference('nationality', 'Национальности', [
    ('RUS', 'Русский'),
    ('KAZ', 'Казах'),
    ('UZB', 'Узбек'),
    ('TAJ', 'Таджик'),
    ('KGZ', 'Киргиз'),
    ('TKM', 'Туркмен'),
    ('AZE', 'Азербайджанец'),
    ('ARM', 'Армянин'),
    ('GEO', 'Грузин'),
    ('BLR', 'Белорус'),
    ('UKR', 'Украинец'),
    ('OTHER', 'Другая'),
], sort_order=5)

# 6. Языки общения (language)
create_simple_reference('language', 'Языки общения', [
    ('RU', 'Русский'),
    ('UZ', 'Узбекский'),
    ('EN', 'Английский'),
    ('KZ', 'Казахский'),
], sort_order=6)

# 7. Страны (country)
create_simple_reference('country', 'Страны', [
    ('RU', 'Россия'),
    ('KZ', 'Казахстан'),
    ('UZ', 'Узбекистан'),
    ('TJ', 'Таджикистан'),
    ('KG', 'Киргизия'),
    ('TM', 'Туркменистан'),
    ('AZ', 'Азербайджан'),
    ('AM', 'Армения'),
    ('GE', 'Грузия'),
    ('BY', 'Беларусь'),
    ('UA', 'Украина'),
    ('MD', 'Молдова'),
    ('TR', 'Турция'),
    ('CN', 'Китай'),
    ('US', 'США'),
    ('OTHER', 'Другая'),
], sort_order=7)

# 8. Типы удостоверяющих документов (identity_doc_type)
create_simple_reference('identity_doc_type', 'Типы удостоверяющих документов', [
    ('PASSPORT', 'Паспорт'),
    ('ID_CARD', 'ID-карта'),
    ('RESIDENCE', 'Вид на жительство'),
    ('MILITARY', 'Военный билет'),
    ('DRIVER', 'Водительское удостоверение'),
], sort_order=8)

# 9. Типы документов (document_type)
create_simple_reference('document_type', 'Типы документов', [
    ('LICENSE', 'Лицензия'),
    ('CERTIFICATE', 'Свидетельство'),
    ('CONTRACT', 'Договор'),
    ('CHARTER', 'Устав'),
    ('REGISTRATION', 'Свидетельство о регистрации'),
    ('REPORT', 'Отчет'),
], sort_order=9)

# 10. Типы занятости (employment_type)
create_simple_reference('employment_type', 'Типы занятости', [
    ('MAIN', 'Основная'),
    ('PART_TIME', 'Совместительство'),
    ('TEMPORARY', 'Временная'),
], sort_order=10)

# 11. Виды занятости (employment_kind)
create_simple_reference('employment_kind', 'Виды занятости', [
    ('HIRED', 'Работа по найму'),
    ('ENTREPRENEUR', 'Предприниматель'),
    ('SELF_EMPLOYED', 'Самозанятый'),
    ('AGRICULTURAL', 'Сельскохозяйственный'),
    ('RELIGIOUS', 'Религиозный'),
    ('OTHER', 'Другое'),
], sort_order=11)

# 12. Степени родства (relation_degree)
create_simple_reference('relation_degree', 'Степени родства', [
    ('SPOUSE', 'Супруг(а)'),
    ('CHILD', 'Ребенок'),
    ('PARENT', 'Родитель'),
    ('SIBLING', 'Брат/Сестра'),
    ('GRANDPARENT', 'Дедушка/Бабушка'),
    ('GRANDCHILD', 'Внук/Внучка'),
    ('IN_LAW', 'Свекр/Теща'),
    ('OTHER', 'Другое'),
], sort_order=12)

# 13. Образование (education_level)
create_simple_reference('education_level', 'Образование', [
    ('SECONDARY', 'Среднее'),
    ('VOCATIONAL', 'Среднее специальное'),
    ('HIGHER', 'Высшее'),
    ('MBA', 'MBA'),
    ('POSTGRADUATE', 'Аспирантура'),
], sort_order=13)

# 14. Группы обслуживания (service_group)
create_simple_reference('service_group', 'Группы обслуживания', [
    ('STANDARD', 'Стандарт'),
    ('PREMIUM', 'Премиум'),
    ('VIP', 'VIP'),
    ('ELITE', 'Элит'),
], sort_order=14)

# 15. Типы счетов (account_type)
create_simple_reference('account_type', 'Типы счетов', [
    ('CURRENT', 'Расчетный'),
    ('DEPOSIT', 'Депозитный'),
    ('CARD', 'Карточный'),
    ('SAVINGS', 'Сберегательный'),
    ('ESCROW', 'Эскроу'),
], sort_order=15)

# 16. Типы адресов (address_type)
create_simple_reference('address_type', 'Типы адресов', [
    ('LEGAL', 'Юридический'),
    ('ACTUAL', 'Фактический'),
    ('POSTAL', 'Почтовый'),
    ('PERMANENT', 'Постоянный'),
], sort_order=16)

# 17. Виды взаимоотношений с банком (bank_relation_type)
create_simple_reference('bank_relation_type', 'Виды взаимоотношений с банком', [
    ('UZ01', 'Члены совета директоров'),
    ('UZ_01', 'Члены наблюдательного совета'),
    ('UZ_01R', 'Родственники членов совета директоров'),
    ('UZ_02', 'Ключевые сотрудники банка'),
    ('UZ_02R', 'Родственники ключевых сотрудников'),
    ('UZ_03', 'Акционеры банка'),
    ('UZ_03R', 'Родственники акционеров'),
    ('UZ_04', 'Связанные компании'),
    ('UZ_05', 'Контрагенты банка'),
    ('UZ_OTHER', 'Прочие взаимоотношения'),
], sort_order=17)

conn.commit()
conn.close()

print("\n" + "="*50)
print("Successfully created 17 FL references!")
print("="*50)
