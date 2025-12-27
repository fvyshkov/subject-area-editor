"""Seed script for classifier values reference data (OKED, SECTOR, NON_RESIDENT)"""
import sqlite3
import json
import uuid
from datetime import datetime

conn = sqlite3.connect('forms.db')
cursor = conn.cursor()

now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

# Create classifier values reference
ref_id = str(uuid.uuid4())
cursor.execute('''
    INSERT INTO "references" (id, code, name, parent_id, sort_order, is_hierarchical, created_at, updated_at)
    VALUES (?, 'classifier_values', 'Значения классификаторов', NULL, 2, 0, ?, ?)
''', (ref_id, now, now))

# Create fields: classifier_type, code, name
field_type_id = str(uuid.uuid4())
field_code_id = str(uuid.uuid4())
field_name_id = str(uuid.uuid4())

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order, created_at, updated_at)
    VALUES (?, ?, 'classifier_type', 'Тип классификатора', NULL, 1, ?, ?)
''', (field_type_id, ref_id, now, now))

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order, created_at, updated_at)
    VALUES (?, ?, 'code', 'Код', NULL, 2, ?, ?)
''', (field_code_id, ref_id, now, now))

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order, created_at, updated_at)
    VALUES (?, ?, 'name', 'Наименование', NULL, 3, ?, ?)
''', (field_name_id, ref_id, now, now))

# OKED - Виды экономической деятельности
oked_values = [
    ('01', 'Сельское хозяйство'),
    ('02', 'Лесное хозяйство'),
    ('05', 'Рыболовство'),
    ('10', 'Добыча угля'),
    ('11', 'Добыча нефти и газа'),
    ('15', 'Производство пищевых продуктов'),
    ('17', 'Текстильное производство'),
    ('22', 'Издательская деятельность'),
    ('45', 'Строительство'),
    ('50', 'Торговля автотранспортом'),
    ('51', 'Оптовая торговля'),
    ('52', 'Розничная торговля'),
    ('55', 'Гостиницы и рестораны'),
    ('60', 'Транспорт'),
    ('64', 'Связь'),
    ('65', 'Финансовое посредничество'),
    ('70', 'Операции с недвижимостью'),
    ('72', 'IT-деятельность'),
    ('74', 'Прочие услуги'),
    ('80', 'Образование'),
    ('85', 'Здравоохранение'),
]

for code, name in oked_values:
    data = {
        field_type_id: 'OKED',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json, created_at, updated_at)
        VALUES (?, ?, NULL, ?, ?, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data), now, now))

# SECTOR - Экономические секторы
sector_values = [
    ('S11', 'Нефинансовые корпорации'),
    ('S12', 'Финансовые корпорации'),
    ('S13', 'Государственное управление'),
    ('S14', 'Домашние хозяйства'),
    ('S15', 'НКООДХ'),
    ('S1311', 'Федеральные органы'),
    ('S1312', 'Региональные органы'),
    ('S1313', 'Местные органы'),
]

for code, name in sector_values:
    data = {
        field_type_id: 'SECTOR',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json, created_at, updated_at)
        VALUES (?, ?, NULL, ?, ?, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data), now, now))

# NON_RESIDENT - Типы нерезидентов
non_resident_values = [
    ('NR01', 'Иностранное юридическое лицо'),
    ('NR02', 'Иностранный гражданин'),
    ('NR03', 'Международная организация'),
    ('NR04', 'Дипломатическое представительство'),
    ('NR05', 'Иностранный филиал'),
]

for code, name in non_resident_values:
    data = {
        field_type_id: 'NON_RESIDENT',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json, created_at, updated_at)
        VALUES (?, ?, NULL, ?, ?, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data), now, now))

conn.commit()
conn.close()

print(f"Created reference 'Значения классификаторов' with ID: {ref_id}")
print(f"Fields:")
print(f"  - classifier_type: {field_type_id}")
print(f"  - code: {field_code_id}")
print(f"  - name: {field_name_id}")
print(f"Added {len(oked_values)} OKED values")
print(f"Added {len(sector_values)} SECTOR values")
print(f"Added {len(non_resident_values)} NON_RESIDENT values")
