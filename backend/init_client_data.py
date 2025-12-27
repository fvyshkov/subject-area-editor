"""
Скрипт для инициализации данных клиентов (физлиц и юрлиц) с узлами дерева
"""
import json
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, FormModel, ClientTypeModel

DATABASE_URL = "sqlite:///./forms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_form(db, code, name, description, components):
    """Создать форму"""
    form = FormModel(
        id=str(uuid.uuid4()),
        code=code,
        name=name,
        description=description,
        schema_json=json.dumps({
            "name": name,
            "description": description,
            "components": components,
            "settings": {}
        }),
        parent_id=None
    )
    db.add(form)
    db.flush()
    return form.id


def create_client_type(db, code, name, form_id, parent_id=None):
    """Создать тип клиента"""
    client_type = ClientTypeModel(
        id=str(uuid.uuid4()),
        code=code,
        name=name,
        form_id=form_id,
        parent_id=parent_id
    )
    db.add(client_type)
    db.flush()
    return client_type.id


def init_data():
    """Инициализировать все данные"""
    db = SessionLocal()

    try:
        # Очистить существующие данные
        db.query(ClientTypeModel).delete()
        db.query(FormModel).delete()
        db.commit()

        print("Создаю данные для Физического лица...")

        # ===== ФИЗИЧЕСКОЕ ЛИЦО =====

        # 1. Общие данные физлица
        individual_general_form_id = create_form(
            db, "individual_general", "Общие данные", "Основная информация о физическом лице",
            [
                {
                    "id": "field_1",
                    "type": "input",
                    "props": {
                        "label": "Фамилия",
                        "placeholder": "Введите фамилию",
                        "required": True,
                        "fieldId": "lastName"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_2",
                    "type": "input",
                    "props": {
                        "label": "Имя",
                        "placeholder": "Введите имя",
                        "required": True,
                        "fieldId": "firstName"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_3",
                    "type": "input",
                    "props": {
                        "label": "Отчество",
                        "placeholder": "Введите отчество",
                        "fieldId": "middleName"
                    },
                    "children": []
                },
                {
                    "id": "field_4",
                    "type": "date",
                    "props": {
                        "label": "Дата рождения",
                        "required": True,
                        "fieldId": "birthDate"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_5",
                    "type": "select",
                    "props": {
                        "label": "Тип документа",
                        "required": True,
                        "fieldId": "documentType",
                        "options": [
                            {"label": "Паспорт РФ", "value": "passport_rf"},
                            {"label": "Загранпаспорт", "value": "passport_foreign"},
                            {"label": "Водительское удостоверение", "value": "driver_license"},
                            {"label": "Военный билет", "value": "military_id"}
                        ]
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_6",
                    "type": "input",
                    "props": {
                        "label": "Серия и номер документа",
                        "placeholder": "0000 000000",
                        "required": True,
                        "fieldId": "documentNumber"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_7",
                    "type": "input",
                    "props": {
                        "label": "Кем выдан",
                        "placeholder": "Наименование органа",
                        "required": True,
                        "fieldId": "documentIssuer"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_8",
                    "type": "date",
                    "props": {
                        "label": "Дата выдачи",
                        "required": True,
                        "fieldId": "documentIssueDate"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                }
            ]
        )

        # 2. Список родственников
        individual_relatives_form_id = create_form(
            db, "individual_relatives", "Список родственников", "Информация о родственниках",
            [
                {
                    "id": "grid_1",
                    "type": "grid",
                    "props": {
                        "label": "Родственники",
                        "fieldId": "relatives",
                        "columns": [
                            {"id": "fullName", "label": "ФИО", "type": "text"},
                            {
                                "id": "relation",
                                "label": "Степень родства",
                                "type": "select",
                                "options": [
                                    {"label": "Супруг/Супруга", "value": "spouse"},
                                    {"label": "Отец", "value": "father"},
                                    {"label": "Мать", "value": "mother"},
                                    {"label": "Сын", "value": "son"},
                                    {"label": "Дочь", "value": "daughter"},
                                    {"label": "Брат", "value": "brother"},
                                    {"label": "Сестра", "value": "sister"}
                                ]
                            },
                            {"id": "birthDate", "label": "Дата рождения", "type": "date"}
                        ]
                    },
                    "children": []
                }
            ]
        )

        # 3. Список адресов
        individual_addresses_form_id = create_form(
            db, "individual_addresses", "Список адресов", "Адреса регистрации и проживания",
            [
                {
                    "id": "grid_2",
                    "type": "grid",
                    "props": {
                        "label": "Адреса",
                        "fieldId": "addresses",
                        "columns": [
                            {
                                "id": "addressType",
                                "label": "Тип адреса",
                                "type": "select",
                                "options": [
                                    {"label": "Основной (регистрация)", "value": "primary"},
                                    {"label": "Фактический", "value": "actual"},
                                    {"label": "Дополнительный", "value": "additional"}
                                ]
                            },
                            {"id": "address", "label": "Адрес", "type": "text"},
                            {"id": "postalCode", "label": "Индекс", "type": "text"}
                        ]
                    },
                    "children": []
                }
            ]
        )

        # Создать корневой тип клиента - Физическое лицо
        individual_id = create_client_type(db, "individual", "Физическое лицо", None, None)

        # Создать дочерние узлы
        create_client_type(db, "individual_general", "Общие данные", individual_general_form_id, individual_id)
        create_client_type(db, "individual_relatives", "Список родственников", individual_relatives_form_id, individual_id)
        create_client_type(db, "individual_addresses", "Список адресов", individual_addresses_form_id, individual_id)

        print("✓ Физическое лицо создано")

        # ===== ЮРИДИЧЕСКОЕ ЛИЦО =====

        print("Создаю данные для Юридического лица...")

        # 1. Основные данные юрлица
        legal_general_form_id = create_form(
            db, "legal_general", "Основные данные", "Основная информация о юридическом лице",
            [
                {
                    "id": "field_10",
                    "type": "input",
                    "props": {
                        "label": "Полное наименование",
                        "placeholder": "ООО \"Название\"",
                        "required": True,
                        "fieldId": "fullName"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_11",
                    "type": "input",
                    "props": {
                        "label": "Сокращенное наименование",
                        "placeholder": "ООО \"Название\"",
                        "fieldId": "shortName"
                    },
                    "children": []
                },
                {
                    "id": "field_12",
                    "type": "select",
                    "props": {
                        "label": "Организационно-правовая форма",
                        "required": True,
                        "fieldId": "legalForm",
                        "options": [
                            {"label": "ООО", "value": "ooo"},
                            {"label": "ЗАО", "value": "zao"},
                            {"label": "ОАО", "value": "oao"},
                            {"label": "ИП", "value": "ip"},
                            {"label": "АО", "value": "ao"}
                        ]
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_13",
                    "type": "input",
                    "props": {
                        "label": "ИНН",
                        "placeholder": "0000000000",
                        "required": True,
                        "fieldId": "inn"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_14",
                    "type": "input",
                    "props": {
                        "label": "КПП",
                        "placeholder": "000000000",
                        "fieldId": "kpp"
                    },
                    "children": []
                },
                {
                    "id": "field_15",
                    "type": "input",
                    "props": {
                        "label": "ОГРН",
                        "placeholder": "0000000000000",
                        "required": True,
                        "fieldId": "ogrn"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_16",
                    "type": "textarea",
                    "props": {
                        "label": "Юридический адрес",
                        "placeholder": "Введите полный адрес",
                        "required": True,
                        "fieldId": "legalAddress"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_17",
                    "type": "textarea",
                    "props": {
                        "label": "Фактический адрес",
                        "placeholder": "Введите полный адрес",
                        "fieldId": "actualAddress"
                    },
                    "children": []
                }
            ]
        )

        # 2. Банковские реквизиты
        legal_requisites_form_id = create_form(
            db, "legal_requisites", "Банковские реквизиты", "Информация о банковских счетах",
            [
                {
                    "id": "field_20",
                    "type": "input",
                    "props": {
                        "label": "Наименование банка",
                        "placeholder": "ПАО \"Банк\"",
                        "required": True,
                        "fieldId": "bankName"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_21",
                    "type": "input",
                    "props": {
                        "label": "БИК",
                        "placeholder": "000000000",
                        "required": True,
                        "fieldId": "bik"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_22",
                    "type": "input",
                    "props": {
                        "label": "Расчетный счет",
                        "placeholder": "00000000000000000000",
                        "required": True,
                        "fieldId": "accountNumber"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                },
                {
                    "id": "field_23",
                    "type": "input",
                    "props": {
                        "label": "Корреспондентский счет",
                        "placeholder": "00000000000000000000",
                        "required": True,
                        "fieldId": "corrAccount"
                    },
                    "validation": [{"type": "required", "message": "Обязательное поле"}],
                    "children": []
                }
            ]
        )

        # 3. Контрагенты
        legal_contractors_form_id = create_form(
            db, "legal_contractors", "Контрагенты", "Список контрагентов компании",
            [
                {
                    "id": "grid_3",
                    "type": "grid",
                    "props": {
                        "label": "Контрагенты",
                        "fieldId": "contractors",
                        "columns": [
                            {"id": "name", "label": "Наименование", "type": "text"},
                            {"id": "inn", "label": "ИНН", "type": "text"},
                            {
                                "id": "contractorType",
                                "label": "Тип контрагента",
                                "type": "select",
                                "options": [
                                    {"label": "Поставщик", "value": "supplier"},
                                    {"label": "Покупатель", "value": "buyer"},
                                    {"label": "Партнер", "value": "partner"}
                                ]
                            }
                        ]
                    },
                    "children": []
                }
            ]
        )

        # 4. Контактные лица
        legal_contacts_form_id = create_form(
            db, "legal_contacts", "Контактные лица", "Список контактных лиц компании",
            [
                {
                    "id": "grid_4",
                    "type": "grid",
                    "props": {
                        "label": "Контактные лица",
                        "fieldId": "contacts",
                        "columns": [
                            {"id": "fullName", "label": "ФИО", "type": "text"},
                            {"id": "position", "label": "Должность", "type": "text"},
                            {"id": "phone", "label": "Телефон", "type": "text"},
                            {"id": "email", "label": "Email", "type": "text"}
                        ]
                    },
                    "children": []
                }
            ]
        )

        # 5. Документы компании
        legal_documents_form_id = create_form(
            db, "legal_documents", "Документы", "Учредительные и регистрационные документы",
            [
                {
                    "id": "grid_5",
                    "type": "grid",
                    "props": {
                        "label": "Документы",
                        "fieldId": "documents",
                        "columns": [
                            {
                                "id": "documentType",
                                "label": "Тип документа",
                                "type": "select",
                                "options": [
                                    {"label": "Устав", "value": "charter"},
                                    {"label": "Свидетельство о регистрации", "value": "registration"},
                                    {"label": "Лицензия", "value": "license"},
                                    {"label": "Договор", "value": "contract"}
                                ]
                            },
                            {"id": "documentNumber", "label": "Номер документа", "type": "text"},
                            {"id": "issueDate", "label": "Дата выдачи", "type": "date"}
                        ]
                    },
                    "children": []
                }
            ]
        )

        # Создать корневой тип клиента - Юридическое лицо
        legal_entity_id = create_client_type(db, "legal_entity", "Юридическое лицо", None, None)

        # Создать дочерние узлы
        create_client_type(db, "legal_general", "Основные данные", legal_general_form_id, legal_entity_id)
        create_client_type(db, "legal_requisites", "Банковские реквизиты", legal_requisites_form_id, legal_entity_id)
        create_client_type(db, "legal_contractors", "Контрагенты", legal_contractors_form_id, legal_entity_id)
        create_client_type(db, "legal_contacts", "Контактные лица", legal_contacts_form_id, legal_entity_id)
        create_client_type(db, "legal_documents", "Документы", legal_documents_form_id, legal_entity_id)

        print("✓ Юридическое лицо создано")

        # Сохранить все изменения
        db.commit()
        print("\n✓ Данные успешно инициализированы!")
        print("\nСоздано:")
        print("  - 2 типа клиентов (Физлицо и Юрлицо)")
        print("  - 3 узла для Физлица (Общие данные, Родственники, Адреса)")
        print("  - 5 узлов для Юрлица (Основные данные, Реквизиты, Контрагенты, Контакты, Документы)")
        print("  - 8 форм с различными полями и гридами")

    except Exception as e:
        db.rollback()
        print(f"Ошибка при инициализации: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_data()
