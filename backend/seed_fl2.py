"""Create FL-2 domain concept (on same level as Fizlitso) with references and detail forms"""
import sqlite3
import uuid
from datetime import datetime

DB_PATH = 'subject_areas.db'

# Reference IDs (from existing references table)
REFS = {
    'gender': 'd6097dde-f6b1-4c16-805c-6363581f4825',
    'country': 'a08c1548-df36-490c-bdc8-f2281c964abb',
    'region': '3cc91636-8866-4544-b54b-4dd654981da3',
    'address_type': '35ef4f6d-e00c-45e7-b8de-cddad36e9e32',
    'identity_doc_type': 'f4b915c9-3852-4eb9-9fc8-4706f80ff949',
    'document_type': '7fe2c1c8-648b-4f9d-88c8-0074299965b3',
    'employment_type': '347bd3f9-0204-4225-a59a-120c791c8290',
    'employment_kind': '70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14',
    'relation_degree': '0d30f188-9006-42b1-840d-e83475828d0a',
    'nationality': 'ec37219c-ed07-4482-8d41-df684c427866',
    'client_status': '4feb0c0d-44d7-4186-a457-5c7092002556',
    'client_category_fl': '403371f7-cb8a-41fc-8e18-1cbfd28e8cf6',
    'salutation': '37d90314-29e9-4755-bb6d-285f92ee11f0',
    'language': '8f74467a-200c-4d6e-a3c8-709145e6eb6d',
    'education_level': '14f17f29-0dc3-4568-b3d9-96efd71e2653',
    'service_group': '4035d6ba-0743-4e83-a237-eae501dd79e6',
    'bank_relation_type': 'f3ca5d81-2ace-4557-b86a-0cefa0900f77',
    'classifier_type': '7d888230-5b1d-4b22-9a20-32b72050ab56',
    'economic_activity': 'fecca2b0-5092-4a96-9f9a-183d4c9ae96a',
}

# Detail form codes
DETAIL_FORMS = {
    'addresses': 'address_detail',
    'documents': 'document_detail',
    'employment': 'employment_detail',
    'relatives': 'relative_detail',
    'bank_relations': 'bank_relation_detail',
    'classification': 'classification_detail',
}

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

# Subject area "Клиенты" - ФЛ-2 будет domain_concept внутри неё
CLIENTS_SA_ID = 'e7ff4200-7112-40c3-9776-304b167b9659'


def create_concept(code, name, concept_type, data_type='text', parent_id=None,
                   reference_id=None, detail_form_code=None, sort_order=0):
    """Create a domain concept"""
    concept_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO domain_concepts
        (id, code, name, subject_area_id, parent_id, concept_type, data_type,
         reference_id, detail_form_code, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (concept_id, code, name, CLIENTS_SA_ID, parent_id, concept_type, data_type,
          reference_id, detail_form_code, sort_order, now, now))
    return concept_id


# ROOT: fl2 (list) - на одном уровне с Физлицо (parent_id = NULL)
fl2_id = create_concept('fl2', 'ФЛ-2', 'list', sort_order=100)  # sort_order=100 чтобы был после Физлицо
print(f"Created root concept 'ФЛ-2' (id: {fl2_id})")

# ============ SECTION: Основные данные ============
osnovnye_id = create_concept('osnovnye_dannye_2', 'Основные данные', 'list', parent_id=fl2_id, sort_order=1)
print(f"  + Основные данные")

create_concept('photo_2', 'Фото', 'attribute', 'image', parent_id=osnovnye_id, sort_order=1)
create_concept('code_2', 'Код клиента', 'attribute', 'text', parent_id=osnovnye_id, sort_order=2)
create_concept('last_name_2', 'Фамилия', 'attribute', 'text', parent_id=osnovnye_id, sort_order=3)
create_concept('first_name_2', 'Имя', 'attribute', 'text', parent_id=osnovnye_id, sort_order=4)
create_concept('middle_name_2', 'Отчество', 'attribute', 'text', parent_id=osnovnye_id, sort_order=5)
create_concept('birth_date_2', 'Дата рождения', 'attribute', 'date', parent_id=osnovnye_id, sort_order=6)
create_concept('gender_2', 'Пол', 'attribute', 'reference', parent_id=osnovnye_id,
               reference_id=REFS['gender'], sort_order=7)
create_concept('birth_place_2', 'Место рождения', 'attribute', 'text', parent_id=osnovnye_id, sort_order=8)
create_concept('citizenship_2', 'Гражданство', 'attribute', 'reference', parent_id=osnovnye_id,
               reference_id=REFS['country'], sort_order=9)
create_concept('nationality_2', 'Национальность', 'attribute', 'reference', parent_id=osnovnye_id,
               reference_id=REFS['nationality'], sort_order=10)
print(f"    - 10 полей")

# ============ SECTION: Общие данные ============
obschie_id = create_concept('obschie_dannye_2', 'Общие данные', 'list', parent_id=fl2_id, sort_order=2)
print(f"  + Общие данные")

create_concept('client_category_2', 'Категория клиента', 'attribute', 'reference', parent_id=obschie_id,
               reference_id=REFS['client_category_fl'], sort_order=1)
create_concept('salutation_2', 'Обращение', 'attribute', 'reference', parent_id=obschie_id,
               reference_id=REFS['salutation'], sort_order=2)
create_concept('language_2', 'Язык общения', 'attribute', 'reference', parent_id=obschie_id,
               reference_id=REFS['language'], sort_order=3)
create_concept('education_2', 'Образование', 'attribute', 'reference', parent_id=obschie_id,
               reference_id=REFS['education_level'], sort_order=4)
create_concept('registration_date_2', 'Дата регистрации', 'attribute', 'date', parent_id=obschie_id, sort_order=5)
create_concept('close_date_2', 'Дата закрытия', 'attribute', 'date', parent_id=obschie_id, sort_order=6)
create_concept('status_2', 'Состояние', 'attribute', 'reference', parent_id=obschie_id,
               reference_id=REFS['client_status'], sort_order=7)
print(f"    - 7 полей")

# ============ SECTION: Идентификационные данные ============
ident_id = create_concept('identification_2', 'Идентификационные данные', 'list', parent_id=fl2_id, sort_order=3)
print(f"  + Идентификационные данные")

create_concept('inn_2', 'ИНН', 'attribute', 'text', parent_id=ident_id, sort_order=1)
create_concept('snils_2', 'СНИЛС', 'attribute', 'text', parent_id=ident_id, sort_order=2)
create_concept('is_resident_2', 'Резидент', 'attribute', 'boolean', parent_id=ident_id, sort_order=3)
create_concept('is_pdl_2', 'ПДЛ', 'attribute', 'boolean', parent_id=ident_id, sort_order=4)
create_concept('pdl_relation_2', 'Связь с ПДЛ', 'attribute', 'text', parent_id=ident_id, sort_order=5)
print(f"    - 5 полей")

# ============ SECTION: Удостоверяющий документ ============
identity_doc_id = create_concept('identity_document_2', 'Удостоверяющий документ', 'list', parent_id=fl2_id, sort_order=4)
print(f"  + Удостоверяющий документ")

create_concept('id_doc_type_2', 'Тип документа', 'attribute', 'reference', parent_id=identity_doc_id,
               reference_id=REFS['identity_doc_type'], sort_order=1)
create_concept('id_doc_series_2', 'Серия', 'attribute', 'text', parent_id=identity_doc_id, sort_order=2)
create_concept('id_doc_number_2', 'Номер', 'attribute', 'text', parent_id=identity_doc_id, sort_order=3)
create_concept('id_doc_issue_date_2', 'Дата выдачи', 'attribute', 'date', parent_id=identity_doc_id, sort_order=4)
create_concept('id_doc_issuer_2', 'Кем выдан', 'attribute', 'text', parent_id=identity_doc_id, sort_order=5)
create_concept('id_doc_issuer_code_2', 'Код подразделения', 'attribute', 'text', parent_id=identity_doc_id, sort_order=6)
create_concept('id_doc_expiry_2', 'Срок действия', 'attribute', 'date', parent_id=identity_doc_id, sort_order=7)
print(f"    - 7 полей")

# ============ SECTION: Дополнительно ============
dop_id = create_concept('dopolnitelno_2', 'Дополнительно', 'list', parent_id=fl2_id, sort_order=5)
print(f"  + Дополнительно (секция с гридами)")

# --- GRID: Адреса ---
addresses_id = create_concept('addresses_2', 'Адреса', 'list', parent_id=dop_id,
                               detail_form_code=DETAIL_FORMS['addresses'], sort_order=1)
print(f"    + Адреса (grid -> address_detail)")

create_concept('address_type_2', 'Тип адреса', 'attribute', 'reference', parent_id=addresses_id,
               reference_id=REFS['address_type'], sort_order=1)
create_concept('country_2', 'Страна', 'attribute', 'reference', parent_id=addresses_id,
               reference_id=REFS['country'], sort_order=2)
create_concept('region_2', 'Регион', 'attribute', 'reference', parent_id=addresses_id,
               reference_id=REFS['region'], sort_order=3)
create_concept('district_2', 'Район', 'attribute', 'text', parent_id=addresses_id, sort_order=4)
create_concept('city_2', 'Город', 'attribute', 'text', parent_id=addresses_id, sort_order=5)
create_concept('locality_2', 'Населенный пункт', 'attribute', 'text', parent_id=addresses_id, sort_order=6)
create_concept('street_2', 'Улица', 'attribute', 'text', parent_id=addresses_id, sort_order=7)
create_concept('house_2', 'Дом', 'attribute', 'text', parent_id=addresses_id, sort_order=8)
create_concept('building_2', 'Корпус', 'attribute', 'text', parent_id=addresses_id, sort_order=9)
create_concept('structure_2', 'Строение', 'attribute', 'text', parent_id=addresses_id, sort_order=10)
create_concept('apartment_2', 'Квартира', 'attribute', 'text', parent_id=addresses_id, sort_order=11)
create_concept('postal_code_2', 'Индекс', 'attribute', 'text', parent_id=addresses_id, sort_order=12)
create_concept('soato_code_2', 'Код СОАТО', 'attribute', 'text', parent_id=addresses_id, sort_order=13)
create_concept('address_line_2', 'Строка адреса', 'attribute', 'text', parent_id=addresses_id, sort_order=14)

# --- GRID: Документы ---
documents_id = create_concept('documents_2', 'Документы', 'list', parent_id=dop_id,
                               detail_form_code=DETAIL_FORMS['documents'], sort_order=2)
print(f"    + Документы (grid -> document_detail)")

create_concept('doc_type_2', 'Вид документа', 'attribute', 'reference', parent_id=documents_id,
               reference_id=REFS['document_type'], sort_order=1)
create_concept('doc_series_2', 'Серия', 'attribute', 'text', parent_id=documents_id, sort_order=2)
create_concept('doc_number_2', 'Номер', 'attribute', 'text', parent_id=documents_id, sort_order=3)
create_concept('doc_issue_date_2', 'Дата выдачи', 'attribute', 'date', parent_id=documents_id, sort_order=4)
create_concept('doc_issuer_2', 'Кем выдан', 'attribute', 'text', parent_id=documents_id, sort_order=5)
create_concept('doc_expiry_2', 'Срок действия', 'attribute', 'date', parent_id=documents_id, sort_order=6)

# --- GRID: Занятость ---
employment_id = create_concept('employment_2', 'Занятость', 'list', parent_id=dop_id,
                                detail_form_code=DETAIL_FORMS['employment'], sort_order=3)
print(f"    + Занятость (grid -> employment_detail)")

create_concept('emp_type_2', 'Тип занятости', 'attribute', 'reference', parent_id=employment_id,
               reference_id=REFS['employment_type'], sort_order=1)
create_concept('emp_kind_2', 'Вид занятости', 'attribute', 'reference', parent_id=employment_id,
               reference_id=REFS['employment_kind'], sort_order=2)
create_concept('emp_org_2', 'Организация', 'attribute', 'text', parent_id=employment_id, sort_order=3)
create_concept('emp_position_2', 'Должность', 'attribute', 'text', parent_id=employment_id, sort_order=4)
create_concept('emp_start_2', 'Дата начала', 'attribute', 'date', parent_id=employment_id, sort_order=5)
create_concept('emp_end_2', 'Дата окончания', 'attribute', 'date', parent_id=employment_id, sort_order=6)
create_concept('emp_primary_2', 'Основное место', 'attribute', 'boolean', parent_id=employment_id, sort_order=7)

# --- GRID: Родственники ---
relatives_id = create_concept('relatives_2', 'Родственники', 'list', parent_id=dop_id,
                               detail_form_code=DETAIL_FORMS['relatives'], sort_order=4)
print(f"    + Родственники (grid -> relative_detail)")

create_concept('rel_type_2', 'Степень родства', 'attribute', 'reference', parent_id=relatives_id,
               reference_id=REFS['relation_degree'], sort_order=1)
create_concept('rel_last_name_2', 'Фамилия', 'attribute', 'text', parent_id=relatives_id, sort_order=2)
create_concept('rel_first_name_2', 'Имя', 'attribute', 'text', parent_id=relatives_id, sort_order=3)
create_concept('rel_middle_name_2', 'Отчество', 'attribute', 'text', parent_id=relatives_id, sort_order=4)
create_concept('rel_birth_date_2', 'Дата рождения', 'attribute', 'date', parent_id=relatives_id, sort_order=5)
create_concept('rel_gender_2', 'Пол', 'attribute', 'reference', parent_id=relatives_id,
               reference_id=REFS['gender'], sort_order=6)
create_concept('rel_is_dependent_2', 'Иждивенец', 'attribute', 'boolean', parent_id=relatives_id, sort_order=7)

# --- GRID: Взаимоотношения с банком ---
bank_rel_id = create_concept('bank_relations_2', 'Взаимоотношения с банком', 'list', parent_id=dop_id,
                              detail_form_code=DETAIL_FORMS['bank_relations'], sort_order=5)
print(f"    + Взаимоотношения с банком (grid -> bank_relation_detail)")

create_concept('bank_rel_type_2', 'Вид взаимоотношения', 'attribute', 'reference', parent_id=bank_rel_id,
               reference_id=REFS['bank_relation_type'], sort_order=1)
create_concept('bank_rel_start_2', 'Дата начала', 'attribute', 'date', parent_id=bank_rel_id, sort_order=2)
create_concept('bank_rel_end_2', 'Дата окончания', 'attribute', 'date', parent_id=bank_rel_id, sort_order=3)
create_concept('bank_rel_comment_2', 'Комментарий', 'attribute', 'text', parent_id=bank_rel_id, sort_order=4)

# --- GRID: Классификация ---
classification_id = create_concept('classification_2', 'Классификация', 'list', parent_id=dop_id,
                                    detail_form_code=DETAIL_FORMS['classification'], sort_order=6)
print(f"    + Классификация (grid -> classification_detail)")

create_concept('classifier_type_2', 'Тип классификатора', 'attribute', 'reference', parent_id=classification_id,
               reference_id=REFS['classifier_type'], sort_order=1)
create_concept('classifier_value_2', 'Значение', 'attribute', 'text', parent_id=classification_id, sort_order=2)
create_concept('classifier_start_2', 'Дата начала', 'attribute', 'date', parent_id=classification_id, sort_order=3)
create_concept('classifier_end_2', 'Дата окончания', 'attribute', 'date', parent_id=classification_id, sort_order=4)

# ============ SECTION: Банковское обслуживание ============
bank_service_id = create_concept('bank_service_2', 'Банковское обслуживание', 'list', parent_id=fl2_id, sort_order=6)
print(f"  + Банковское обслуживание")

create_concept('service_group_2', 'Группа обслуживания', 'attribute', 'reference', parent_id=bank_service_id,
               reference_id=REFS['service_group'], sort_order=1)
create_concept('service_manager_2', 'Персональный менеджер', 'attribute', 'text', parent_id=bank_service_id, sort_order=2)
create_concept('service_branch_2', 'Обслуживающий офис', 'attribute', 'text', parent_id=bank_service_id, sort_order=3)
print(f"    - 3 поля")

# --- GRID: Национальные реквизиты ---
nat_req_id = create_concept('national_requisites_2', 'Национальные реквизиты', 'list', parent_id=bank_service_id, sort_order=4)
print(f"    + Национальные реквизиты (grid)")

create_concept('nat_bank_name_2', 'Наименование банка', 'attribute', 'text', parent_id=nat_req_id, sort_order=1)
create_concept('nat_bik_2', 'БИК', 'attribute', 'text', parent_id=nat_req_id, sort_order=2)
create_concept('nat_corr_account_2', 'Корр. счет', 'attribute', 'text', parent_id=nat_req_id, sort_order=3)
create_concept('nat_account_2', 'Расчетный счет', 'attribute', 'text', parent_id=nat_req_id, sort_order=4)

# --- GRID: Международные реквизиты ---
int_req_id = create_concept('international_requisites_2', 'Международные реквизиты', 'list', parent_id=bank_service_id, sort_order=5)
print(f"    + Международные реквизиты (grid)")

create_concept('int_bank_name_2', 'Bank Name', 'attribute', 'text', parent_id=int_req_id, sort_order=1)
create_concept('int_swift_2', 'SWIFT', 'attribute', 'text', parent_id=int_req_id, sort_order=2)
create_concept('int_iban_2', 'IBAN', 'attribute', 'text', parent_id=int_req_id, sort_order=3)
create_concept('int_account_2', 'Account', 'attribute', 'text', parent_id=int_req_id, sort_order=4)

# ============ SECTION: Контакты ============
contacts_id = create_concept('contacts_2', 'Контакты', 'list', parent_id=fl2_id, sort_order=7)
print(f"  + Контакты (grid)")

create_concept('contact_type_2', 'Тип контакта', 'attribute', 'select', parent_id=contacts_id, sort_order=1)
create_concept('contact_value_2', 'Значение', 'attribute', 'text', parent_id=contacts_id, sort_order=2)
create_concept('contact_primary_2', 'Основной', 'attribute', 'boolean', parent_id=contacts_id, sort_order=3)
create_concept('contact_verified_2', 'Подтвержден', 'attribute', 'boolean', parent_id=contacts_id, sort_order=4)

conn.commit()

# Count totals
cursor.execute("SELECT COUNT(*) FROM domain_concepts WHERE subject_area_id = ? AND (id = ? OR parent_id = ? OR parent_id IN (SELECT id FROM domain_concepts WHERE parent_id = ?) OR parent_id IN (SELECT id FROM domain_concepts WHERE parent_id IN (SELECT id FROM domain_concepts WHERE parent_id = ?)))",
               (CLIENTS_SA_ID, fl2_id, fl2_id, fl2_id, fl2_id))
total = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM domain_concepts WHERE subject_area_id = ? AND detail_form_code IS NOT NULL", (CLIENTS_SA_ID,))
with_detail = cursor.fetchone()[0]

conn.close()

print(f"\n{'='*50}")
print(f"ФЛ-2 создана как domain_concept в ПО 'Клиенты'!")
print(f"  - Всего концептов: {total}")
print(f"  - Гридов с детализацией: {with_detail}")
print(f"{'='*50}")
