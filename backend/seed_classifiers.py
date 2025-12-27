"""Seed script for classifier reference data"""
import sqlite3
import json
import uuid
from datetime import datetime

conn = sqlite3.connect('forms.db')
cursor = conn.cursor()

# Create classifier reference
ref_id = str(uuid.uuid4())
now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
cursor.execute('''
    INSERT INTO "references" (id, code, name, parent_id, sort_order, is_hierarchical, created_at, updated_at)
    VALUES (?, 'classifiers', 'Классификаторы', NULL, 1, 0, ?, ?)
''', (ref_id, now, now))

# Create fields: client_type, code, name
field_client_type_id = str(uuid.uuid4())
field_code_id = str(uuid.uuid4())
field_name_id = str(uuid.uuid4())

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order)
    VALUES (?, ?, 'client_type', 'Тип клиента', NULL, 1)
''', (field_client_type_id, ref_id))

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order)
    VALUES (?, ?, 'code', 'Код', NULL, 2)
''', (field_code_id, ref_id))

cursor.execute('''
    INSERT INTO reference_fields (id, reference_id, code, name, ref_reference_id, sort_order)
    VALUES (?, ?, 'name', 'Наименование', NULL, 3)
''', (field_name_id, ref_id))

# Classifiers for FL (Physical person - ФЛ)
fl_classifiers = [
    ('fl_resident', 'Резидент РФ'),
    ('fl_nonresident', 'Нерезидент'),
    ('fl_employee', 'Работник банка'),
    ('fl_vip', 'VIP клиент'),
    ('fl_pensioner', 'Пенсионер'),
]

for code, name in fl_classifiers:
    data = {
        field_client_type_id: 'FL',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json)
        VALUES (?, ?, NULL, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data)))

# Classifiers for UL (Legal entity - ЮЛ)
ul_classifiers = [
    ('ul_large', 'Крупный бизнес'),
    ('ul_medium', 'Средний бизнес'),
    ('ul_small', 'Малый бизнес'),
    ('ul_state', 'Госкорпорация'),
    ('ul_foreign', 'Иностранная компания'),
]

for code, name in ul_classifiers:
    data = {
        field_client_type_id: 'UL',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json)
        VALUES (?, ?, NULL, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data)))

# Classifiers for IP (Individual entrepreneur - ИП)
ip_classifiers = [
    ('ip_regular', 'Обычный ИП'),
    ('ip_self_employed', 'Самозанятый'),
    ('ip_farmer', 'Глава КФХ'),
]

for code, name in ip_classifiers:
    data = {
        field_client_type_id: 'IP',
        field_code_id: code,
        field_name_id: name,
    }
    cursor.execute('''
        INSERT INTO reference_data (id, reference_id, parent_id, data_json)
        VALUES (?, ?, NULL, ?)
    ''', (str(uuid.uuid4()), ref_id, json.dumps(data)))

conn.commit()
conn.close()

print(f"Created reference 'Классификаторы' with ID: {ref_id}")
print(f"Fields:")
print(f"  - client_type: {field_client_type_id}")
print(f"  - code: {field_code_id}")
print(f"  - name: {field_name_id}")
print(f"Added {len(fl_classifiers)} FL classifiers")
print(f"Added {len(ul_classifiers)} UL classifiers")
print(f"Added {len(ip_classifiers)} IP classifiers")
