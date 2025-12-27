from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import os
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import json

app = FastAPI(title="Subject Area Editor API")

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175')
cors_origins_list = [origin.strip() for origin in CORS_ORIGINS.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_PATH = os.environ.get('DATABASE_PATH', './subject_areas.db')
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Models
class SubjectAreaModel(Base):
    __tablename__ = "subject_areas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    parent_id = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DomainConceptModel(Base):
    __tablename__ = "domain_concepts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    subject_area_id = Column(String, nullable=False)
    parent_id = Column(String, nullable=True)
    concept_type = Column(String, nullable=False, default='attribute')  # 'attribute' or 'list'
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Reference Models
class ReferenceModel(Base):
    __tablename__ = "references"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    parent_id = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_hierarchical = Column(Integer, default=0)
    data_by_script = Column(Integer, default=0)
    calculation_code = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReferenceFieldModel(Base):
    __tablename__ = "reference_fields"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_id = Column(String, nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    ref_reference_id = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReferenceDataModel(Base):
    __tablename__ = "reference_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_id = Column(String, nullable=False)
    parent_id = Column(String, nullable=True)
    data_json = Column(Text, nullable=False, default='{}')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# Pydantic models
class SubjectAreaCreate(BaseModel):
    code: str
    name: str
    parent_id: Optional[str] = None
    sort_order: int = 0


class SubjectAreaUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None


class SubjectAreaResponse(BaseModel):
    id: str
    code: str
    name: str
    parent_id: Optional[str]
    sort_order: int
    is_terminal: bool
    created_at: datetime
    updated_at: datetime


class DomainConceptCreate(BaseModel):
    code: str
    name: str
    subject_area_id: str
    parent_id: Optional[str] = None
    concept_type: str = 'attribute'
    sort_order: int = 0


class DomainConceptUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    parent_id: Optional[str] = None
    concept_type: Optional[str] = None
    sort_order: Optional[int] = None


class DomainConceptResponse(BaseModel):
    id: str
    code: str
    name: str
    subject_area_id: str
    parent_id: Optional[str]
    concept_type: str
    sort_order: int
    created_at: datetime
    updated_at: datetime


class BulkSaveRequest(BaseModel):
    subject_areas: List[dict]
    domain_concepts: List[dict]


# Reference Pydantic models
class ReferenceCreate(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    parent_id: Optional[str] = None
    sort_order: int = 0
    is_hierarchical: bool = False
    data_by_script: bool = False
    calculation_code: Optional[str] = None


class ReferenceUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None
    is_hierarchical: Optional[bool] = None
    data_by_script: Optional[bool] = None
    calculation_code: Optional[str] = None


class ReferenceResponse(BaseModel):
    id: str
    code: str
    name: str
    parent_id: Optional[str]
    sort_order: int
    is_hierarchical: bool
    data_by_script: bool
    calculation_code: Optional[str]
    created_at: datetime
    updated_at: datetime


class ReferenceFieldCreate(BaseModel):
    id: Optional[str] = None
    reference_id: str
    code: str
    name: str
    ref_reference_id: Optional[str] = None
    sort_order: int = 0


class ReferenceFieldUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    ref_reference_id: Optional[str] = None
    sort_order: Optional[int] = None


class ReferenceFieldResponse(BaseModel):
    id: str
    reference_id: str
    code: str
    name: str
    ref_reference_id: Optional[str]
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ReferenceDataCreate(BaseModel):
    id: Optional[str] = None
    reference_id: str
    parent_id: Optional[str] = None
    data: dict = {}


class ReferenceDataUpdate(BaseModel):
    parent_id: Optional[str] = None
    data: Optional[dict] = None


class ReferenceDataResponse(BaseModel):
    id: str
    reference_id: str
    parent_id: Optional[str]
    data: dict
    created_at: datetime
    updated_at: datetime


# API endpoints
@app.get("/")
def root():
    return {"message": "Subject Area Editor API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Subject Areas API
@app.get("/api/subject-areas", response_model=List[SubjectAreaResponse])
def get_subject_areas():
    db = SessionLocal()
    try:
        areas = db.query(SubjectAreaModel).order_by(SubjectAreaModel.sort_order).all()
        parent_ids_with_children = set(a.parent_id for a in areas if a.parent_id)

        return [
            SubjectAreaResponse(
                id=a.id,
                code=a.code,
                name=a.name,
                parent_id=a.parent_id,
                sort_order=a.sort_order,
                is_terminal=a.id not in set(a2.parent_id for a2 in areas if a2.parent_id),
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
            for a in areas
        ]
    finally:
        db.close()


@app.post("/api/subject-areas", response_model=SubjectAreaResponse)
def create_subject_area(area: SubjectAreaCreate):
    db = SessionLocal()
    try:
        db_area = SubjectAreaModel(
            id=str(uuid.uuid4()),
            code=area.code,
            name=area.name,
            parent_id=area.parent_id,
            sort_order=area.sort_order,
        )
        db.add(db_area)
        db.commit()
        db.refresh(db_area)

        return SubjectAreaResponse(
            id=db_area.id,
            code=db_area.code,
            name=db_area.name,
            parent_id=db_area.parent_id,
            sort_order=db_area.sort_order,
            is_terminal=True,
            created_at=db_area.created_at,
            updated_at=db_area.updated_at,
        )
    finally:
        db.close()


@app.put("/api/subject-areas/{area_id}", response_model=SubjectAreaResponse)
def update_subject_area(area_id: str, area: SubjectAreaUpdate):
    db = SessionLocal()
    try:
        db_area = db.query(SubjectAreaModel).filter(SubjectAreaModel.id == area_id).first()
        if not db_area:
            raise HTTPException(status_code=404, detail="Subject area not found")

        if area.code is not None:
            db_area.code = area.code
        if area.name is not None:
            db_area.name = area.name
        if area.parent_id is not None:
            db_area.parent_id = area.parent_id
        if area.sort_order is not None:
            db_area.sort_order = area.sort_order

        db.commit()
        db.refresh(db_area)

        has_children = db.query(SubjectAreaModel).filter(SubjectAreaModel.parent_id == area_id).first() is not None

        return SubjectAreaResponse(
            id=db_area.id,
            code=db_area.code,
            name=db_area.name,
            parent_id=db_area.parent_id,
            sort_order=db_area.sort_order,
            is_terminal=not has_children,
            created_at=db_area.created_at,
            updated_at=db_area.updated_at,
        )
    finally:
        db.close()


@app.delete("/api/subject-areas/{area_id}")
def delete_subject_area(area_id: str):
    db = SessionLocal()
    try:
        db.query(DomainConceptModel).filter(DomainConceptModel.subject_area_id == area_id).delete()

        def delete_children(parent_id):
            children = db.query(SubjectAreaModel).filter(SubjectAreaModel.parent_id == parent_id).all()
            for child in children:
                db.query(DomainConceptModel).filter(DomainConceptModel.subject_area_id == child.id).delete()
                delete_children(child.id)
                db.delete(child)

        delete_children(area_id)

        db_area = db.query(SubjectAreaModel).filter(SubjectAreaModel.id == area_id).first()
        if not db_area:
            raise HTTPException(status_code=404, detail="Subject area not found")
        db.delete(db_area)
        db.commit()
        return {"message": "Subject area deleted successfully"}
    finally:
        db.close()


# Domain Concepts API
@app.get("/api/domain-concepts", response_model=List[DomainConceptResponse])
def get_domain_concepts(subject_area_id: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(DomainConceptModel)
        if subject_area_id:
            query = query.filter(DomainConceptModel.subject_area_id == subject_area_id)
        concepts = query.order_by(DomainConceptModel.sort_order).all()

        return [
            DomainConceptResponse(
                id=c.id,
                code=c.code,
                name=c.name,
                subject_area_id=c.subject_area_id,
                parent_id=c.parent_id,
                concept_type=c.concept_type,
                sort_order=c.sort_order,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in concepts
        ]
    finally:
        db.close()


@app.post("/api/domain-concepts", response_model=DomainConceptResponse)
def create_domain_concept(concept: DomainConceptCreate):
    db = SessionLocal()
    try:
        db_concept = DomainConceptModel(
            id=str(uuid.uuid4()),
            code=concept.code,
            name=concept.name,
            subject_area_id=concept.subject_area_id,
            parent_id=concept.parent_id,
            concept_type=concept.concept_type,
            sort_order=concept.sort_order,
        )
        db.add(db_concept)
        db.commit()
        db.refresh(db_concept)

        return DomainConceptResponse(
            id=db_concept.id,
            code=db_concept.code,
            name=db_concept.name,
            subject_area_id=db_concept.subject_area_id,
            parent_id=db_concept.parent_id,
            concept_type=db_concept.concept_type,
            sort_order=db_concept.sort_order,
            created_at=db_concept.created_at,
            updated_at=db_concept.updated_at,
        )
    finally:
        db.close()


@app.put("/api/domain-concepts/{concept_id}", response_model=DomainConceptResponse)
def update_domain_concept(concept_id: str, concept: DomainConceptUpdate):
    db = SessionLocal()
    try:
        db_concept = db.query(DomainConceptModel).filter(DomainConceptModel.id == concept_id).first()
        if not db_concept:
            raise HTTPException(status_code=404, detail="Domain concept not found")

        if concept.code is not None:
            db_concept.code = concept.code
        if concept.name is not None:
            db_concept.name = concept.name
        if concept.parent_id is not None:
            db_concept.parent_id = concept.parent_id
        if concept.concept_type is not None:
            db_concept.concept_type = concept.concept_type
        if concept.sort_order is not None:
            db_concept.sort_order = concept.sort_order

        db.commit()
        db.refresh(db_concept)

        return DomainConceptResponse(
            id=db_concept.id,
            code=db_concept.code,
            name=db_concept.name,
            subject_area_id=db_concept.subject_area_id,
            parent_id=db_concept.parent_id,
            concept_type=db_concept.concept_type,
            sort_order=db_concept.sort_order,
            created_at=db_concept.created_at,
            updated_at=db_concept.updated_at,
        )
    finally:
        db.close()


@app.delete("/api/domain-concepts/{concept_id}")
def delete_domain_concept(concept_id: str):
    db = SessionLocal()
    try:
        def delete_children(parent_id):
            children = db.query(DomainConceptModel).filter(DomainConceptModel.parent_id == parent_id).all()
            for child in children:
                delete_children(child.id)
                db.delete(child)

        delete_children(concept_id)

        db_concept = db.query(DomainConceptModel).filter(DomainConceptModel.id == concept_id).first()
        if not db_concept:
            raise HTTPException(status_code=404, detail="Domain concept not found")
        db.delete(db_concept)
        db.commit()
        return {"message": "Domain concept deleted successfully"}
    finally:
        db.close()


@app.post("/api/bulk-save")
def bulk_save(data: BulkSaveRequest):
    db = SessionLocal()
    try:
        for sa_data in data.subject_areas:
            existing = db.query(SubjectAreaModel).filter(SubjectAreaModel.id == sa_data.get('id')).first()
            if existing:
                existing.code = sa_data.get('code', existing.code)
                existing.name = sa_data.get('name', existing.name)
                existing.parent_id = sa_data.get('parent_id', existing.parent_id)
                existing.sort_order = sa_data.get('sort_order', existing.sort_order)
            else:
                new_area = SubjectAreaModel(
                    id=sa_data.get('id', str(uuid.uuid4())),
                    code=sa_data.get('code', ''),
                    name=sa_data.get('name', ''),
                    parent_id=sa_data.get('parent_id'),
                    sort_order=sa_data.get('sort_order', 0),
                )
                db.add(new_area)

        for dc_data in data.domain_concepts:
            existing = db.query(DomainConceptModel).filter(DomainConceptModel.id == dc_data.get('id')).first()
            if existing:
                existing.code = dc_data.get('code', existing.code)
                existing.name = dc_data.get('name', existing.name)
                existing.parent_id = dc_data.get('parent_id', existing.parent_id)
                existing.concept_type = dc_data.get('concept_type', existing.concept_type)
                existing.sort_order = dc_data.get('sort_order', existing.sort_order)
            else:
                new_concept = DomainConceptModel(
                    id=dc_data.get('id', str(uuid.uuid4())),
                    code=dc_data.get('code', ''),
                    name=dc_data.get('name', ''),
                    subject_area_id=dc_data.get('subject_area_id', ''),
                    parent_id=dc_data.get('parent_id'),
                    concept_type=dc_data.get('concept_type', 'attribute'),
                    sort_order=dc_data.get('sort_order', 0),
                )
                db.add(new_concept)

        db.commit()
        return {"message": "All changes saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# References API
@app.get("/api/references", response_model=List[ReferenceResponse])
def get_references():
    db = SessionLocal()
    try:
        refs = db.query(ReferenceModel).order_by(ReferenceModel.sort_order).all()
        return [
            ReferenceResponse(
                id=r.id,
                code=r.code,
                name=r.name,
                parent_id=r.parent_id,
                sort_order=r.sort_order or 0,
                is_hierarchical=bool(r.is_hierarchical),
                data_by_script=bool(r.data_by_script),
                calculation_code=r.calculation_code,
                created_at=r.created_at or datetime.utcnow(),
                updated_at=r.updated_at or datetime.utcnow(),
            )
            for r in refs
        ]
    finally:
        db.close()


@app.post("/api/references", response_model=ReferenceResponse)
def create_reference(ref: ReferenceCreate):
    db = SessionLocal()
    try:
        db_ref = ReferenceModel(
            id=ref.id or str(uuid.uuid4()),
            code=ref.code,
            name=ref.name,
            parent_id=ref.parent_id,
            sort_order=ref.sort_order,
            is_hierarchical=1 if ref.is_hierarchical else 0,
            data_by_script=1 if ref.data_by_script else 0,
            calculation_code=ref.calculation_code,
        )
        db.add(db_ref)
        db.commit()
        db.refresh(db_ref)
        return ReferenceResponse(
            id=db_ref.id,
            code=db_ref.code,
            name=db_ref.name,
            parent_id=db_ref.parent_id,
            sort_order=db_ref.sort_order or 0,
            is_hierarchical=bool(db_ref.is_hierarchical),
            data_by_script=bool(db_ref.data_by_script),
            calculation_code=db_ref.calculation_code,
            created_at=db_ref.created_at,
            updated_at=db_ref.updated_at,
        )
    finally:
        db.close()


@app.put("/api/references/{ref_id}", response_model=ReferenceResponse)
def update_reference(ref_id: str, ref: ReferenceUpdate):
    db = SessionLocal()
    try:
        db_ref = db.query(ReferenceModel).filter(ReferenceModel.id == ref_id).first()
        if not db_ref:
            raise HTTPException(status_code=404, detail="Reference not found")

        if ref.code is not None:
            db_ref.code = ref.code
        if ref.name is not None:
            db_ref.name = ref.name
        if ref.parent_id is not None:
            db_ref.parent_id = ref.parent_id
        if ref.sort_order is not None:
            db_ref.sort_order = ref.sort_order
        if ref.is_hierarchical is not None:
            db_ref.is_hierarchical = 1 if ref.is_hierarchical else 0
        if ref.data_by_script is not None:
            db_ref.data_by_script = 1 if ref.data_by_script else 0
        if ref.calculation_code is not None:
            db_ref.calculation_code = ref.calculation_code

        db.commit()
        db.refresh(db_ref)
        return ReferenceResponse(
            id=db_ref.id,
            code=db_ref.code,
            name=db_ref.name,
            parent_id=db_ref.parent_id,
            sort_order=db_ref.sort_order or 0,
            is_hierarchical=bool(db_ref.is_hierarchical),
            data_by_script=bool(db_ref.data_by_script),
            calculation_code=db_ref.calculation_code,
            created_at=db_ref.created_at,
            updated_at=db_ref.updated_at,
        )
    finally:
        db.close()


@app.delete("/api/references/{ref_id}")
def delete_reference(ref_id: str):
    db = SessionLocal()
    try:
        # Delete fields and data first
        db.query(ReferenceFieldModel).filter(ReferenceFieldModel.reference_id == ref_id).delete()
        db.query(ReferenceDataModel).filter(ReferenceDataModel.reference_id == ref_id).delete()

        db_ref = db.query(ReferenceModel).filter(ReferenceModel.id == ref_id).first()
        if not db_ref:
            raise HTTPException(status_code=404, detail="Reference not found")
        db.delete(db_ref)
        db.commit()
        return {"message": "Reference deleted successfully"}
    finally:
        db.close()


# Reference Fields API
@app.get("/api/references/{ref_id}/fields", response_model=List[ReferenceFieldResponse])
def get_reference_fields(ref_id: str):
    db = SessionLocal()
    try:
        fields = db.query(ReferenceFieldModel).filter(
            ReferenceFieldModel.reference_id == ref_id
        ).order_by(ReferenceFieldModel.sort_order).all()
        return [
            ReferenceFieldResponse(
                id=f.id,
                reference_id=f.reference_id,
                code=f.code,
                name=f.name,
                ref_reference_id=f.ref_reference_id,
                sort_order=f.sort_order or 0,
                created_at=f.created_at or datetime.utcnow(),
                updated_at=f.updated_at or datetime.utcnow(),
            )
            for f in fields
        ]
    finally:
        db.close()


@app.post("/api/references/{ref_id}/fields", response_model=ReferenceFieldResponse)
def create_reference_field(ref_id: str, field: ReferenceFieldCreate):
    db = SessionLocal()
    try:
        db_field = ReferenceFieldModel(
            id=field.id or str(uuid.uuid4()),
            reference_id=ref_id,
            code=field.code,
            name=field.name,
            ref_reference_id=field.ref_reference_id,
            sort_order=field.sort_order,
        )
        db.add(db_field)
        db.commit()
        db.refresh(db_field)
        return ReferenceFieldResponse(
            id=db_field.id,
            reference_id=db_field.reference_id,
            code=db_field.code,
            name=db_field.name,
            ref_reference_id=db_field.ref_reference_id,
            sort_order=db_field.sort_order or 0,
            created_at=db_field.created_at,
            updated_at=db_field.updated_at,
        )
    finally:
        db.close()


@app.put("/api/references/{ref_id}/fields/{field_id}", response_model=ReferenceFieldResponse)
def update_reference_field(ref_id: str, field_id: str, field: ReferenceFieldUpdate):
    db = SessionLocal()
    try:
        db_field = db.query(ReferenceFieldModel).filter(ReferenceFieldModel.id == field_id).first()
        if not db_field:
            raise HTTPException(status_code=404, detail="Field not found")

        if field.code is not None:
            db_field.code = field.code
        if field.name is not None:
            db_field.name = field.name
        if field.ref_reference_id is not None:
            db_field.ref_reference_id = field.ref_reference_id
        if field.sort_order is not None:
            db_field.sort_order = field.sort_order

        db.commit()
        db.refresh(db_field)
        return ReferenceFieldResponse(
            id=db_field.id,
            reference_id=db_field.reference_id,
            code=db_field.code,
            name=db_field.name,
            ref_reference_id=db_field.ref_reference_id,
            sort_order=db_field.sort_order or 0,
            created_at=db_field.created_at,
            updated_at=db_field.updated_at,
        )
    finally:
        db.close()


@app.delete("/api/references/{ref_id}/fields/{field_id}")
def delete_reference_field(ref_id: str, field_id: str):
    db = SessionLocal()
    try:
        db_field = db.query(ReferenceFieldModel).filter(ReferenceFieldModel.id == field_id).first()
        if not db_field:
            raise HTTPException(status_code=404, detail="Field not found")
        db.delete(db_field)
        db.commit()
        return {"message": "Field deleted successfully"}
    finally:
        db.close()


# Reference Data API
@app.get("/api/references/{ref_id}/data", response_model=List[ReferenceDataResponse])
def get_reference_data(ref_id: str, filter_field: Optional[str] = None, filter_value: Optional[str] = None):
    db = SessionLocal()
    try:
        data_rows = db.query(ReferenceDataModel).filter(
            ReferenceDataModel.reference_id == ref_id
        ).all()

        result = []
        for row in data_rows:
            try:
                data = json.loads(row.data_json) if row.data_json else {}
            except:
                data = {}

            # Apply filter if specified
            if filter_field and filter_value:
                if str(data.get(filter_field, '')) != filter_value:
                    continue

            result.append(ReferenceDataResponse(
                id=row.id,
                reference_id=row.reference_id,
                parent_id=row.parent_id,
                data=data,
                created_at=row.created_at or datetime.utcnow(),
                updated_at=row.updated_at or datetime.utcnow(),
            ))
        return result
    finally:
        db.close()


@app.post("/api/references/{ref_id}/data", response_model=ReferenceDataResponse)
def create_reference_data(ref_id: str, data_row: ReferenceDataCreate):
    db = SessionLocal()
    try:
        db_data = ReferenceDataModel(
            id=data_row.id or str(uuid.uuid4()),
            reference_id=ref_id,
            parent_id=data_row.parent_id,
            data_json=json.dumps(data_row.data),
        )
        db.add(db_data)
        db.commit()
        db.refresh(db_data)
        return ReferenceDataResponse(
            id=db_data.id,
            reference_id=db_data.reference_id,
            parent_id=db_data.parent_id,
            data=json.loads(db_data.data_json) if db_data.data_json else {},
            created_at=db_data.created_at,
            updated_at=db_data.updated_at,
        )
    finally:
        db.close()


@app.put("/api/references/{ref_id}/data/{data_id}", response_model=ReferenceDataResponse)
def update_reference_data(ref_id: str, data_id: str, data_row: ReferenceDataUpdate):
    db = SessionLocal()
    try:
        db_data = db.query(ReferenceDataModel).filter(ReferenceDataModel.id == data_id).first()
        if not db_data:
            raise HTTPException(status_code=404, detail="Data row not found")

        if data_row.parent_id is not None:
            db_data.parent_id = data_row.parent_id
        if data_row.data is not None:
            db_data.data_json = json.dumps(data_row.data)

        db.commit()
        db.refresh(db_data)
        return ReferenceDataResponse(
            id=db_data.id,
            reference_id=db_data.reference_id,
            parent_id=db_data.parent_id,
            data=json.loads(db_data.data_json) if db_data.data_json else {},
            created_at=db_data.created_at,
            updated_at=db_data.updated_at,
        )
    finally:
        db.close()


@app.delete("/api/references/{ref_id}/data/{data_id}")
def delete_reference_data(ref_id: str, data_id: str):
    db = SessionLocal()
    try:
        db_data = db.query(ReferenceDataModel).filter(ReferenceDataModel.id == data_id).first()
        if not db_data:
            raise HTTPException(status_code=404, detail="Data row not found")
        db.delete(db_data)
        db.commit()
        return {"message": "Data row deleted successfully"}
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
