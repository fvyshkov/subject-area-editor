#!/usr/bin/env python3
"""
Database restore script for subject-area-editor
Generated: 2025-12-27T09:52:59.168373

Subject Areas: 3
Domain Concepts: 85
References: 28
"""
import requests

API_URL = "http://localhost:8001"

SUBJECT_AREAS = [
  {
    "id": "8a42fa72-6b5a-4dd1-87b5-187a510efb27",
    "code": "area_1",
    "name": "Клиенты и счета",
    "parent_id": null,
    "reference_id": null,
    "sort_order": 0,
    "is_terminal": false,
    "created_at": "2025-12-24T16:02:30.889163",
    "updated_at": "2025-12-27T02:18:19.152860"
  },
  {
    "id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "code": "area_2",
    "name": "Клиенты",
    "parent_id": "8a42fa72-6b5a-4dd1-87b5-187a510efb27",
    "reference_id": null,
    "sort_order": 0,
    "is_terminal": true,
    "created_at": "2025-12-24T16:22:57.429974",
    "updated_at": "2025-12-27T02:18:19.152861"
  },
  {
    "id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "code": "area_5",
    "name": "Счета",
    "parent_id": "8a42fa72-6b5a-4dd1-87b5-187a510efb27",
    "reference_id": null,
    "sort_order": 1,
    "is_terminal": true,
    "created_at": "2025-12-27T02:18:19.153788",
    "updated_at": "2025-12-27T02:18:19.153792"
  }
]

DOMAIN_CONCEPTS = [
  {
    "id": "0e46dff4-65aa-44ef-b3cc-896294150af0",
    "code": "attr_1",
    "name": "Attribute 1",
    "subject_area_id": "8a42fa72-6b5a-4dd1-87b5-187a510efb27",
    "parent_id": null,
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 0,
    "created_at": "2025-12-24T16:22:57.429265",
    "updated_at": "2025-12-24T16:22:57.429269"
  },
  {
    "id": "20d05398-0800-4e29-8328-e17913ef8a65",
    "code": "attr_1",
    "name": "Наименование счета",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": "7e0d5d82-e6bb-41b7-bc08-e9f0a9109c49",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 0,
    "created_at": "2025-12-27T02:18:49.897671",
    "updated_at": "2025-12-27T02:50:54.181094"
  },
  {
    "id": "cecf7c56-31a1-432e-a85a-e0bf2c74d927",
    "code": "code",
    "name": "Код",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": "3766097d-d666-4520-8c39-92536e2a93b6",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": "62ee3c36-7c63-4f59-80c8-fd641ada6552",
    "select_options": null,
    "mask": null,
    "sort_order": 0,
    "created_at": "2025-12-27T03:31:42.637447",
    "updated_at": "2025-12-27T03:31:42.637451"
  },
  {
    "id": "c6c6ab97-7346-4959-bb4d-91b461eec6e7",
    "code": "fizlitso",
    "name": "Физлицо",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": null,
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 0,
    "created_at": "2025-12-27T07:52:07.803631",
    "updated_at": "2025-12-27T07:52:07.803634"
  },
  {
    "id": "3766097d-d666-4520-8c39-92536e2a93b6",
    "code": "attr_2",
    "name": "Валюта",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": "7e0d5d82-e6bb-41b7-bc08-e9f0a9109c49",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 1,
    "created_at": "2025-12-27T02:18:49.897675",
    "updated_at": "2025-12-27T03:25:42.644154"
  },
  {
    "id": "a2a0d175-88c4-4c2b-ace6-cf1e0fa21363",
    "code": "name",
    "name": "Название",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": "3766097d-d666-4520-8c39-92536e2a93b6",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": "db7b5c8b-705e-4dd5-bb50-d81cc9e291e3",
    "select_options": null,
    "mask": null,
    "sort_order": 1,
    "created_at": "2025-12-27T03:31:42.637452",
    "updated_at": "2025-12-27T03:31:42.637453"
  },
  {
    "id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "code": "osnovnye_dannye",
    "name": "Основные данные",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c6c6ab97-7346-4959-bb4d-91b461eec6e7",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 1,
    "created_at": "2025-12-27T07:52:07.803634",
    "updated_at": "2025-12-27T07:52:07.803635"
  },
  {
    "id": "28c207f4-eadf-435f-9f14-3888865fc2f2",
    "code": "attr_3",
    "name": "Номер счета",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": "7e0d5d82-e6bb-41b7-bc08-e9f0a9109c49",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 2,
    "created_at": "2025-12-27T02:18:49.897676",
    "updated_at": "2025-12-27T02:50:54.181097"
  },
  {
    "id": "7309ad36-41e8-4a8b-bc12-9ea72736f7d0",
    "code": "photo",
    "name": "Фото",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 2,
    "created_at": "2025-12-27T07:52:07.804030",
    "updated_at": "2025-12-27T07:52:07.804031"
  },
  {
    "id": "7e0d5d82-e6bb-41b7-bc08-e9f0a9109c49",
    "code": "attr_4",
    "name": "Текущий счет ",
    "subject_area_id": "f523e338-fa26-49c0-8b36-6179f9da17d0",
    "parent_id": null,
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 3,
    "created_at": "2025-12-27T02:44:44.057084",
    "updated_at": "2025-12-27T02:44:49.244519"
  },
  {
    "id": "14afaf96-0d42-4d50-9cb1-b4285725b453",
    "code": "code",
    "name": "Код",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 3,
    "created_at": "2025-12-27T07:52:07.804031",
    "updated_at": "2025-12-27T07:52:07.804031"
  },
  {
    "id": "2490d597-0c00-47be-8ba8-89d94fbc6d4c",
    "code": "last_name",
    "name": "Фамилия",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 4,
    "created_at": "2025-12-27T07:52:07.804031",
    "updated_at": "2025-12-27T07:52:07.804032"
  },
  {
    "id": "9e954097-be56-40b3-9ad4-81d8b43b392b",
    "code": "first_name",
    "name": "Имя",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 5,
    "created_at": "2025-12-27T07:52:07.804032",
    "updated_at": "2025-12-27T07:52:07.804032"
  },
  {
    "id": "fc2f118e-f0ee-4d9c-b21a-bfd12fdb44e4",
    "code": "middle_name",
    "name": "Отчество",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 6,
    "created_at": "2025-12-27T07:52:07.804032",
    "updated_at": "2025-12-27T07:52:07.804032"
  },
  {
    "id": "1ab47cb5-602c-4833-b1fd-ee1e2c2adc60",
    "code": "birth_date",
    "name": "Дата рождения",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 7,
    "created_at": "2025-12-27T07:52:07.804033",
    "updated_at": "2025-12-27T07:52:07.804033"
  },
  {
    "id": "1852b273-f299-4d25-9f2a-b9daa23609a4",
    "code": "gender",
    "name": "Пол",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Мужской",
      "Женский"
    ],
    "mask": null,
    "sort_order": 8,
    "created_at": "2025-12-27T07:52:07.804033",
    "updated_at": "2025-12-27T07:52:07.804033"
  },
  {
    "id": "f6e998c2-2da1-454e-bd41-ec8f11c361b7",
    "code": "birth_place",
    "name": "Место рождения",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 9,
    "created_at": "2025-12-27T07:52:07.804033",
    "updated_at": "2025-12-27T07:52:07.804033"
  },
  {
    "id": "8a70bdbc-2b0c-4b69-904d-8869aec0e130",
    "code": "citizenship",
    "name": "Гражданство",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 10,
    "created_at": "2025-12-27T07:52:07.804034",
    "updated_at": "2025-12-27T07:52:07.804034"
  },
  {
    "id": "374a0eee-eddc-46ba-aa20-26c003b6cf9f",
    "code": "nationality",
    "name": "Национальность",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 11,
    "created_at": "2025-12-27T07:52:07.804034",
    "updated_at": "2025-12-27T07:52:07.804034"
  },
  {
    "id": "48e7bc88-3206-4ce8-949d-1d948a6ba461",
    "code": "registration_date",
    "name": "Дата регистрации",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 12,
    "created_at": "2025-12-27T07:52:07.804034",
    "updated_at": "2025-12-27T07:52:07.804035"
  },
  {
    "id": "9e7c7e1c-45d1-4ce9-86fa-7e5871ec9d6d",
    "code": "close_date",
    "name": "Дата закрытия",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 13,
    "created_at": "2025-12-27T07:52:07.804035",
    "updated_at": "2025-12-27T07:52:07.804035"
  },
  {
    "id": "83328452-5c95-473d-8bcf-0c8566e6a3c0",
    "code": "status",
    "name": "Состояние",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c357b8df-4b6f-4ce6-a2ef-760341eb2ea8",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Активен",
      "Заблокирован",
      "Закрыт",
      "В обработке"
    ],
    "mask": null,
    "sort_order": 14,
    "created_at": "2025-12-27T07:52:07.804035",
    "updated_at": "2025-12-27T07:52:07.804035"
  },
  {
    "id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "code": "dopolnitelno",
    "name": "Дополнительно",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c6c6ab97-7346-4959-bb4d-91b461eec6e7",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 15,
    "created_at": "2025-12-27T07:52:07.804162",
    "updated_at": "2025-12-27T07:52:07.804163"
  },
  {
    "id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "code": "addresses",
    "name": "Адреса",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 16,
    "created_at": "2025-12-27T07:52:07.804163",
    "updated_at": "2025-12-27T07:52:07.804163"
  },
  {
    "id": "01228ee8-f440-4b71-a451-73e64d6d66c9",
    "code": "address_type",
    "name": "Тип адреса",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Юридический",
      "Фактический",
      "Почтовый",
      "По прописке"
    ],
    "mask": null,
    "sort_order": 17,
    "created_at": "2025-12-27T07:52:07.804232",
    "updated_at": "2025-12-27T07:52:07.804232"
  },
  {
    "id": "311d3742-41d2-4f12-8352-443fcce7178e",
    "code": "country",
    "name": "Страна",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 18,
    "created_at": "2025-12-27T07:52:07.804233",
    "updated_at": "2025-12-27T07:52:07.804233"
  },
  {
    "id": "f69df51b-aa84-46d8-b47b-59493a0082ad",
    "code": "region",
    "name": "Регион",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 19,
    "created_at": "2025-12-27T07:52:07.804233",
    "updated_at": "2025-12-27T07:52:07.804233"
  },
  {
    "id": "ad717bcf-734b-49af-9529-ae0d6ba1e2e6",
    "code": "city",
    "name": "Город",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 20,
    "created_at": "2025-12-27T07:52:07.804234",
    "updated_at": "2025-12-27T07:52:07.804234"
  },
  {
    "id": "18195fce-52a7-4309-b249-353dd62b8832",
    "code": "street",
    "name": "Улица",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 21,
    "created_at": "2025-12-27T07:52:07.804234",
    "updated_at": "2025-12-27T07:52:07.804234"
  },
  {
    "id": "7fb280df-c4bf-4f40-a67a-871566d6cbcd",
    "code": "house",
    "name": "Дом",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 22,
    "created_at": "2025-12-27T07:52:07.804234",
    "updated_at": "2025-12-27T07:52:07.804234"
  },
  {
    "id": "15cfef51-ff63-451a-a2f4-3dd9f326d1dc",
    "code": "apartment",
    "name": "Квартира",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 23,
    "created_at": "2025-12-27T07:52:07.804235",
    "updated_at": "2025-12-27T07:52:07.804235"
  },
  {
    "id": "8f732c8b-fa55-43f8-bbcc-219ae26e905e",
    "code": "postal_code",
    "name": "Индекс",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "81b7d5ac-9062-4fb0-bb15-a7a1472e8476",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 24,
    "created_at": "2025-12-27T07:52:07.804235",
    "updated_at": "2025-12-27T07:52:07.804235"
  },
  {
    "id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "code": "documents",
    "name": "Документы",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 25,
    "created_at": "2025-12-27T07:52:07.804307",
    "updated_at": "2025-12-27T07:52:07.804307"
  },
  {
    "id": "f9955bfb-2bfc-4ece-88f6-781245e3d0c2",
    "code": "doc_type",
    "name": "Вид документа",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Паспорт РФ",
      "Загранпаспорт",
      "Водительское удостоверение",
      "СНИЛС",
      "ИНН"
    ],
    "mask": null,
    "sort_order": 26,
    "created_at": "2025-12-27T07:52:07.804361",
    "updated_at": "2025-12-27T07:52:07.804361"
  },
  {
    "id": "a5f48d7f-b4d4-492e-a2f5-42fd5862fc3e",
    "code": "doc_series",
    "name": "Серия",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 27,
    "created_at": "2025-12-27T07:52:07.804361",
    "updated_at": "2025-12-27T07:52:07.804362"
  },
  {
    "id": "7a5d226d-2f5e-4723-86d6-660e1f08ac19",
    "code": "doc_number",
    "name": "Номер",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 28,
    "created_at": "2025-12-27T07:52:07.804362",
    "updated_at": "2025-12-27T07:52:07.804362"
  },
  {
    "id": "80071a82-f13b-4c29-84f1-c417e67ea63a",
    "code": "doc_issue_date",
    "name": "Дата выдачи",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 29,
    "created_at": "2025-12-27T07:52:07.804362",
    "updated_at": "2025-12-27T07:52:07.804362"
  },
  {
    "id": "3a3fcc96-ecab-453d-969a-9239ea95c8c6",
    "code": "doc_issuer",
    "name": "Кем выдан",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 30,
    "created_at": "2025-12-27T07:52:07.804362",
    "updated_at": "2025-12-27T07:52:07.804363"
  },
  {
    "id": "b94b06fb-b565-44eb-9c25-7358b77525c2",
    "code": "doc_expiry",
    "name": "Срок действия",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "1cec3cf7-ec75-4fd6-a991-f7148ad8ea2d",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 31,
    "created_at": "2025-12-27T07:52:07.804363",
    "updated_at": "2025-12-27T07:52:07.804363"
  },
  {
    "id": "321f37c0-b2fd-4521-ae0f-eb768bc2fc49",
    "code": "contacts",
    "name": "Контакты",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 32,
    "created_at": "2025-12-27T07:52:07.804417",
    "updated_at": "2025-12-27T07:52:07.804417"
  },
  {
    "id": "a4f51b7f-6b3c-4d90-993c-2ba9ffd27282",
    "code": "contact_type",
    "name": "Тип контакта",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "321f37c0-b2fd-4521-ae0f-eb768bc2fc49",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Мобильный телефон",
      "Email",
      "Рабочий телефон",
      "Домашний телефон"
    ],
    "mask": null,
    "sort_order": 33,
    "created_at": "2025-12-27T07:52:07.804459",
    "updated_at": "2025-12-27T07:52:07.804460"
  },
  {
    "id": "7d0a3573-871b-4353-a097-1bea71dd10b4",
    "code": "contact_kind",
    "name": "Вид",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "321f37c0-b2fd-4521-ae0f-eb768bc2fc49",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Рабочий",
      "Личный"
    ],
    "mask": null,
    "sort_order": 34,
    "created_at": "2025-12-27T07:52:07.804460",
    "updated_at": "2025-12-27T07:52:07.804460"
  },
  {
    "id": "2dd57478-0cad-4b8c-971c-d2c9a7d84390",
    "code": "contact_value",
    "name": "Значение",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "321f37c0-b2fd-4521-ae0f-eb768bc2fc49",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 35,
    "created_at": "2025-12-27T07:52:07.804460",
    "updated_at": "2025-12-27T07:52:07.804460"
  },
  {
    "id": "a9e2a631-3bd1-46fb-93fe-cf9971a7b6ab",
    "code": "contact_primary",
    "name": "Основной",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "321f37c0-b2fd-4521-ae0f-eb768bc2fc49",
    "concept_type": "attribute",
    "data_type": "boolean",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 36,
    "created_at": "2025-12-27T07:52:07.804461",
    "updated_at": "2025-12-27T07:52:07.804461"
  },
  {
    "id": "a936e9fd-e302-4e53-98a7-64a341742347",
    "code": "relatives",
    "name": "Родственники",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 37,
    "created_at": "2025-12-27T07:52:07.804503",
    "updated_at": "2025-12-27T07:52:07.804503"
  },
  {
    "id": "0628662d-a3af-496c-ae4b-89a281aa2f23",
    "code": "rel_type",
    "name": "Степень родства",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "a936e9fd-e302-4e53-98a7-64a341742347",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Супруг(а)",
      "Ребенок",
      "Родитель",
      "Брат/Сестра",
      "Другой"
    ],
    "mask": null,
    "sort_order": 38,
    "created_at": "2025-12-27T07:52:07.804544",
    "updated_at": "2025-12-27T07:52:07.804544"
  },
  {
    "id": "2087435a-be63-4a69-8725-12faf88afe05",
    "code": "rel_fio",
    "name": "ФИО",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "a936e9fd-e302-4e53-98a7-64a341742347",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 39,
    "created_at": "2025-12-27T07:52:07.804544",
    "updated_at": "2025-12-27T07:52:07.804545"
  },
  {
    "id": "26d23b58-9b6a-4f1e-976e-6f2705cc2312",
    "code": "rel_birth_date",
    "name": "Дата рождения",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "a936e9fd-e302-4e53-98a7-64a341742347",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 40,
    "created_at": "2025-12-27T07:52:07.804545",
    "updated_at": "2025-12-27T07:52:07.804545"
  },
  {
    "id": "e7dc2d5e-1212-4538-9ec4-71f93b46cc4c",
    "code": "rel_gender",
    "name": "Пол",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "a936e9fd-e302-4e53-98a7-64a341742347",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Мужской",
      "Женский"
    ],
    "mask": null,
    "sort_order": 41,
    "created_at": "2025-12-27T07:52:07.804545",
    "updated_at": "2025-12-27T07:52:07.804545"
  },
  {
    "id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "code": "employment",
    "name": "Занятость",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 42,
    "created_at": "2025-12-27T07:52:07.804586",
    "updated_at": "2025-12-27T07:52:07.804587"
  },
  {
    "id": "823751fa-c4df-4781-9ac5-1460da7bd46e",
    "code": "emp_type",
    "name": "Тип занятости",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Основная",
      "Совместительство",
      "Временная"
    ],
    "mask": null,
    "sort_order": 43,
    "created_at": "2025-12-27T07:52:07.804636",
    "updated_at": "2025-12-27T07:52:07.804636"
  },
  {
    "id": "eb269607-3e73-4654-a12e-e586c2d0b2d8",
    "code": "emp_kind",
    "name": "Вид занятости",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Работа по найму",
      "Предприниматель",
      "Самозанятый",
      "Пенсионер",
      "Студент"
    ],
    "mask": null,
    "sort_order": 44,
    "created_at": "2025-12-27T07:52:07.804636",
    "updated_at": "2025-12-27T07:52:07.804636"
  },
  {
    "id": "32c8189e-36a7-4604-9485-53edb348753f",
    "code": "emp_org",
    "name": "Организация",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 45,
    "created_at": "2025-12-27T07:52:07.804637",
    "updated_at": "2025-12-27T07:52:07.804637"
  },
  {
    "id": "fb32d9d8-9a0f-49af-b6d5-af1b6d7737ef",
    "code": "emp_position",
    "name": "Должность",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 46,
    "created_at": "2025-12-27T07:52:07.804637",
    "updated_at": "2025-12-27T07:52:07.804637"
  },
  {
    "id": "bc2bee8b-5585-4ee1-8951-cdbb5e472136",
    "code": "emp_start",
    "name": "Зачислен",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 47,
    "created_at": "2025-12-27T07:52:07.804637",
    "updated_at": "2025-12-27T07:52:07.804638"
  },
  {
    "id": "0c045ecc-9ab7-4921-8ffc-28ed1e1fff62",
    "code": "emp_end",
    "name": "Уволен",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c75c02f8-37d0-4c68-b7b7-70ab8ffeeee7",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 48,
    "created_at": "2025-12-27T07:52:07.804638",
    "updated_at": "2025-12-27T07:52:07.804638"
  },
  {
    "id": "f25f2577-e1e2-4169-a7aa-d7877c75e97c",
    "code": "classification",
    "name": "Классификация",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "bcfacda9-5b44-4939-acf0-5b1c8ed19a61",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 49,
    "created_at": "2025-12-27T07:52:07.804717",
    "updated_at": "2025-12-27T07:52:07.804717"
  },
  {
    "id": "55c3c07d-986d-4b25-b86b-675d82664b49",
    "code": "class_type",
    "name": "Наименование",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "f25f2577-e1e2-4169-a7aa-d7877c75e97c",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Типы Клиентов",
      "Сегментация юр.лиц",
      "Виды экономической деятельности"
    ],
    "mask": null,
    "sort_order": 50,
    "created_at": "2025-12-27T07:52:07.804755",
    "updated_at": "2025-12-27T07:52:07.804755"
  },
  {
    "id": "c80fda62-a290-4ab9-9ab4-0a167d1af07b",
    "code": "class_value",
    "name": "Значение",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "f25f2577-e1e2-4169-a7aa-d7877c75e97c",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 51,
    "created_at": "2025-12-27T07:52:07.804755",
    "updated_at": "2025-12-27T07:52:07.804755"
  },
  {
    "id": "17d8b628-a3a8-4176-873b-6508251aa0a3",
    "code": "bankovskoe_obsluzhivanie",
    "name": "Банковское обслуживание",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "c6c6ab97-7346-4959-bb4d-91b461eec6e7",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 52,
    "created_at": "2025-12-27T07:52:07.804824",
    "updated_at": "2025-12-27T07:52:07.804825"
  },
  {
    "id": "319f9e43-6fdc-4c03-ac97-fdcbdf999984",
    "code": "bank_relations",
    "name": "Взаимоотношения с банком",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "17d8b628-a3a8-4176-873b-6508251aa0a3",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 53,
    "created_at": "2025-12-27T07:52:07.804826",
    "updated_at": "2025-12-27T07:52:07.804826"
  },
  {
    "id": "f7a720bb-1eda-4f69-90b7-4dee7aca9b10",
    "code": "bank_rel_type",
    "name": "Вид взаимоотношения",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "319f9e43-6fdc-4c03-ac97-fdcbdf999984",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Вкладчик",
      "Заемщик",
      "Владелец карты",
      "Клиент ДБО"
    ],
    "mask": null,
    "sort_order": 54,
    "created_at": "2025-12-27T07:52:07.804882",
    "updated_at": "2025-12-27T07:52:07.804883"
  },
  {
    "id": "38c358ba-a5c9-4fb5-bc01-a76837a639a2",
    "code": "bank_rel_from",
    "name": "Дата с",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "319f9e43-6fdc-4c03-ac97-fdcbdf999984",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 55,
    "created_at": "2025-12-27T07:52:07.804883",
    "updated_at": "2025-12-27T07:52:07.804883"
  },
  {
    "id": "156d4575-50e8-41eb-8053-e2c05e52f43c",
    "code": "bank_rel_to",
    "name": "Дата по",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "319f9e43-6fdc-4c03-ac97-fdcbdf999984",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 56,
    "created_at": "2025-12-27T07:52:07.804883",
    "updated_at": "2025-12-27T07:52:07.804884"
  },
  {
    "id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "code": "national_requisites",
    "name": "Национальные реквизиты",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "17d8b628-a3a8-4176-873b-6508251aa0a3",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 57,
    "created_at": "2025-12-27T07:52:07.804924",
    "updated_at": "2025-12-27T07:52:07.804925"
  },
  {
    "id": "87839e13-03e6-4319-952d-ee0d56e2d2f2",
    "code": "nat_code",
    "name": "Код реквизита",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 58,
    "created_at": "2025-12-27T07:52:07.804977",
    "updated_at": "2025-12-27T07:52:07.804978"
  },
  {
    "id": "210cf1b3-8fe6-4af6-90bc-b016028359ea",
    "code": "nat_account_type",
    "name": "Тип счета",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "Расчетный",
      "Депозитный",
      "Карточный"
    ],
    "mask": null,
    "sort_order": 59,
    "created_at": "2025-12-27T07:52:07.804978",
    "updated_at": "2025-12-27T07:52:07.804978"
  },
  {
    "id": "6fba595b-58ca-4eb1-8e65-0c11cdbb8734",
    "code": "nat_bik",
    "name": "БИК",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 60,
    "created_at": "2025-12-27T07:52:07.804978",
    "updated_at": "2025-12-27T07:52:07.804978"
  },
  {
    "id": "2b1354bb-d953-4e04-afdb-6cacf415b165",
    "code": "nat_bank_name",
    "name": "Наименование банка",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 61,
    "created_at": "2025-12-27T07:52:07.804979",
    "updated_at": "2025-12-27T07:52:07.804979"
  },
  {
    "id": "bd867d5a-fb4b-4282-9a67-72a189b1f678",
    "code": "nat_account",
    "name": "Расчетный счет",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 62,
    "created_at": "2025-12-27T07:52:07.804979",
    "updated_at": "2025-12-27T07:52:07.804979"
  },
  {
    "id": "4ee91941-464e-42ae-9f6f-f6e5be0055af",
    "code": "nat_corr_account",
    "name": "Корр. счет банка",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "0978f039-9d5a-4b50-8032-0cd795dc8511",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 63,
    "created_at": "2025-12-27T07:52:07.804979",
    "updated_at": "2025-12-27T07:52:07.804979"
  },
  {
    "id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "code": "international_requisites",
    "name": "Международные реквизиты",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "17d8b628-a3a8-4176-873b-6508251aa0a3",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 64,
    "created_at": "2025-12-27T07:52:07.805033",
    "updated_at": "2025-12-27T07:52:07.805033"
  },
  {
    "id": "845cf4a4-79d4-4a6d-a5a6-253c9ba9f79c",
    "code": "int_swift",
    "name": "SWIFT/BIC код",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 65,
    "created_at": "2025-12-27T07:52:07.805078",
    "updated_at": "2025-12-27T07:52:07.805079"
  },
  {
    "id": "d1e00bc1-0554-49ad-8834-e0a6296fb56c",
    "code": "int_corr_account",
    "name": "Корр. счет",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 66,
    "created_at": "2025-12-27T07:52:07.805079",
    "updated_at": "2025-12-27T07:52:07.805079"
  },
  {
    "id": "421dc32c-49d3-43eb-9421-ff372ae47e15",
    "code": "int_bank_name",
    "name": "Полное наименование банка",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 67,
    "created_at": "2025-12-27T07:52:07.805079",
    "updated_at": "2025-12-27T07:52:07.805079"
  },
  {
    "id": "510cde73-13fc-4d19-8634-310d9a522d72",
    "code": "int_iban",
    "name": "IBAN или номер счета",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 68,
    "created_at": "2025-12-27T07:52:07.805080",
    "updated_at": "2025-12-27T07:52:07.805080"
  },
  {
    "id": "6165a634-51fa-4e67-9bd2-b816c01b9970",
    "code": "int_beneficiary",
    "name": "Полное наименование получателя",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "50ee5f0b-32dd-4229-a400-5cca29f9bf74",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 69,
    "created_at": "2025-12-27T07:52:07.805080",
    "updated_at": "2025-12-27T07:52:07.805080"
  },
  {
    "id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "code": "service_conditions",
    "name": "Условия обслуживания",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "17d8b628-a3a8-4176-873b-6508251aa0a3",
    "concept_type": "list",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 70,
    "created_at": "2025-12-27T07:52:07.805127",
    "updated_at": "2025-12-27T07:52:07.805127"
  },
  {
    "id": "254cad8a-6066-49e2-afc6-8bc2c4c3df2f",
    "code": "svc_group",
    "name": "Группа обслуживания",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "select",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": [
      "VIP",
      "Стандартный",
      "Базовый"
    ],
    "mask": null,
    "sort_order": 71,
    "created_at": "2025-12-27T07:52:07.805178",
    "updated_at": "2025-12-27T07:52:07.805178"
  },
  {
    "id": "2125a8c5-8b4f-40b6-8a2c-5e20f050894b",
    "code": "svc_branch",
    "name": "Подразделение ведения",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 72,
    "created_at": "2025-12-27T07:52:07.805178",
    "updated_at": "2025-12-27T07:52:07.805178"
  },
  {
    "id": "ad072be1-ed3d-4489-ba84-fe24d7ba5169",
    "code": "svc_manager",
    "name": "Персональный менеджер",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 73,
    "created_at": "2025-12-27T07:52:07.805179",
    "updated_at": "2025-12-27T07:52:07.805179"
  },
  {
    "id": "5232edb2-cb97-4daa-8eee-81d81735322d",
    "code": "svc_start",
    "name": "Дата начала обслуживания",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 74,
    "created_at": "2025-12-27T07:52:07.805179",
    "updated_at": "2025-12-27T07:52:07.805179"
  },
  {
    "id": "dc8ecd90-f0a1-45ce-a522-4e592dcafa83",
    "code": "svc_end",
    "name": "Дата окончания обслуживания",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "date",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 75,
    "created_at": "2025-12-27T07:52:07.805179",
    "updated_at": "2025-12-27T07:52:07.805179"
  },
  {
    "id": "94e74ec2-9d75-4d0f-b6c9-551673259f08",
    "code": "svc_secret_question",
    "name": "Секретный вопрос",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 76,
    "created_at": "2025-12-27T07:52:07.805180",
    "updated_at": "2025-12-27T07:52:07.805180"
  },
  {
    "id": "0fa9a5b0-dfaa-4342-a157-807bb255d24e",
    "code": "svc_secret_answer",
    "name": "Ответ на секретный вопрос",
    "subject_area_id": "e7ff4200-7112-40c3-9776-304b167b9659",
    "parent_id": "ebefd50e-6a9c-4130-a933-f51515c3c81d",
    "concept_type": "attribute",
    "data_type": "text",
    "base_concept_id": null,
    "reference_id": null,
    "reference_field_id": null,
    "select_options": null,
    "mask": null,
    "sort_order": 77,
    "created_at": "2025-12-27T07:52:07.805180",
    "updated_at": "2025-12-27T07:52:07.805180"
  }
]

REFERENCES = [
  {
    "id": "bd23a710-33bb-4faf-af24-59d37089b792",
    "code": "111new_reference",
    "name": "Семейное положение",
    "parent_id": null,
    "sort_order": 0,
    "is_hierarchical": true,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-09T11:57:46.961437",
    "updated_at": "2025-12-17T16:26:34.141542"
  },
  {
    "id": "d6097dde-f6b1-4c16-805c-6363581f4825",
    "code": "gender",
    "name": "Пол",
    "parent_id": null,
    "sort_order": 0,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.346133",
    "updated_at": "2025-12-18T21:18:28.346134"
  },
  {
    "id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
    "code": "currencies",
    "name": "Валюты",
    "parent_id": null,
    "sort_order": 0,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-27T03:23:41.295773",
    "updated_at": "2025-12-27T03:23:41.295775"
  },
  {
    "id": "792f2aaf-6b54-4ad6-984b-502370af27e8",
    "code": "contact_type",
    "name": "Типы контактов",
    "parent_id": null,
    "sort_order": 0,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-27T06:44:00.025562",
    "updated_at": "2025-12-27T06:44:00.025564"
  },
  {
    "id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
    "code": "client_category_fl",
    "name": "Категории клиентов ФЛ",
    "parent_id": null,
    "sort_order": 1,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.348853",
    "updated_at": "2025-12-18T21:18:28.348854"
  },
  {
    "id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
    "code": "classifiers",
    "name": "Классификаторы",
    "parent_id": null,
    "sort_order": 1,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T22:26:28",
    "updated_at": "2025-12-18T22:26:28"
  },
  {
    "id": "4feb0c0d-44d7-4186-a457-5c7092002556",
    "code": "client_status",
    "name": "Состояния клиента",
    "parent_id": null,
    "sort_order": 2,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.350906",
    "updated_at": "2025-12-18T21:18:28.350907"
  },
  {
    "id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
    "code": "classifier_values",
    "name": "Значения классификаторов",
    "parent_id": null,
    "sort_order": 2,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T22:31:11",
    "updated_at": "2025-12-18T22:31:11"
  },
  {
    "id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
    "code": "salutation",
    "name": "Обращения",
    "parent_id": null,
    "sort_order": 3,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.353621",
    "updated_at": "2025-12-18T21:18:28.353623"
  },
  {
    "id": "ec37219c-ed07-4482-8d41-df684c427866",
    "code": "nationality",
    "name": "Национальности",
    "parent_id": null,
    "sort_order": 4,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.356195",
    "updated_at": "2025-12-18T21:18:28.356197"
  },
  {
    "id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
    "code": "language",
    "name": "Языки общения",
    "parent_id": null,
    "sort_order": 5,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.359061",
    "updated_at": "2025-12-18T21:18:28.359062"
  },
  {
    "id": "a08c1548-df36-490c-bdc8-f2281c964abb",
    "code": "country",
    "name": "Страны",
    "parent_id": null,
    "sort_order": 6,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.362015",
    "updated_at": "2025-12-18T21:18:28.362018"
  },
  {
    "id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
    "code": "identity_doc_type",
    "name": "Типы удостоверяющих документов",
    "parent_id": null,
    "sort_order": 7,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.364716",
    "updated_at": "2025-12-18T21:18:28.364718"
  },
  {
    "id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
    "code": "document_type",
    "name": "Типы документов",
    "parent_id": null,
    "sort_order": 8,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.367057",
    "updated_at": "2025-12-18T21:18:28.367058"
  },
  {
    "id": "347bd3f9-0204-4225-a59a-120c791c8290",
    "code": "employment_type",
    "name": "Типы занятости",
    "parent_id": null,
    "sort_order": 9,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.369222",
    "updated_at": "2025-12-18T21:18:28.369222"
  },
  {
    "id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
    "code": "employment_kind",
    "name": "Виды занятости",
    "parent_id": null,
    "sort_order": 10,
    "is_hierarchical": false,
    "data_by_script": true,
    "calculation_code": "return [{\"code\": 1, \"name\": 2}, {\"code\": 1, \"name\": 2}]",
    "created_at": "2025-12-18T21:18:28.371271",
    "updated_at": "2025-12-27T01:39:03.089222"
  },
  {
    "id": "0d30f188-9006-42b1-840d-e83475828d0a",
    "code": "relation_degree",
    "name": "Степени родства",
    "parent_id": null,
    "sort_order": 11,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.373496",
    "updated_at": "2025-12-18T21:18:28.373497"
  },
  {
    "id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
    "code": "education_level",
    "name": "Образование",
    "parent_id": null,
    "sort_order": 12,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.375718",
    "updated_at": "2025-12-18T21:18:28.375719"
  },
  {
    "id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
    "code": "service_group",
    "name": "Группы обслуживания",
    "parent_id": null,
    "sort_order": 13,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.378071",
    "updated_at": "2025-12-18T21:18:28.378072"
  },
  {
    "id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
    "code": "account_type",
    "name": "Типы счетов",
    "parent_id": null,
    "sort_order": 14,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.380191",
    "updated_at": "2025-12-18T21:18:28.380192"
  },
  {
    "id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
    "code": "address_type",
    "name": "Типы адресов",
    "parent_id": null,
    "sort_order": 15,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.382195",
    "updated_at": "2025-12-18T21:18:28.382195"
  },
  {
    "id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
    "code": "classifier_type",
    "name": "Типы классификаторов",
    "parent_id": null,
    "sort_order": 16,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.384249",
    "updated_at": "2025-12-18T21:18:28.384250"
  },
  {
    "id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
    "code": "bank_relation_type",
    "name": "Виды взаимоотношений с банком",
    "parent_id": null,
    "sort_order": 17,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.386396",
    "updated_at": "2025-12-18T21:18:28.386397"
  },
  {
    "id": "3cc91636-8866-4544-b54b-4dd654981da3",
    "code": "region",
    "name": "Регионы",
    "parent_id": null,
    "sort_order": 18,
    "is_hierarchical": true,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.388880",
    "updated_at": "2025-12-18T21:18:28.388882"
  },
  {
    "id": "fecca2b0-5092-4a96-9f9a-183d4c9ae96a",
    "code": "economic_activity",
    "name": "Виды экономической деятельности",
    "parent_id": null,
    "sort_order": 19,
    "is_hierarchical": true,
    "data_by_script": false,
    "calculation_code": "return [{\"code\": 1, \"name\": 2}]",
    "created_at": "2025-12-18T21:18:28.391439",
    "updated_at": "2025-12-26T11:33:47.857604"
  },
  {
    "id": "cde41d0d-4d87-41b8-8532-68de283d45fb",
    "code": "economic_sector",
    "name": "Экономические секторы",
    "parent_id": null,
    "sort_order": 20,
    "is_hierarchical": true,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.394092",
    "updated_at": "2025-12-18T21:18:28.394094"
  },
  {
    "id": "1ef3a3b6-310c-4210-93fe-ef84961cbf0a",
    "code": "cb_classification",
    "name": "Классификация ЦБ",
    "parent_id": null,
    "sort_order": 21,
    "is_hierarchical": true,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.397503",
    "updated_at": "2025-12-18T21:18:28.397505"
  },
  {
    "id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
    "code": "banks",
    "name": "Банки",
    "parent_id": null,
    "sort_order": 22,
    "is_hierarchical": false,
    "data_by_script": false,
    "calculation_code": null,
    "created_at": "2025-12-18T21:18:28.399862",
    "updated_at": "2025-12-18T21:18:28.399863"
  }
]

REFERENCE_FIELDS = {
  "bd23a710-33bb-4faf-af24-59d37089b792": [
    {
      "id": "3c6d72f2-964a-4a12-8884-c45319070797",
      "reference_id": "bd23a710-33bb-4faf-af24-59d37089b792",
      "code": "",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-09T11:57:56.664836",
      "updated_at": "2025-12-10T07:50:29.484197"
    }
  ],
  "d6097dde-f6b1-4c16-805c-6363581f4825": [
    {
      "id": "a003ca87-8363-4159-8947-49e48dec7298",
      "reference_id": "d6097dde-f6b1-4c16-805c-6363581f4825",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.402662",
      "updated_at": "2025-12-18T21:18:28.402663"
    },
    {
      "id": "2020c806-7a32-4a52-a103-7fd8f76a5b14",
      "reference_id": "d6097dde-f6b1-4c16-805c-6363581f4825",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.404859",
      "updated_at": "2025-12-18T21:18:28.404860"
    }
  ],
  "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c": [
    {
      "id": "62ee3c36-7c63-4f59-80c8-fd641ada6552",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-27T03:25:08.560476",
      "updated_at": "2025-12-27T03:25:08.560478"
    },
    {
      "id": "db7b5c8b-705e-4dd5-bb50-d81cc9e291e3",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-27T03:25:08.568794",
      "updated_at": "2025-12-27T03:34:15.082891"
    }
  ],
  "792f2aaf-6b54-4ad6-984b-502370af27e8": [],
  "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6": [
    {
      "id": "86a488d2-5d54-4e29-88d0-42cc5faef555",
      "reference_id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.407066",
      "updated_at": "2025-12-18T21:18:28.407067"
    },
    {
      "id": "a1f82072-287d-44aa-aea5-c06c8eaab156",
      "reference_id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.409207",
      "updated_at": "2025-12-18T21:18:28.409208"
    }
  ],
  "a90fb5e4-04ad-4840-9388-c978b5a35d4c": [
    {
      "id": "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "code": "client_type",
      "name": "Тип клиента",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 2,
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "5a6150ac-56a9-4982-a1ac-a7027ab24200",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 3,
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    }
  ],
  "4feb0c0d-44d7-4186-a457-5c7092002556": [
    {
      "id": "3fd9744b-487a-4ba7-9e25-4c24bbf7550c",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.411409",
      "updated_at": "2025-12-18T21:18:28.411411"
    },
    {
      "id": "94b4a6a9-e1c2-4a53-885a-a0597321cfc8",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.414147",
      "updated_at": "2025-12-18T21:18:28.414148"
    }
  ],
  "4958d8a1-2967-4db7-877a-692a7bdc2aca": [
    {
      "id": "6e7a7bbf-5092-4973-bc9f-59c09fab36ef",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "code": "classifier_type",
      "name": "Тип классификатора",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "9948df9b-c1ed-40df-b2f5-b5d1189302e6",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 2,
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "7367d547-3b46-4f30-97d8-32b63d4a816b",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 3,
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    }
  ],
  "37d90314-29e9-4755-bb6d-285f92ee11f0": [
    {
      "id": "1a12af78-ff38-4413-9d9f-a5e51af0d4e1",
      "reference_id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.416420",
      "updated_at": "2025-12-18T21:18:28.416420"
    },
    {
      "id": "338262c9-feae-4e6f-ab93-211ed1347c62",
      "reference_id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.418534",
      "updated_at": "2025-12-18T21:18:28.418534"
    }
  ],
  "ec37219c-ed07-4482-8d41-df684c427866": [
    {
      "id": "031cccec-f0ff-47e8-98a8-bc059f5ff322",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.420642",
      "updated_at": "2025-12-18T21:18:28.420643"
    },
    {
      "id": "f682d202-d411-47e3-85c6-cf8c7c6bc65d",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.423373",
      "updated_at": "2025-12-18T21:18:28.423375"
    }
  ],
  "8f74467a-200c-4d6e-a3c8-709145e6eb6d": [
    {
      "id": "3798e93c-29bf-4554-8840-fd95a8d9a34e",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.426039",
      "updated_at": "2025-12-18T21:18:28.426040"
    },
    {
      "id": "1a558ef7-3480-45eb-8743-617ba4f0382f",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.428451",
      "updated_at": "2025-12-18T21:18:28.428452"
    }
  ],
  "a08c1548-df36-490c-bdc8-f2281c964abb": [
    {
      "id": "47e50c52-0c6f-4854-98e5-dd646759c323",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.431011",
      "updated_at": "2025-12-18T21:18:28.431012"
    },
    {
      "id": "ac225e1b-3bdd-4b1a-ad30-819eba61214b",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.433583",
      "updated_at": "2025-12-18T21:18:28.433587"
    }
  ],
  "f4b915c9-3852-4eb9-9fc8-4706f80ff949": [
    {
      "id": "b1976141-a034-4f4a-9293-ae0ca8571c39",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.435733",
      "updated_at": "2025-12-18T21:18:28.435734"
    },
    {
      "id": "9ac36c0a-b928-4427-863a-a261188b1578",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.437991",
      "updated_at": "2025-12-18T21:18:28.437992"
    }
  ],
  "7fe2c1c8-648b-4f9d-88c8-0074299965b3": [
    {
      "id": "f53450ed-dee5-4868-93ff-d44248ce8e86",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.440040",
      "updated_at": "2025-12-18T21:18:28.440041"
    },
    {
      "id": "c8021873-ce74-4ac0-989d-b748753500b7",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.442139",
      "updated_at": "2025-12-18T21:18:28.442140"
    }
  ],
  "347bd3f9-0204-4225-a59a-120c791c8290": [
    {
      "id": "2b90ccbc-363f-4b23-b39f-8c3b7c47445c",
      "reference_id": "347bd3f9-0204-4225-a59a-120c791c8290",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.444139",
      "updated_at": "2025-12-18T21:18:28.444139"
    },
    {
      "id": "6ce27955-a91b-459c-83b3-c4acbb683342",
      "reference_id": "347bd3f9-0204-4225-a59a-120c791c8290",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.446254",
      "updated_at": "2025-12-18T21:18:28.446254"
    }
  ],
  "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14": [
    {
      "id": "6627c37b-ae25-46a3-8e36-f1464a04c6e6",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.448448",
      "updated_at": "2025-12-18T21:18:28.448449"
    },
    {
      "id": "34f05970-3aa9-4ca2-bef6-644c91a62837",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.450791",
      "updated_at": "2025-12-18T21:18:28.450792"
    }
  ],
  "0d30f188-9006-42b1-840d-e83475828d0a": [
    {
      "id": "63b84f31-4d3b-448c-be1d-5d7731b8ab77",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.453081",
      "updated_at": "2025-12-18T21:18:28.453082"
    },
    {
      "id": "a3cfe356-4581-4581-b378-0d03a1ee37c5",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.454985",
      "updated_at": "2025-12-18T21:18:28.454986"
    }
  ],
  "14f17f29-0dc3-4568-b3d9-96efd71e2653": [
    {
      "id": "53a4d67c-e81f-4b1a-ac76-d41686c526ca",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.457026",
      "updated_at": "2025-12-18T21:18:28.457027"
    },
    {
      "id": "f69f0611-b2e4-4764-b258-7273c47b75b3",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.460836",
      "updated_at": "2025-12-18T21:18:28.460837"
    }
  ],
  "4035d6ba-0743-4e83-a237-eae501dd79e6": [
    {
      "id": "86be2653-1079-4edb-a1eb-bba87797da0b",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.463956",
      "updated_at": "2025-12-18T21:18:28.463958"
    },
    {
      "id": "c09ea974-65f1-4a2e-8009-ba4292fdf20e",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.467515",
      "updated_at": "2025-12-18T21:18:28.467517"
    }
  ],
  "cee0f2ab-e5dd-4423-8863-2e162233f100": [
    {
      "id": "cb4b847a-b467-4d87-b22c-c3dffff39b0c",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.470331",
      "updated_at": "2025-12-18T21:18:28.470333"
    },
    {
      "id": "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.472995",
      "updated_at": "2025-12-18T21:18:28.472997"
    }
  ],
  "35ef4f6d-e00c-45e7-b8de-cddad36e9e32": [
    {
      "id": "59d6a0e4-2656-4e2c-8473-7f5361f1d7ce",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.475936",
      "updated_at": "2025-12-18T21:18:28.475937"
    },
    {
      "id": "d4fc074d-a768-4d38-933c-93fcd0451432",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.478254",
      "updated_at": "2025-12-18T21:18:28.478255"
    }
  ],
  "7d888230-5b1d-4b22-9a20-32b72050ab56": [
    {
      "id": "36320085-f136-40e2-8cfa-aa27babda39f",
      "reference_id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.480404",
      "updated_at": "2025-12-18T21:18:28.480405"
    },
    {
      "id": "3a1ccefe-3a60-4bd9-8ed8-24f851ffd495",
      "reference_id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.482425",
      "updated_at": "2025-12-18T21:18:28.482426"
    }
  ],
  "f3ca5d81-2ace-4557-b86a-0cefa0900f77": [
    {
      "id": "f9b9b983-b732-4332-8036-2d059917ddbd",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.484480",
      "updated_at": "2025-12-18T21:18:28.484481"
    },
    {
      "id": "98bbeb31-dc2b-4e23-abaf-94f11383c716",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.486937",
      "updated_at": "2025-12-18T21:18:28.486938"
    }
  ],
  "3cc91636-8866-4544-b54b-4dd654981da3": [
    {
      "id": "522fb709-2c02-49c1-a12e-b11ac34ebbd2",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.489494",
      "updated_at": "2025-12-18T21:18:28.489495"
    },
    {
      "id": "1c6ba062-7b93-444b-a5a9-aa5f7680bc54",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.492115",
      "updated_at": "2025-12-18T21:18:28.492116"
    },
    {
      "id": "97fede4c-2484-4d6a-8d70-b5f9db3394e5",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "code": "soato",
      "name": "Код СОАТО",
      "ref_reference_id": null,
      "sort_order": 2,
      "created_at": "2025-12-18T21:18:28.494278",
      "updated_at": "2025-12-18T21:18:28.494279"
    }
  ],
  "fecca2b0-5092-4a96-9f9a-183d4c9ae96a": [
    {
      "id": "432144b4-dd88-46e8-bc80-70d7645134d1",
      "reference_id": "fecca2b0-5092-4a96-9f9a-183d4c9ae96a",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.496206",
      "updated_at": "2025-12-18T21:18:28.496207"
    },
    {
      "id": "10044d68-b370-4a84-a863-406ea421fa19",
      "reference_id": "fecca2b0-5092-4a96-9f9a-183d4c9ae96a",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.498778",
      "updated_at": "2025-12-18T21:18:28.498779"
    }
  ],
  "cde41d0d-4d87-41b8-8532-68de283d45fb": [
    {
      "id": "278a6687-07d1-4438-bd15-7b5c5a3b216a",
      "reference_id": "cde41d0d-4d87-41b8-8532-68de283d45fb",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.501078",
      "updated_at": "2025-12-18T21:18:28.501079"
    },
    {
      "id": "5a2026f7-4388-4643-9a81-c0c0d242d888",
      "reference_id": "cde41d0d-4d87-41b8-8532-68de283d45fb",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.503173",
      "updated_at": "2025-12-18T21:18:28.503174"
    }
  ],
  "1ef3a3b6-310c-4210-93fe-ef84961cbf0a": [
    {
      "id": "4d08e112-171c-4f3a-b969-b40d8b468595",
      "reference_id": "1ef3a3b6-310c-4210-93fe-ef84961cbf0a",
      "code": "code",
      "name": "Код",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.505866",
      "updated_at": "2025-12-18T21:18:28.505867"
    },
    {
      "id": "850db640-7c6f-4bd5-8817-98fdccfe98d6",
      "reference_id": "1ef3a3b6-310c-4210-93fe-ef84961cbf0a",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.508703",
      "updated_at": "2025-12-18T21:18:28.508704"
    }
  ],
  "0db0d59a-8f5b-4420-9222-5c77e63774c8": [
    {
      "id": "a64b9973-f647-4026-9349-7224b4796b1c",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "code": "bic",
      "name": "БИК",
      "ref_reference_id": null,
      "sort_order": 0,
      "created_at": "2025-12-18T21:18:28.511111",
      "updated_at": "2025-12-18T21:18:28.511111"
    },
    {
      "id": "1df25a2e-ab33-4c7a-865d-1d7a3063970c",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "code": "swift",
      "name": "SWIFT",
      "ref_reference_id": null,
      "sort_order": 1,
      "created_at": "2025-12-18T21:18:28.513205",
      "updated_at": "2025-12-18T21:18:28.513206"
    },
    {
      "id": "1483794d-af32-4be9-8af0-60c8b8624216",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "code": "name",
      "name": "Наименование",
      "ref_reference_id": null,
      "sort_order": 2,
      "created_at": "2025-12-18T21:18:28.515347",
      "updated_at": "2025-12-18T21:18:28.515348"
    },
    {
      "id": "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "code": "corr_account",
      "name": "Корр. счет",
      "ref_reference_id": null,
      "sort_order": 3,
      "created_at": "2025-12-18T21:18:28.517552",
      "updated_at": "2025-12-18T21:18:28.517553"
    },
    {
      "id": "d2bbf8bf-6362-4773-a6c7-7d64eae37d14",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "code": "country",
      "name": "Страна",
      "ref_reference_id": null,
      "sort_order": 4,
      "created_at": "2025-12-18T21:18:28.519945",
      "updated_at": "2025-12-18T21:18:28.519946"
    }
  ]
}

REFERENCE_DATA = {
  "bd23a710-33bb-4faf-af24-59d37089b792": [
    {
      "id": "c3b56dc0-b566-4a31-8579-10dd83f9134e",
      "reference_id": "bd23a710-33bb-4faf-af24-59d37089b792",
      "parent_id": null,
      "data": {
        "3c6d72f2-964a-4a12-8884-c45319070797": "Женат (замужем)",
        "4852c036-2958-47a7-8747-d73ba47a8839": "1"
      },
      "created_at": "2025-12-09T11:58:05.536738",
      "updated_at": "2025-12-18T21:30:15.313342"
    },
    {
      "id": "42634de4-82b5-4728-93b5-ba95064e5706",
      "reference_id": "bd23a710-33bb-4faf-af24-59d37089b792",
      "parent_id": null,
      "data": {
        "3c6d72f2-964a-4a12-8884-c45319070797": "Холост (не замужем)",
        "4852c036-2958-47a7-8747-d73ba47a8839": "2"
      },
      "created_at": "2025-12-09T11:58:05.542319",
      "updated_at": "2025-12-18T21:30:15.316788"
    }
  ],
  "d6097dde-f6b1-4c16-805c-6363581f4825": [
    {
      "id": "51c693b7-e027-4a14-919a-e9fdbeaeb22b",
      "reference_id": "d6097dde-f6b1-4c16-805c-6363581f4825",
      "parent_id": null,
      "data": {
        "a003ca87-8363-4159-8947-49e48dec7298": "M",
        "2020c806-7a32-4a52-a103-7fd8f76a5b14": "Мужской"
      },
      "created_at": "2025-12-18T21:18:28.522776",
      "updated_at": "2025-12-18T21:30:15.322748"
    },
    {
      "id": "bf6bb3eb-afc4-46b5-8b02-aa037e622ae7",
      "reference_id": "d6097dde-f6b1-4c16-805c-6363581f4825",
      "parent_id": null,
      "data": {
        "a003ca87-8363-4159-8947-49e48dec7298": "F",
        "2020c806-7a32-4a52-a103-7fd8f76a5b14": "Женский"
      },
      "created_at": "2025-12-18T21:18:28.525309",
      "updated_at": "2025-12-18T21:30:15.325187"
    }
  ],
  "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c": [
    {
      "id": "291649f2-38b9-4e37-96cd-a4d0c9ef1621",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "parent_id": null,
      "data": {
        "code": "USD",
        "name": "Доллар США"
      },
      "created_at": "2025-12-27T03:25:19.023136",
      "updated_at": "2025-12-27T03:25:19.023140"
    },
    {
      "id": "6057ea84-ba46-4cf2-8909-a6ca23081ce9",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "parent_id": null,
      "data": {
        "code": "EUR",
        "name": "Евро"
      },
      "created_at": "2025-12-27T03:25:19.031176",
      "updated_at": "2025-12-27T03:25:19.031178"
    },
    {
      "id": "b229b464-cde0-4aa0-b1f7-a10a2a9861f0",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "parent_id": null,
      "data": {
        "code": "RUB",
        "name": "Российский рубль"
      },
      "created_at": "2025-12-27T03:25:19.038769",
      "updated_at": "2025-12-27T03:25:19.038771"
    },
    {
      "id": "e05fc9ba-392e-4df4-8e96-1d5930c166ed",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "parent_id": null,
      "data": {
        "code": "GBP",
        "name": "Фунт стерлингов"
      },
      "created_at": "2025-12-27T03:25:19.046272",
      "updated_at": "2025-12-27T03:25:19.046274"
    },
    {
      "id": "b7322277-4548-4b10-a499-3f1ab133349c",
      "reference_id": "44c4c3a1-82f7-4d3e-8332-9dbab841ed7c",
      "parent_id": null,
      "data": {
        "code": "CNY",
        "name": "Китайский юань"
      },
      "created_at": "2025-12-27T03:25:19.054184",
      "updated_at": "2025-12-27T03:25:19.054187"
    }
  ],
  "792f2aaf-6b54-4ad6-984b-502370af27e8": [],
  "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6": [
    {
      "id": "bb7d0902-914a-4d58-8747-26a6080dc389",
      "reference_id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
      "parent_id": null,
      "data": {
        "86a488d2-5d54-4e29-88d0-42cc5faef555": "FL",
        "a1f82072-287d-44aa-aea5-c06c8eaab156": "Физическое лицо"
      },
      "created_at": "2025-12-18T21:18:28.527653",
      "updated_at": "2025-12-18T21:30:15.331229"
    },
    {
      "id": "67092aed-c35a-4345-bbc1-1ce06962bcaa",
      "reference_id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
      "parent_id": null,
      "data": {
        "86a488d2-5d54-4e29-88d0-42cc5faef555": "IP",
        "a1f82072-287d-44aa-aea5-c06c8eaab156": "Индивидуальный предприниматель"
      },
      "created_at": "2025-12-18T21:18:28.529654",
      "updated_at": "2025-12-18T21:30:15.333665"
    },
    {
      "id": "02998189-0bd5-4113-a60a-021cdcd63ed8",
      "reference_id": "403371f7-cb8a-41fc-8e18-1cbfd28e8cf6",
      "parent_id": null,
      "data": {
        "86a488d2-5d54-4e29-88d0-42cc5faef555": "SZ",
        "a1f82072-287d-44aa-aea5-c06c8eaab156": "Самозанятый"
      },
      "created_at": "2025-12-18T21:18:28.531818",
      "updated_at": "2025-12-18T21:30:15.335813"
    }
  ],
  "a90fb5e4-04ad-4840-9388-c978b5a35d4c": [
    {
      "id": "7124373a-862d-4e54-ab3d-5ef3d4e46613",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "FL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "fl_resident",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Резидент РФ"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "6ed29b5d-9b1a-4efe-9100-8e18d7ddefa0",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "FL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "fl_nonresident",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Нерезидент"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "ec6bc086-afb1-47ac-9e0e-389cf934efe4",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "FL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "fl_employee",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Работник банка"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "c683ede0-5537-4c82-b922-4ae0af2eab94",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "FL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "fl_vip",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "VIP клиент"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "d4de4fcc-ed87-4adf-acaf-f560aeaf534b",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "FL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "fl_pensioner",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Пенсионер"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "00b93237-b346-41a3-be87-e3d99a4be4e4",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "UL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ul_large",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Крупный бизнес"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "b9cd3e99-3915-4dd7-b472-0aca0e4aed1b",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "UL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ul_medium",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Средний бизнес"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "279c1eda-c458-4c06-a21c-450a2797201c",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "UL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ul_small",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Малый бизнес"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "3a26eabc-0743-49a8-bfbc-b3774045814b",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "UL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ul_state",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Госкорпорация"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "c5f32c3e-806b-40f3-b011-42733cc288e7",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "UL",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ul_foreign",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Иностранная компания"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "4e744e29-85b1-4299-b485-aa98e0a61c54",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "IP",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ip_regular",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Обычный ИП"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "18514320-c6f4-478a-bfae-0bdee3fda71f",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "IP",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ip_self_employed",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Самозанятый"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    },
    {
      "id": "a0345062-39cc-45df-84f6-b85a52c941be",
      "reference_id": "a90fb5e4-04ad-4840-9388-c978b5a35d4c",
      "parent_id": null,
      "data": {
        "66ae3149-d2f4-4a2b-9bd7-c3d17c975ab2": "IP",
        "e80f4bd8-05c5-44c2-ba88-7b4afc280aa0": "ip_farmer",
        "5a6150ac-56a9-4982-a1ac-a7027ab24200": "Глава КФХ"
      },
      "created_at": "2025-12-18T22:27:06",
      "updated_at": "2025-12-18T22:27:06"
    }
  ],
  "4feb0c0d-44d7-4186-a457-5c7092002556": [
    {
      "id": "12b7e38a-8334-43bc-86cc-6ad9e4dacc8e",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "parent_id": null,
      "data": {
        "3fd9744b-487a-4ba7-9e25-4c24bbf7550c": "ACTIVE",
        "94b4a6a9-e1c2-4a53-885a-a0597321cfc8": "Активен"
      },
      "created_at": "2025-12-18T21:18:28.534098",
      "updated_at": "2025-12-18T21:30:15.341622"
    },
    {
      "id": "61c29d04-851a-414a-9fe4-ffd404cb3c8a",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "parent_id": null,
      "data": {
        "3fd9744b-487a-4ba7-9e25-4c24bbf7550c": "CLOSED",
        "94b4a6a9-e1c2-4a53-885a-a0597321cfc8": "Закрыт"
      },
      "created_at": "2025-12-18T21:18:28.536175",
      "updated_at": "2025-12-18T21:30:15.343917"
    },
    {
      "id": "8881d4e6-1a29-4278-ac14-5cd1504cd73d",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "parent_id": null,
      "data": {
        "3fd9744b-487a-4ba7-9e25-4c24bbf7550c": "BLOCKED",
        "94b4a6a9-e1c2-4a53-885a-a0597321cfc8": "Заблокирован"
      },
      "created_at": "2025-12-18T21:18:28.538316",
      "updated_at": "2025-12-18T21:30:15.346076"
    },
    {
      "id": "4879a4d0-79bb-4bdf-9874-e44aeff38dbf",
      "reference_id": "4feb0c0d-44d7-4186-a457-5c7092002556",
      "parent_id": null,
      "data": {
        "3fd9744b-487a-4ba7-9e25-4c24bbf7550c": "SUSPENDED",
        "94b4a6a9-e1c2-4a53-885a-a0597321cfc8": "Приостановлен"
      },
      "created_at": "2025-12-18T21:18:28.540124",
      "updated_at": "2025-12-18T21:30:15.348136"
    }
  ],
  "4958d8a1-2967-4db7-877a-692a7bdc2aca": [
    {
      "id": "301fa220-feb3-40e9-9337-5a2996dbd0de",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "01",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Сельское хозяйство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "03c8e751-4858-426a-8e74-5fc12aa09d4a",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "02",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Лесное хозяйство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "519930b4-a50e-487d-9a7f-123e0e941b42",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "05",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Рыболовство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "15d8089a-da51-4859-b7c1-366ab4aa8b9d",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "10",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Добыча угля"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "f89ffbd4-9786-422a-b6ed-c2b221e9318a",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "11",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Добыча нефти и газа"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "c723f86d-c56b-41b2-9b42-76e3cd5ae622",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "15",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Производство пищевых продуктов"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "72982ac6-d30a-45a4-9c0a-94695c2c36eb",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "17",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Текстильное производство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "8475c687-3b8e-4a41-ac62-2936cc06700c",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "22",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Издательская деятельность"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "06444c87-c01e-44aa-b2b2-503f9fd11124",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "45",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Строительство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "81f53c03-d035-4c49-a138-46433e847ae3",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "50",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Торговля автотранспортом"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "c54f6a22-9545-47f6-b60d-b4ea2081409d",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "51",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Оптовая торговля"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "8a964e93-decf-4931-9142-dcb599b0c834",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "52",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Розничная торговля"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "334c20cc-2ff6-499b-b201-043d7d5311c7",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "55",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Гостиницы и рестораны"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "9064129a-da09-4756-b062-5162b278ad35",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "60",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Транспорт"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "7124b7e2-7107-40b6-ac61-4184e05b55c7",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "64",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Связь"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "3b4bde5f-9cae-4a20-a29c-7bb1f16ba6e3",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "65",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Финансовое посредничество"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "c3052109-e4ba-4489-aae7-4718f25da3d3",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "70",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Операции с недвижимостью"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "fa58df70-fd5a-47fe-a663-dc5f5722238a",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "72",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "IT-деятельность"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "bda3d777-2459-43d8-bebf-a03d479f1c3a",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "74",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Прочие услуги"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "021fda11-c02f-4212-ab1f-a1e2da4bd219",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "80",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Образование"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "a15891db-f0d3-44c2-9f5d-bd0486c17d8b",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "OKED",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "85",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Здравоохранение"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "ae866013-e479-42d6-8750-defebdbbc311",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S11",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Нефинансовые корпорации"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "8211b5b0-fb26-4832-aa17-cbb8c9900d50",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S12",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Финансовые корпорации"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "5422fe16-2425-4f04-973b-65a3a0b81ddf",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S13",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Государственное управление"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "269b8f59-bd6d-4e44-8138-083274cedb50",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S14",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Домашние хозяйства"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "1681b242-cc40-471c-8f70-98c9289218c3",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S15",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "НКООДХ"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "e0d89a04-6544-471c-ac7f-9861f9b466b5",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S1311",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Федеральные органы"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "da2f5c33-7826-4d82-9fe3-e7b83856f922",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S1312",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Региональные органы"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "7d200961-2b0e-4a95-bcd6-5eebad3df49e",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "SECTOR",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "S1313",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Местные органы"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "535366af-e305-406b-bead-d324143b3c2f",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "NON_RESIDENT",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "NR01",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Иностранное юридическое лицо"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "1213ce8e-aa94-4cc1-bb1f-cfecb1df7204",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "NON_RESIDENT",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "NR02",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Иностранный гражданин"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "ea390a07-9210-40bf-be2a-37594f38364c",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "NON_RESIDENT",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "NR03",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Международная организация"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "8f76cc7f-7976-4618-83af-5b6194f1e694",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "NON_RESIDENT",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "NR04",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Дипломатическое представительство"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    },
    {
      "id": "4f1c5e16-3c81-4a5e-b126-374a29098957",
      "reference_id": "4958d8a1-2967-4db7-877a-692a7bdc2aca",
      "parent_id": null,
      "data": {
        "6e7a7bbf-5092-4973-bc9f-59c09fab36ef": "NON_RESIDENT",
        "9948df9b-c1ed-40df-b2f5-b5d1189302e6": "NR05",
        "7367d547-3b46-4f30-97d8-32b63d4a816b": "Иностранный филиал"
      },
      "created_at": "2025-12-18T22:31:11",
      "updated_at": "2025-12-18T22:31:11"
    }
  ],
  "37d90314-29e9-4755-bb6d-285f92ee11f0": [
    {
      "id": "d48fa0f7-b08f-403c-9abb-0a372e39b5b2",
      "reference_id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
      "parent_id": null,
      "data": {
        "1a12af78-ff38-4413-9d9f-a5e51af0d4e1": "MR",
        "338262c9-feae-4e6f-ab93-211ed1347c62": "Господин"
      },
      "created_at": "2025-12-18T21:18:28.542047",
      "updated_at": "2025-12-18T21:30:15.354103"
    },
    {
      "id": "25584b5d-0f95-4899-81e4-dea9490c0982",
      "reference_id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
      "parent_id": null,
      "data": {
        "1a12af78-ff38-4413-9d9f-a5e51af0d4e1": "MRS",
        "338262c9-feae-4e6f-ab93-211ed1347c62": "Госпожа"
      },
      "created_at": "2025-12-18T21:18:28.544244",
      "updated_at": "2025-12-18T21:30:15.356875"
    },
    {
      "id": "bc95d705-3adb-49b7-a965-21147ead2593",
      "reference_id": "37d90314-29e9-4755-bb6d-285f92ee11f0",
      "parent_id": null,
      "data": {
        "1a12af78-ff38-4413-9d9f-a5e51af0d4e1": "DEAR",
        "338262c9-feae-4e6f-ab93-211ed1347c62": "Уважаемый(ая)"
      },
      "created_at": "2025-12-18T21:18:28.546651",
      "updated_at": "2025-12-18T21:30:15.359186"
    }
  ],
  "ec37219c-ed07-4482-8d41-df684c427866": [
    {
      "id": "b4f088bf-ffb9-46f2-b467-5013ecef9397",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "UZB",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Узбек"
      },
      "created_at": "2025-12-18T21:18:28.548949",
      "updated_at": "2025-12-18T21:30:15.364968"
    },
    {
      "id": "f46c64c1-66b2-4c56-9a16-4bd402c7b5d4",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "RUS",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Русский"
      },
      "created_at": "2025-12-18T21:18:28.550875",
      "updated_at": "2025-12-18T21:30:15.367868"
    },
    {
      "id": "5629e10e-cb28-439d-ad30-0f33a781a0a8",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "KAZ",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Казах"
      },
      "created_at": "2025-12-18T21:18:28.552829",
      "updated_at": "2025-12-18T21:30:15.370993"
    },
    {
      "id": "bddb49a0-89c0-4e31-843c-405c91f7ef02",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "TAJ",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Таджик"
      },
      "created_at": "2025-12-18T21:18:28.555163",
      "updated_at": "2025-12-18T21:30:15.373495"
    },
    {
      "id": "2e39965f-dc7c-4738-bff4-988769b63462",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "KYR",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Киргиз"
      },
      "created_at": "2025-12-18T21:18:28.557439",
      "updated_at": "2025-12-18T21:30:15.376082"
    },
    {
      "id": "4b98e63d-bdca-4938-b38d-028bfc52aa82",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "TKM",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Туркмен"
      },
      "created_at": "2025-12-18T21:18:28.560199",
      "updated_at": "2025-12-18T21:30:15.378973"
    },
    {
      "id": "bf850499-1d18-400c-afab-e63068e03416",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "TAT",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Татарин"
      },
      "created_at": "2025-12-18T21:18:28.563578",
      "updated_at": "2025-12-18T21:30:15.381356"
    },
    {
      "id": "c126bf5e-0ed6-4987-a0a4-7af5a9877ebf",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "KOR",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Кореец"
      },
      "created_at": "2025-12-18T21:18:28.567075",
      "updated_at": "2025-12-18T21:30:15.383774"
    },
    {
      "id": "37166bee-e275-46bd-b0a9-49e3227c996b",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "ARM",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Армянин"
      },
      "created_at": "2025-12-18T21:18:28.569973",
      "updated_at": "2025-12-18T21:30:15.385930"
    },
    {
      "id": "b21c6155-1f44-4f56-9adb-0e6c3d4a621e",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "GEO",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Грузин"
      },
      "created_at": "2025-12-18T21:18:28.572598",
      "updated_at": "2025-12-18T21:30:15.388661"
    },
    {
      "id": "cc483fbb-473f-4faf-af87-5148607869eb",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "AZB",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Азербайджанец"
      },
      "created_at": "2025-12-18T21:18:28.574788",
      "updated_at": "2025-12-18T21:30:15.390925"
    },
    {
      "id": "30771e98-f979-4fc5-a5dd-2a6682b8427c",
      "reference_id": "ec37219c-ed07-4482-8d41-df684c427866",
      "parent_id": null,
      "data": {
        "031cccec-f0ff-47e8-98a8-bc059f5ff322": "OTH",
        "f682d202-d411-47e3-85c6-cf8c7c6bc65d": "Другая"
      },
      "created_at": "2025-12-18T21:18:28.576815",
      "updated_at": "2025-12-18T21:30:15.393312"
    }
  ],
  "8f74467a-200c-4d6e-a3c8-709145e6eb6d": [
    {
      "id": "6d1e6c9d-61fc-4c54-a482-21d594949442",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "parent_id": null,
      "data": {
        "3798e93c-29bf-4554-8840-fd95a8d9a34e": "RU",
        "1a558ef7-3480-45eb-8743-617ba4f0382f": "Русский"
      },
      "created_at": "2025-12-18T21:18:28.578797",
      "updated_at": "2025-12-18T21:30:15.399307"
    },
    {
      "id": "74bf9727-590f-4ee5-a268-102e5544420e",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "parent_id": null,
      "data": {
        "3798e93c-29bf-4554-8840-fd95a8d9a34e": "UZ",
        "1a558ef7-3480-45eb-8743-617ba4f0382f": "Узбекский"
      },
      "created_at": "2025-12-18T21:18:28.581046",
      "updated_at": "2025-12-18T21:30:15.403553"
    },
    {
      "id": "14301979-94d1-4077-ae22-8d61f5f26741",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "parent_id": null,
      "data": {
        "3798e93c-29bf-4554-8840-fd95a8d9a34e": "EN",
        "1a558ef7-3480-45eb-8743-617ba4f0382f": "Английский"
      },
      "created_at": "2025-12-18T21:18:28.583157",
      "updated_at": "2025-12-18T21:30:15.406428"
    },
    {
      "id": "e1d9f775-4afe-44c0-8589-090f778b9b46",
      "reference_id": "8f74467a-200c-4d6e-a3c8-709145e6eb6d",
      "parent_id": null,
      "data": {
        "3798e93c-29bf-4554-8840-fd95a8d9a34e": "KZ",
        "1a558ef7-3480-45eb-8743-617ba4f0382f": "Казахский"
      },
      "created_at": "2025-12-18T21:18:28.585484",
      "updated_at": "2025-12-18T21:30:15.409080"
    }
  ],
  "a08c1548-df36-490c-bdc8-f2281c964abb": [
    {
      "id": "7cf4b9b8-38e9-42ea-bec5-6a8a90bb3bf3",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Узбекистан"
      },
      "created_at": "2025-12-18T21:18:28.587723",
      "updated_at": "2025-12-18T21:30:15.415994"
    },
    {
      "id": "733b97ed-d701-4be0-98ef-bb0c3071745b",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "RU",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Россия"
      },
      "created_at": "2025-12-18T21:18:28.589835",
      "updated_at": "2025-12-18T21:30:15.418371"
    },
    {
      "id": "79a813a9-49a6-416d-8519-08ee0abd6673",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "KZ",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Казахстан"
      },
      "created_at": "2025-12-18T21:18:28.591850",
      "updated_at": "2025-12-18T21:30:15.420520"
    },
    {
      "id": "8db595b6-f2c9-4581-9336-1112d5d25197",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "TJ",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Таджикистан"
      },
      "created_at": "2025-12-18T21:18:28.593814",
      "updated_at": "2025-12-18T21:30:15.422859"
    },
    {
      "id": "45cdb47c-d004-40d1-a35e-6116c5955af0",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "KG",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Киргизия"
      },
      "created_at": "2025-12-18T21:18:28.595666",
      "updated_at": "2025-12-18T21:30:15.425493"
    },
    {
      "id": "7ddffea2-e7f2-439c-8f95-0f2e058fc99f",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "TM",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Туркменистан"
      },
      "created_at": "2025-12-18T21:18:28.597624",
      "updated_at": "2025-12-18T21:30:15.428069"
    },
    {
      "id": "78da8801-f954-4f07-85ac-5a7625476a12",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "AZ",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Азербайджан"
      },
      "created_at": "2025-12-18T21:18:28.599448",
      "updated_at": "2025-12-18T21:30:15.430408"
    },
    {
      "id": "ab588e5c-f1cf-42b5-ab2e-7daca2281aed",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "AM",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Армения"
      },
      "created_at": "2025-12-18T21:18:28.601490",
      "updated_at": "2025-12-18T21:30:15.432634"
    },
    {
      "id": "fe3239f9-b4e3-4c48-9f33-58d5c5f47637",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "GE",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Грузия"
      },
      "created_at": "2025-12-18T21:18:28.603728",
      "updated_at": "2025-12-18T21:30:15.435299"
    },
    {
      "id": "07583146-c12b-4ef6-b06c-184a71b78a5e",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "BY",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Беларусь"
      },
      "created_at": "2025-12-18T21:18:28.605820",
      "updated_at": "2025-12-18T21:30:15.437610"
    },
    {
      "id": "aad59621-cc6a-4d55-b66d-689373265aba",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "UA",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Украина"
      },
      "created_at": "2025-12-18T21:18:28.607674",
      "updated_at": "2025-12-18T21:30:15.440106"
    },
    {
      "id": "ba4287c2-2f4c-4ca3-b77f-8bb31bf00b1d",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "US",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "США"
      },
      "created_at": "2025-12-18T21:18:28.609576",
      "updated_at": "2025-12-18T21:30:15.442483"
    },
    {
      "id": "43662890-a6a4-42ff-8649-30cf857385fc",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "DE",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Германия"
      },
      "created_at": "2025-12-18T21:18:28.611609",
      "updated_at": "2025-12-18T21:30:15.444944"
    },
    {
      "id": "d28b6f19-f872-4d97-acc8-dfa5556f0737",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "GB",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Великобритания"
      },
      "created_at": "2025-12-18T21:18:28.613816",
      "updated_at": "2025-12-18T21:30:15.447165"
    },
    {
      "id": "120f421c-c452-43a0-8d62-a1221a4b264f",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "CN",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Китай"
      },
      "created_at": "2025-12-18T21:18:28.615819",
      "updated_at": "2025-12-18T21:30:15.449430"
    },
    {
      "id": "6b4cd62e-ef3f-46f0-8b80-d00235e5d47f",
      "reference_id": "a08c1548-df36-490c-bdc8-f2281c964abb",
      "parent_id": null,
      "data": {
        "47e50c52-0c6f-4854-98e5-dd646759c323": "TR",
        "ac225e1b-3bdd-4b1a-ad30-819eba61214b": "Турция"
      },
      "created_at": "2025-12-18T21:18:28.617829",
      "updated_at": "2025-12-18T21:30:15.451693"
    }
  ],
  "f4b915c9-3852-4eb9-9fc8-4706f80ff949": [
    {
      "id": "5fa949c7-836f-4d89-9dfd-d7dd42fecd06",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "parent_id": null,
      "data": {
        "b1976141-a034-4f4a-9293-ae0ca8571c39": "PASSPORT",
        "9ac36c0a-b928-4427-863a-a261188b1578": "Паспорт"
      },
      "created_at": "2025-12-18T21:18:28.619815",
      "updated_at": "2025-12-18T21:30:15.457121"
    },
    {
      "id": "f2d38bdf-1671-463d-a14e-8f72e2482dc8",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "parent_id": null,
      "data": {
        "b1976141-a034-4f4a-9293-ae0ca8571c39": "ID_CARD",
        "9ac36c0a-b928-4427-863a-a261188b1578": "ID-карта"
      },
      "created_at": "2025-12-18T21:18:28.622260",
      "updated_at": "2025-12-18T21:30:15.459421"
    },
    {
      "id": "5ec3b62e-1cd3-4c95-b36c-79eb8951a815",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "parent_id": null,
      "data": {
        "b1976141-a034-4f4a-9293-ae0ca8571c39": "RESIDENCE",
        "9ac36c0a-b928-4427-863a-a261188b1578": "Вид на жительство"
      },
      "created_at": "2025-12-18T21:18:28.624365",
      "updated_at": "2025-12-18T21:30:15.461799"
    },
    {
      "id": "a4a4d65c-ad06-4b8b-9db8-b793f5effa3c",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "parent_id": null,
      "data": {
        "b1976141-a034-4f4a-9293-ae0ca8571c39": "BIRTH_CERT",
        "9ac36c0a-b928-4427-863a-a261188b1578": "Свидетельство о рождении"
      },
      "created_at": "2025-12-18T21:18:28.626478",
      "updated_at": "2025-12-18T21:30:15.464266"
    },
    {
      "id": "09d393a9-a40b-4373-a223-126199f1ecc5",
      "reference_id": "f4b915c9-3852-4eb9-9fc8-4706f80ff949",
      "parent_id": null,
      "data": {
        "b1976141-a034-4f4a-9293-ae0ca8571c39": "FOREIGN_PASSPORT",
        "9ac36c0a-b928-4427-863a-a261188b1578": "Загранпаспорт"
      },
      "created_at": "2025-12-18T21:18:28.628367",
      "updated_at": "2025-12-18T21:30:15.467549"
    }
  ],
  "7fe2c1c8-648b-4f9d-88c8-0074299965b3": [
    {
      "id": "f54b5252-8165-48a3-9e66-c2e78cdc79b7",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "LICENSE",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Лицензия"
      },
      "created_at": "2025-12-18T21:18:28.630332",
      "updated_at": "2025-12-18T21:30:15.473657"
    },
    {
      "id": "6cfc1a2b-f09f-4eb6-b4d3-6061224433e7",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "CERTIFICATE",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Свидетельство"
      },
      "created_at": "2025-12-18T21:18:28.632337",
      "updated_at": "2025-12-18T21:30:15.476855"
    },
    {
      "id": "f58dac77-d0c4-40d1-9469-7566c34dcc28",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "CONTRACT",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Договор"
      },
      "created_at": "2025-12-18T21:18:28.634410",
      "updated_at": "2025-12-18T21:30:15.479987"
    },
    {
      "id": "1e970a62-5a99-4446-85fb-421f32aa79d2",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "POWER_OF_ATTORNEY",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Доверенность"
      },
      "created_at": "2025-12-18T21:18:28.636532",
      "updated_at": "2025-12-18T21:30:15.482559"
    },
    {
      "id": "aa328d79-079d-4a35-9fdc-5ebb5c0061b3",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "EXTRACT",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Выписка"
      },
      "created_at": "2025-12-18T21:18:28.638602",
      "updated_at": "2025-12-18T21:30:15.485046"
    },
    {
      "id": "232a16a3-eac9-4154-8f68-4607a3d8cc46",
      "reference_id": "7fe2c1c8-648b-4f9d-88c8-0074299965b3",
      "parent_id": null,
      "data": {
        "f53450ed-dee5-4868-93ff-d44248ce8e86": "REFERENCE",
        "c8021873-ce74-4ac0-989d-b748753500b7": "Справка"
      },
      "created_at": "2025-12-18T21:18:28.640747",
      "updated_at": "2025-12-18T21:30:15.487416"
    }
  ],
  "347bd3f9-0204-4225-a59a-120c791c8290": [
    {
      "id": "4bacc898-a3b2-43a8-9be4-4dfa6703c2c0",
      "reference_id": "347bd3f9-0204-4225-a59a-120c791c8290",
      "parent_id": null,
      "data": {
        "2b90ccbc-363f-4b23-b39f-8c3b7c47445c": "MAIN",
        "6ce27955-a91b-459c-83b3-c4acbb683342": "Основная"
      },
      "created_at": "2025-12-18T21:18:28.643446",
      "updated_at": "2025-12-18T21:30:15.492661"
    },
    {
      "id": "b690dea0-c1aa-4954-bf34-e74201ddeabe",
      "reference_id": "347bd3f9-0204-4225-a59a-120c791c8290",
      "parent_id": null,
      "data": {
        "2b90ccbc-363f-4b23-b39f-8c3b7c47445c": "PART_TIME",
        "6ce27955-a91b-459c-83b3-c4acbb683342": "Совместительство"
      },
      "created_at": "2025-12-18T21:18:28.645576",
      "updated_at": "2025-12-18T21:30:15.494940"
    },
    {
      "id": "66fe48b7-7f57-4762-9d5a-b7e48f78363d",
      "reference_id": "347bd3f9-0204-4225-a59a-120c791c8290",
      "parent_id": null,
      "data": {
        "2b90ccbc-363f-4b23-b39f-8c3b7c47445c": "TEMPORARY",
        "6ce27955-a91b-459c-83b3-c4acbb683342": "Временная"
      },
      "created_at": "2025-12-18T21:18:28.647744",
      "updated_at": "2025-12-18T21:30:15.497293"
    }
  ],
  "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14": [
    {
      "id": "e87e3e58-1fbc-46e1-9427-f96ebeaaf2b6",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "HIRED",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Работа по найму"
      },
      "created_at": "2025-12-18T21:18:28.649850",
      "updated_at": "2025-12-18T21:30:15.503009"
    },
    {
      "id": "53c88b4c-937b-4d4f-8533-9cbff2ea5b68",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "ENTREPRENEUR",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Предприниматель"
      },
      "created_at": "2025-12-18T21:18:28.651813",
      "updated_at": "2025-12-18T21:30:15.505510"
    },
    {
      "id": "eb717396-5281-4a50-8a62-cfc8b0f4d80d",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "SELF_EMPLOYED",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Самозанятый"
      },
      "created_at": "2025-12-18T21:18:28.653831",
      "updated_at": "2025-12-18T21:30:15.507884"
    },
    {
      "id": "fae25727-d929-4656-8aa5-559dd0218d01",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "PENSIONER",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Пенсионер"
      },
      "created_at": "2025-12-18T21:18:28.656150",
      "updated_at": "2025-12-18T21:30:15.510276"
    },
    {
      "id": "aa5a0bfb-426b-493b-976a-333b419adc27",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "STUDENT",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Студент"
      },
      "created_at": "2025-12-18T21:18:28.658224",
      "updated_at": "2025-12-18T21:30:15.512838"
    },
    {
      "id": "2ace7515-f2eb-4ace-93a9-8b5195ac4aa0",
      "reference_id": "70ecceec-cc7b-4ef4-9a7d-11bb3b6f8a14",
      "parent_id": null,
      "data": {
        "6627c37b-ae25-46a3-8e36-f1464a04c6e6": "UNEMPLOYED",
        "34f05970-3aa9-4ca2-bef6-644c91a62837": "Безработный"
      },
      "created_at": "2025-12-18T21:18:28.660511",
      "updated_at": "2025-12-18T21:30:15.515059"
    }
  ],
  "0d30f188-9006-42b1-840d-e83475828d0a": [
    {
      "id": "5156177c-fff5-4f4c-ad1a-748c174a97a4",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "SPOUSE",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Супруг(а)"
      },
      "created_at": "2025-12-18T21:18:28.663599",
      "updated_at": "2025-12-18T21:30:15.521588"
    },
    {
      "id": "a7023885-0215-494a-9171-8a3f76d8ba71",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "CHILD",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Ребенок"
      },
      "created_at": "2025-12-18T21:18:28.666246",
      "updated_at": "2025-12-18T21:30:15.523769"
    },
    {
      "id": "bef4711b-41f0-4a94-be9e-a5db0c0bdf05",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "PARENT",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Родитель"
      },
      "created_at": "2025-12-18T21:18:28.668664",
      "updated_at": "2025-12-18T21:30:15.526223"
    },
    {
      "id": "e420b5d5-27fd-4a7d-8ab3-5167d372776c",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "SIBLING",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Брат/Сестра"
      },
      "created_at": "2025-12-18T21:18:28.671411",
      "updated_at": "2025-12-18T21:30:15.528619"
    },
    {
      "id": "cbe10cce-eb94-4070-8f9c-898ce9a3ed36",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "GRANDPARENT",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Бабушка/Дедушка"
      },
      "created_at": "2025-12-18T21:18:28.673901",
      "updated_at": "2025-12-18T21:30:15.530871"
    },
    {
      "id": "988087fb-587d-4258-92b9-3f3d6032b112",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "GRANDCHILD",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Внук/Внучка"
      },
      "created_at": "2025-12-18T21:18:28.675979",
      "updated_at": "2025-12-18T21:30:15.533127"
    },
    {
      "id": "8965bbc5-d411-4f46-8da8-18709ca1f084",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "UNCLE_AUNT",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Дядя/Тётя"
      },
      "created_at": "2025-12-18T21:18:28.678380",
      "updated_at": "2025-12-18T21:30:15.537058"
    },
    {
      "id": "d6ad18fa-00af-493e-b02c-6eb6c8df228e",
      "reference_id": "0d30f188-9006-42b1-840d-e83475828d0a",
      "parent_id": null,
      "data": {
        "63b84f31-4d3b-448c-be1d-5d7731b8ab77": "OTHER",
        "a3cfe356-4581-4581-b378-0d03a1ee37c5": "Другой"
      },
      "created_at": "2025-12-18T21:18:28.680669",
      "updated_at": "2025-12-18T21:30:15.539765"
    }
  ],
  "14f17f29-0dc3-4568-b3d9-96efd71e2653": [
    {
      "id": "4dd41b1b-2beb-468e-b824-0236b04bd932",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "parent_id": null,
      "data": {
        "53a4d67c-e81f-4b1a-ac76-d41686c526ca": "SECONDARY",
        "f69f0611-b2e4-4764-b258-7273c47b75b3": "Среднее"
      },
      "created_at": "2025-12-18T21:18:28.682900",
      "updated_at": "2025-12-18T21:30:15.547116"
    },
    {
      "id": "30a70ac4-66b3-449f-ab85-36efd5d27c00",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "parent_id": null,
      "data": {
        "53a4d67c-e81f-4b1a-ac76-d41686c526ca": "VOCATIONAL",
        "f69f0611-b2e4-4764-b258-7273c47b75b3": "Среднее специальное"
      },
      "created_at": "2025-12-18T21:18:28.684992",
      "updated_at": "2025-12-18T21:30:15.549706"
    },
    {
      "id": "d991ec47-b5b2-4670-a008-278ab19ebb2e",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "parent_id": null,
      "data": {
        "53a4d67c-e81f-4b1a-ac76-d41686c526ca": "HIGHER",
        "f69f0611-b2e4-4764-b258-7273c47b75b3": "Высшее"
      },
      "created_at": "2025-12-18T21:18:28.686918",
      "updated_at": "2025-12-18T21:30:15.552322"
    },
    {
      "id": "d2f7e461-2b2f-4485-bebd-ca522f0acbb2",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "parent_id": null,
      "data": {
        "53a4d67c-e81f-4b1a-ac76-d41686c526ca": "CANDIDATE",
        "f69f0611-b2e4-4764-b258-7273c47b75b3": "Кандидат наук"
      },
      "created_at": "2025-12-18T21:18:28.689085",
      "updated_at": "2025-12-18T21:30:15.554891"
    },
    {
      "id": "aeecab34-cd24-49e6-8dbb-c28d647f69f8",
      "reference_id": "14f17f29-0dc3-4568-b3d9-96efd71e2653",
      "parent_id": null,
      "data": {
        "53a4d67c-e81f-4b1a-ac76-d41686c526ca": "DOCTOR",
        "f69f0611-b2e4-4764-b258-7273c47b75b3": "Доктор наук"
      },
      "created_at": "2025-12-18T21:18:28.691162",
      "updated_at": "2025-12-18T21:30:15.557403"
    }
  ],
  "4035d6ba-0743-4e83-a237-eae501dd79e6": [
    {
      "id": "fc383d10-cbc9-4c90-bb74-67b54d478326",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "parent_id": null,
      "data": {
        "86be2653-1079-4edb-a1eb-bba87797da0b": "STANDARD",
        "c09ea974-65f1-4a2e-8009-ba4292fdf20e": "Стандарт"
      },
      "created_at": "2025-12-18T21:18:28.693116",
      "updated_at": "2025-12-18T21:30:15.562946"
    },
    {
      "id": "89668c30-0aef-4984-90d4-01c8b7f08b39",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "parent_id": null,
      "data": {
        "86be2653-1079-4edb-a1eb-bba87797da0b": "PREMIUM",
        "c09ea974-65f1-4a2e-8009-ba4292fdf20e": "Премиум"
      },
      "created_at": "2025-12-18T21:18:28.695409",
      "updated_at": "2025-12-18T21:30:15.565103"
    },
    {
      "id": "36dba3c9-835b-4cdf-a02a-b42f1354cfbe",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "parent_id": null,
      "data": {
        "86be2653-1079-4edb-a1eb-bba87797da0b": "VIP",
        "c09ea974-65f1-4a2e-8009-ba4292fdf20e": "VIP"
      },
      "created_at": "2025-12-18T21:18:28.698017",
      "updated_at": "2025-12-18T21:30:15.567393"
    },
    {
      "id": "7315381f-4cfd-4ecd-9e0c-55a6ccfa6bb8",
      "reference_id": "4035d6ba-0743-4e83-a237-eae501dd79e6",
      "parent_id": null,
      "data": {
        "86be2653-1079-4edb-a1eb-bba87797da0b": "PRIVATE",
        "c09ea974-65f1-4a2e-8009-ba4292fdf20e": "Private Banking"
      },
      "created_at": "2025-12-18T21:18:28.700854",
      "updated_at": "2025-12-18T21:30:15.569621"
    }
  ],
  "cee0f2ab-e5dd-4423-8863-2e162233f100": [
    {
      "id": "c2463e61-bcd0-4696-b695-ab43e11a7ec8",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "parent_id": null,
      "data": {
        "cb4b847a-b467-4d87-b22c-c3dffff39b0c": "CURRENT",
        "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6": "Расчетный"
      },
      "created_at": "2025-12-18T21:18:28.703163",
      "updated_at": "2025-12-18T21:30:15.575902"
    },
    {
      "id": "8e9890df-811c-48cb-b756-526badca9c0e",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "parent_id": null,
      "data": {
        "cb4b847a-b467-4d87-b22c-c3dffff39b0c": "DEPOSIT",
        "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6": "Депозитный"
      },
      "created_at": "2025-12-18T21:18:28.705770",
      "updated_at": "2025-12-18T21:30:15.578320"
    },
    {
      "id": "2a433afd-29f0-4cc9-8aaf-662dc597abab",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "parent_id": null,
      "data": {
        "cb4b847a-b467-4d87-b22c-c3dffff39b0c": "CARD",
        "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6": "Карточный"
      },
      "created_at": "2025-12-18T21:18:28.708260",
      "updated_at": "2025-12-18T21:30:15.580698"
    },
    {
      "id": "f9ffdfa6-cfbc-4688-8b9d-6d9cfed25041",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "parent_id": null,
      "data": {
        "cb4b847a-b467-4d87-b22c-c3dffff39b0c": "SAVINGS",
        "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6": "Сберегательный"
      },
      "created_at": "2025-12-18T21:18:28.710338",
      "updated_at": "2025-12-18T21:30:15.583013"
    },
    {
      "id": "4e287ab8-4db5-4151-a0e9-d094133aba16",
      "reference_id": "cee0f2ab-e5dd-4423-8863-2e162233f100",
      "parent_id": null,
      "data": {
        "cb4b847a-b467-4d87-b22c-c3dffff39b0c": "TRANSIT",
        "5d6a8d96-6196-41b3-a4ee-a316bf2e6ed6": "Транзитный"
      },
      "created_at": "2025-12-18T21:18:28.712641",
      "updated_at": "2025-12-18T21:30:15.585911"
    }
  ],
  "35ef4f6d-e00c-45e7-b8de-cddad36e9e32": [
    {
      "id": "3522111e-fd60-4627-b1b4-d2460e55c76b",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "parent_id": null,
      "data": {
        "59d6a0e4-2656-4e2c-8473-7f5361f1d7ce": "LEGAL",
        "d4fc074d-a768-4d38-933c-93fcd0451432": "Юридический"
      },
      "created_at": "2025-12-18T21:18:28.714778",
      "updated_at": "2025-12-18T21:30:15.593205"
    },
    {
      "id": "c600f859-88b2-4242-b2cf-eadf58f46804",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "parent_id": null,
      "data": {
        "59d6a0e4-2656-4e2c-8473-7f5361f1d7ce": "ACTUAL",
        "d4fc074d-a768-4d38-933c-93fcd0451432": "Фактический"
      },
      "created_at": "2025-12-18T21:18:28.716926",
      "updated_at": "2025-12-18T21:30:15.596144"
    },
    {
      "id": "ca4a5d68-0356-4fe4-8ccf-90e59671a9ee",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "parent_id": null,
      "data": {
        "59d6a0e4-2656-4e2c-8473-7f5361f1d7ce": "POSTAL",
        "d4fc074d-a768-4d38-933c-93fcd0451432": "Почтовый"
      },
      "created_at": "2025-12-18T21:18:28.719252",
      "updated_at": "2025-12-18T21:30:15.598442"
    },
    {
      "id": "f7124f6a-993d-46ea-bada-40a6523af5d9",
      "reference_id": "35ef4f6d-e00c-45e7-b8de-cddad36e9e32",
      "parent_id": null,
      "data": {
        "59d6a0e4-2656-4e2c-8473-7f5361f1d7ce": "REGISTRATION",
        "d4fc074d-a768-4d38-933c-93fcd0451432": "По прописке"
      },
      "created_at": "2025-12-18T21:18:28.721561",
      "updated_at": "2025-12-18T21:30:15.600488"
    }
  ],
  "7d888230-5b1d-4b22-9a20-32b72050ab56": [
    {
      "id": "cf62d1ec-f237-4f61-8ebe-0bd17265b531",
      "reference_id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
      "parent_id": null,
      "data": {
        "36320085-f136-40e2-8cfa-aa27babda39f": "OKED",
        "3a1ccefe-3a60-4bd9-8ed8-24f851ffd495": "Вид экономической деятельности"
      },
      "created_at": "2025-12-18T21:18:28.723842",
      "updated_at": "2025-12-18T21:30:15.606433"
    },
    {
      "id": "df222db5-d7ba-4c99-9d25-9c158994b8b2",
      "reference_id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
      "parent_id": null,
      "data": {
        "36320085-f136-40e2-8cfa-aa27babda39f": "SECTOR",
        "3a1ccefe-3a60-4bd9-8ed8-24f851ffd495": "Экономический сектор"
      },
      "created_at": "2025-12-18T21:18:28.725863",
      "updated_at": "2025-12-18T21:30:15.609302"
    },
    {
      "id": "6bf8da2e-34e6-46b5-959a-c571c638ca3b",
      "reference_id": "7d888230-5b1d-4b22-9a20-32b72050ab56",
      "parent_id": null,
      "data": {
        "36320085-f136-40e2-8cfa-aa27babda39f": "NON_RESIDENT",
        "3a1ccefe-3a60-4bd9-8ed8-24f851ffd495": "Тип нерезидента"
      },
      "created_at": "2025-12-18T21:18:28.727829",
      "updated_at": "2025-12-18T21:30:15.611955"
    }
  ],
  "f3ca5d81-2ace-4557-b86a-0cefa0900f77": [
    {
      "id": "44b1c82c-e4d8-4e32-9df3-76288522d79d",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ01",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Члены совета директоров"
      },
      "created_at": "2025-12-18T21:18:28.729885",
      "updated_at": "2025-12-18T21:30:15.617802"
    },
    {
      "id": "e08341b4-7170-4dc2-80ba-789e3696c80e",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_01",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Ключевые сотрудники банка"
      },
      "created_at": "2025-12-18T21:18:28.731921",
      "updated_at": "2025-12-18T21:30:15.619950"
    },
    {
      "id": "83f1f097-8ebc-4524-8e37-299e92b84ed6",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_01R",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Близкий родственник ключевого сотрудника банка"
      },
      "created_at": "2025-12-18T21:18:28.734112",
      "updated_at": "2025-12-18T21:30:15.622579"
    },
    {
      "id": "ac796701-872a-41d8-b871-e8113ae431db",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_02_1",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Члены наблюдательного совета банка"
      },
      "created_at": "2025-12-18T21:18:28.736136",
      "updated_at": "2025-12-18T21:30:15.624963"
    },
    {
      "id": "87227717-6698-4ab0-a55e-f4b503d22793",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_02_1R",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Близкий родственник члена наблюдательного совета"
      },
      "created_at": "2025-12-18T21:18:28.738312",
      "updated_at": "2025-12-18T21:30:15.628136"
    },
    {
      "id": "48db7179-b9f8-49d3-9180-605e666d44d9",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_02_2",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Члены правления банка"
      },
      "created_at": "2025-12-18T21:18:28.740435",
      "updated_at": "2025-12-18T21:30:15.631106"
    },
    {
      "id": "44b743a3-fe5b-4d67-bccf-7ad13f7a98e1",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_02_2R",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Близкий родственник члена правления банка"
      },
      "created_at": "2025-12-18T21:18:28.742488",
      "updated_at": "2025-12-18T21:30:15.633609"
    },
    {
      "id": "c6d8316c-fcb3-40c8-8e38-23fd9e151bdc",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_03",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Акционеры банка (доля > 10%)"
      },
      "created_at": "2025-12-18T21:18:28.744726",
      "updated_at": "2025-12-18T21:30:15.636686"
    },
    {
      "id": "b2bc15b5-264f-4d84-9cf4-65d4bd7206e6",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_04",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Аффилированные лица"
      },
      "created_at": "2025-12-18T21:18:28.746903",
      "updated_at": "2025-12-18T21:30:15.639448"
    },
    {
      "id": "2f3e38a9-e017-4a26-926c-20acdb7c1448",
      "reference_id": "f3ca5d81-2ace-4557-b86a-0cefa0900f77",
      "parent_id": null,
      "data": {
        "f9b9b983-b732-4332-8036-2d059917ddbd": "UZ_05",
        "98bbeb31-dc2b-4e23-abaf-94f11383c716": "Политически значимые лица (PEP)"
      },
      "created_at": "2025-12-18T21:18:28.748983",
      "updated_at": "2025-12-18T21:30:15.641736"
    }
  ],
  "3cc91636-8866-4544-b54b-4dd654981da3": [
    {
      "id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": null,
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Узбекистан",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "17"
      },
      "created_at": "2025-12-18T21:18:28.751018",
      "updated_at": "2025-12-18T21:30:15.649029"
    },
    {
      "id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-TK",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Ташкент",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1726"
      },
      "created_at": "2025-12-18T21:18:28.753249",
      "updated_at": "2025-12-18T21:30:15.651655"
    },
    {
      "id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-TO",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Ташкентская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1727"
      },
      "created_at": "2025-12-18T21:18:28.755664",
      "updated_at": "2025-12-18T21:30:15.654258"
    },
    {
      "id": "7ea0e710-e5bb-463a-96a9-d3b5b15711be",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-AN",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Андижанская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1703"
      },
      "created_at": "2025-12-18T21:18:28.757984",
      "updated_at": "2025-12-18T21:30:15.656652"
    },
    {
      "id": "6fea7d72-198a-452f-94d2-3959d5c117fb",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-BU",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Бухарская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1706"
      },
      "created_at": "2025-12-18T21:18:28.760062",
      "updated_at": "2025-12-18T21:30:15.658999"
    },
    {
      "id": "b354224a-4db0-4f29-8371-af8919bb8b3a",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-FA",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Ферганская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1730"
      },
      "created_at": "2025-12-18T21:18:28.762526",
      "updated_at": "2025-12-18T21:30:15.661497"
    },
    {
      "id": "4f5643b3-0b59-4099-84aa-ac50dced0993",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-JI",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Джизакская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1708"
      },
      "created_at": "2025-12-18T21:18:28.764872",
      "updated_at": "2025-12-18T21:30:15.664203"
    },
    {
      "id": "849a2ed1-0551-4c8c-b217-27fc606bb4ab",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-QA",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Кашкадарьинская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1710"
      },
      "created_at": "2025-12-18T21:18:28.767295",
      "updated_at": "2025-12-18T21:30:15.666565"
    },
    {
      "id": "571fcdda-2572-41f4-b81f-d9b3a71eba40",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-XO",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Хорезмская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1733"
      },
      "created_at": "2025-12-18T21:18:28.769466",
      "updated_at": "2025-12-18T21:30:15.669401"
    },
    {
      "id": "f9d412ee-cf8a-4a8b-b9e9-0d851cfdce15",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-NG",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Наманганская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1712"
      },
      "created_at": "2025-12-18T21:18:28.772185",
      "updated_at": "2025-12-18T21:30:15.672479"
    },
    {
      "id": "ca02bfa5-0305-4bf3-8c99-0a93bda9c701",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-NW",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Навоийская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1714"
      },
      "created_at": "2025-12-18T21:18:28.774972",
      "updated_at": "2025-12-18T21:30:15.674662"
    },
    {
      "id": "99041fe4-7227-4aa3-b941-8b0dbae9cb30",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-SA",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Самаркандская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1718"
      },
      "created_at": "2025-12-18T21:18:28.777252",
      "updated_at": "2025-12-18T21:30:15.677120"
    },
    {
      "id": "2f13d863-f3be-4e60-ae06-4e474b1e0939",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-SI",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Сырдарьинская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1724"
      },
      "created_at": "2025-12-18T21:18:28.779513",
      "updated_at": "2025-12-18T21:30:15.679991"
    },
    {
      "id": "e3e5e22d-2250-425d-9004-67ffa9844efc",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-SU",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Сурхандарьинская область",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1722"
      },
      "created_at": "2025-12-18T21:18:28.781704",
      "updated_at": "2025-12-18T21:30:15.682448"
    },
    {
      "id": "7d70d780-803b-4b42-945d-bc9a67737bfc",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "df3b951b-b794-49b5-bf2b-b88beb40e11f",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "UZ-QR",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Республика Каракалпакстан",
        "97fede4c-2484-4d6a-8d70-b5f9db3394e5": "1735"
      },
      "created_at": "2025-12-18T21:18:28.783835",
      "updated_at": "2025-12-18T21:30:15.684548"
    },
    {
      "id": "e72c5d2c-9c81-49d5-9714-6ff4049fa942",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-BEKTEMIR",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Бектемирский район"
      },
      "created_at": "2025-12-18T21:18:28.785773",
      "updated_at": "2025-12-18T21:30:15.687479"
    },
    {
      "id": "5b8bf143-7262-48da-b50a-a61d775e8e92",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-MIRABAD",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Мирабадский район"
      },
      "created_at": "2025-12-18T21:18:28.787736",
      "updated_at": "2025-12-18T21:30:15.690175"
    },
    {
      "id": "a8fe0999-1393-4cc4-aa90-798442f7c33c",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-MIRZO_ULUG",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Мирзо-Улугбекский район"
      },
      "created_at": "2025-12-18T21:18:28.789911",
      "updated_at": "2025-12-18T21:30:15.692551"
    },
    {
      "id": "57148642-381a-4a9b-bb3e-22ea6851f889",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-SERGELI",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Сергелийский район"
      },
      "created_at": "2025-12-18T21:18:28.792188",
      "updated_at": "2025-12-18T21:30:15.695540"
    },
    {
      "id": "037309ec-9067-4469-942a-d1702a1791e5",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-UCHTEPA",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Учтепинский район"
      },
      "created_at": "2025-12-18T21:18:28.794927",
      "updated_at": "2025-12-18T21:30:15.698047"
    },
    {
      "id": "bb412287-0e26-4440-9c3c-94d9e6e11193",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-CHILANZAR",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Чиланзарский район"
      },
      "created_at": "2025-12-18T21:18:28.797291",
      "updated_at": "2025-12-18T21:30:15.700191"
    },
    {
      "id": "4377a5eb-9557-4e56-b1ea-611e90511d85",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-SHAYKHANTAHUR",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Шайхантахурский район"
      },
      "created_at": "2025-12-18T21:18:28.799583",
      "updated_at": "2025-12-18T21:30:15.702536"
    },
    {
      "id": "f2d8304a-75e3-468c-9877-b20a984a18fc",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-YAKKASARAY",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Яккасарайский район"
      },
      "created_at": "2025-12-18T21:18:28.801990",
      "updated_at": "2025-12-18T21:30:15.705211"
    },
    {
      "id": "934ff48f-c640-47c1-9b89-7bdd40402864",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-YASHNABAD",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Яшнабадский район"
      },
      "created_at": "2025-12-18T21:18:28.804324",
      "updated_at": "2025-12-18T21:30:15.707359"
    },
    {
      "id": "ca49bedf-ec2b-4b96-a701-a85dedce2fb7",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-YUNUSABAD",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Юнусабадский район"
      },
      "created_at": "2025-12-18T21:18:28.806799",
      "updated_at": "2025-12-18T21:30:15.709576"
    },
    {
      "id": "f8b227ba-5f1d-4515-8b20-5691f9ac55d7",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "6c287b3c-2529-42f7-865c-9260315497d9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TK-ALMAZAR",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Алмазарский район"
      },
      "created_at": "2025-12-18T21:18:28.809306",
      "updated_at": "2025-12-18T21:30:15.712562"
    },
    {
      "id": "55ec334e-f3f7-42e9-9691-23be4724ffbd",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-ALMALYK",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Алмалык"
      },
      "created_at": "2025-12-18T21:18:28.811691",
      "updated_at": "2025-12-18T21:30:15.715042"
    },
    {
      "id": "eefeb10e-4554-42eb-9702-388ceaf9ef1a",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-ANGREN",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Ангрен"
      },
      "created_at": "2025-12-18T21:18:28.814004",
      "updated_at": "2025-12-18T21:30:15.717239"
    },
    {
      "id": "d763f868-098f-4883-8a20-728af808c92c",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-BEKABAD",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Бекабад"
      },
      "created_at": "2025-12-18T21:18:28.816161",
      "updated_at": "2025-12-18T21:30:15.719655"
    },
    {
      "id": "0e8c24a2-0941-479b-a549-c47d69508ef2",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-CHIRCHIK",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Чирчик"
      },
      "created_at": "2025-12-18T21:18:28.818243",
      "updated_at": "2025-12-18T21:30:15.722513"
    },
    {
      "id": "dc9c3689-f0b1-4ba1-abb7-d004198463e4",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-NURAFSHON",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "г. Нурафшон"
      },
      "created_at": "2025-12-18T21:18:28.820310",
      "updated_at": "2025-12-18T21:30:15.725040"
    },
    {
      "id": "9a58585e-68ca-4dd1-abcb-8ede15dda7e6",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-BOSTANLIQ",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Бостанлыкский район"
      },
      "created_at": "2025-12-18T21:18:28.822447",
      "updated_at": "2025-12-18T21:30:15.727390"
    },
    {
      "id": "dbc5e06d-08a3-455f-b066-f63bfa44298e",
      "reference_id": "3cc91636-8866-4544-b54b-4dd654981da3",
      "parent_id": "58dbc6b8-4a21-427e-a819-50861e0002b9",
      "data": {
        "522fb709-2c02-49c1-a12e-b11ac34ebbd2": "TO-ZANGIATA",
        "1c6ba062-7b93-444b-a5a9-aa5f7680bc54": "Зангиатинский район"
      },
      "created_at": "2025-12-18T21:18:28.824485",
      "updated_at": "2025-12-18T21:30:15.730002"
    }
  ],
  "fecca2b0-5092-4a96-9f9a-183d4c9ae96a": [],
  "cde41d0d-4d87-41b8-8532-68de283d45fb": [],
  "1ef3a3b6-310c-4210-93fe-ef84961cbf0a": [],
  "0db0d59a-8f5b-4420-9222-5c77e63774c8": [
    {
      "id": "628ccec3-4623-4451-a2d5-9f234a23e16c",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00014",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "NBFAUZ2X",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Национальный банк ВЭД",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.826554",
      "updated_at": "2025-12-18T21:30:15.751127"
    },
    {
      "id": "e17db980-d3a7-4931-b92f-82edabd999eb",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00440",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "ASLOUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Асакабанк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.828804",
      "updated_at": "2025-12-18T21:30:15.755084"
    },
    {
      "id": "2936be44-4cb5-4957-8567-bf8ff18aa0e2",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00450",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "HGUZUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Ипотека-банк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.830837",
      "updated_at": "2025-12-18T21:30:15.758115"
    },
    {
      "id": "99138938-29db-467a-9896-17f2bccd6cc1",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00873",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "UZINUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Узпромстройбанк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.832882",
      "updated_at": "2025-12-18T21:30:15.761702"
    },
    {
      "id": "90cfeee9-d47e-43d7-a50c-fb4256ea5836",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00083",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "MIKIUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Микрокредитбанк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.835085",
      "updated_at": "2025-12-18T21:30:15.765061"
    },
    {
      "id": "5f9b9c44-e238-4f53-9a01-9173b74868dc",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "01018",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "KAPUUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Капиталбанк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.837063",
      "updated_at": "2025-12-18T21:30:15.767750"
    },
    {
      "id": "e1b20476-ec48-44b8-b4d0-38075a47839b",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "01063",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "OLOBUZBX",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Ориент Финанс Банк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.839097",
      "updated_at": "2025-12-18T21:30:15.770948"
    },
    {
      "id": "152901cd-d1b7-4ef0-9222-a8d6812b902a",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "01158",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "DAVRUS22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Давр Банк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.841013",
      "updated_at": "2025-12-18T21:30:15.773671"
    },
    {
      "id": "69eb279c-27ad-4242-8a59-7dd8f1147acf",
      "reference_id": "0db0d59a-8f5b-4420-9222-5c77e63774c8",
      "parent_id": null,
      "data": {
        "a64b9973-f647-4026-9349-7224b4796b1c": "00859",
        "1df25a2e-ab33-4c7a-865d-1d7a3063970c": "INFIUZ22",
        "1483794d-af32-4be9-8af0-60c8b8624216": "Инфинбанк",
        "c943e70c-3f2d-4fbb-8c07-369ec6f8a7ad": "",
        "d2bbf8bf-6362-4773-a6c7-7d64eae37d14": "UZ"
      },
      "created_at": "2025-12-18T21:18:28.842947",
      "updated_at": "2025-12-18T21:30:15.776316"
    }
  ]
}

def restore():
    print("Restoring database...")
    
    print(f"Restoring {len(SUBJECT_AREAS)} subject areas and {len(DOMAIN_CONCEPTS)} domain concepts...")
    r = requests.post(f"{API_URL}/api/bulk-save", json={
        "subject_areas": SUBJECT_AREAS,
        "domain_concepts": DOMAIN_CONCEPTS
    })
    print(f"  Result: {r.status_code}")
    
    print(f"Restoring {len(REFERENCES)} references...")
    for ref in REFERENCES:
        requests.post(f"{API_URL}/api/references", json=ref)
    
    for ref_id, fields in REFERENCE_FIELDS.items():
        for field in fields:
            requests.post(f"{API_URL}/api/references/{ref_id}/fields", json=field)
    
    for ref_id, data_list in REFERENCE_DATA.items():
        for data in data_list:
            requests.post(f"{API_URL}/api/references/{ref_id}/data", json=data)
    
    print("Done!")

if __name__ == "__main__":
    restore()
