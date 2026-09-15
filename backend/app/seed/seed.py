"""
BhoomiStack Synthetic Data Generator
Generates 500 realistic land parcels for Prayagraj district, UP.
Includes intentional data inconsistencies for Land Truth Engine demos.
"""
import json
import random
import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import engine, SessionLocal, Base
from app.models import (Parcel, Owner, OwnershipRecord, Registration, Encumbrance,
                         BuildingPermission, LandUseRecord, Dispute, PropertyTax, Utility,
                         AuditLog, User, VerificationReport)
from app.auth.jwt import get_password_hash

random.seed(42)

# --- Prayagraj district zones ---
ZONES = {
    "Jhunsi": {
        "center": [25.4358, 81.9108],
        "land_uses": ["Agricultural", "Agricultural", "Agricultural", "Residential", "Government"],
        "tehsil": "Soraon",
        "zone_code": "JH",
    },
    "Naini": {
        "center": [25.3740, 81.9090],
        "land_uses": ["Residential", "Residential", "Commercial", "Industrial", "Agricultural"],
        "tehsil": "Sadar",
        "zone_code": "NA",
    },
    "Civil Lines": {
        "center": [25.4538, 81.8467],
        "land_uses": ["Residential", "Commercial", "Residential", "Government", "Residential"],
        "tehsil": "Sadar",
        "zone_code": "CL",
    },
}

OWNER_NAMES = [
    "Pranjal Kumar", "Sunita Devi", "Ramesh Prasad", "Kavita Singh", "Ajay Yadav",
    "Meera Sharma", "Suresh Gupta", "Anita Mishra", "Vijay Tiwari", "Rekha Pandey",
    "Manoj Verma", "Geeta Rao", "Ashok Chauhan", "Pushpa Maurya", "Dinesh Shukla",
    "Saroj Tripathi", "Narendra Dubey", "Kamla Keshari", "Pramod Joshi", "Uma Srivastava",
    "Ravi Shankar", "Lalita Chaurasia", "Deepak Awasthi", "Savita Pal", "Anil Patel",
    "Nirmala Yadav", "Surendra Bhadauria", "Rajmati Devi", "Santosh Kumar", "Indu Bala",
    "Hemant Rawat", "Shanta Devi", "Brij Mohan", "Madhuri Singh", "Rajesh Agnihotri",
    "Poonam Saxena", "Vivek Pathak", "Champa Devi", "Sohan Lal", "Radha Rani",
    "Arvind Katiyar", "Sushma Chandra", "Gyanendra Singh", "Manju Dwivedi", "Ramkumar Pal",
    "Seema Khatoon", "Harendra Nath", "Savitri Devi", "Yogendra Pratap", "Sudha Rani",
]

INSTITUTIONS = ["SBI Home Loans", "PNB", "Bank of Baroda", "UP Co-op Bank", "LIC Housing", "HDFC Bank"]
COURTS = ["District Court Prayagraj", "High Court Allahabad", "Revenue Court", "Civil Court"]
DISPUTE_TYPES = ["Boundary", "Title", "Inheritance", "Encroachment"]
UTILITY_PROVIDERS = {
    "Water": "Prayagraj Jal Nigam",
    "Electricity": "UPPCL",
    "Sewage": "Prayagraj Nagar Nigam",
    "Gas": "Indane / IGL",
}
ZONING_MAP = {
    "Agricultural": "AG",
    "Residential": "R1",
    "Commercial": "C1",
    "Industrial": "I1",
    "Government": "GB",
}


def random_polygon(center_lat, center_lon, area_ha, noise=0.002):
    """Generate a random rectangular-ish polygon around a center point."""
    # 1 degree lat ≈ 111km, 1 degree lon ≈ 89km at 25°N
    km_per_ha = 0.01  # ~100m x 100m = 1 ha
    lat_deg = math.sqrt(area_ha) * km_per_ha / 111
    lon_deg = math.sqrt(area_ha) * km_per_ha / 89

    # Add random offset so parcels don't overlap perfectly
    off_lat = random.uniform(-0.03, 0.03)
    off_lon = random.uniform(-0.03, 0.03)
    clat = center_lat + off_lat
    clon = center_lon + off_lon

    # Random skew
    s = random.uniform(0.6, 1.4)
    coords = [
        [clon - lon_deg * s, clat - lat_deg],
        [clon + lon_deg * s, clat - lat_deg],
        [clon + lon_deg, clat + lat_deg * s],
        [clon - lon_deg, clat + lat_deg * s],
        [clon - lon_deg * s, clat - lat_deg],
    ]
    return {"type": "Polygon", "coordinates": [coords]}


def create_users(db):
    users = [
        ("citizen@demo.bhoomistack", "Priya Citizen", "citizen", "Public"),
        ("revenue@demo.bhoomistack", "Rajan Kumar (Revenue Officer)", "revenue_officer", "Revenue Department"),
        ("planning@demo.bhoomistack", "Neha Sharma (Planning Officer)", "planning_officer", "Urban Planning"),
        ("municipal@demo.bhoomistack", "Arun Mishra (Municipal Officer)", "municipal_officer", "Municipal Corporation"),
        ("admin@demo.bhoomistack", "System Administrator", "admin", "IT Department"),
    ]
    for email, name, role, dept in users:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            db.add(User(
                email=email,
                password=get_password_hash("demo1234"),
                name=name,
                role=role,
                department=dept
            ))
    db.commit()
    print("✅ Users created")


def create_owners(db):
    owners = []
    for i, name in enumerate(OWNER_NAMES):
        o = Owner(
            name=name,
            aadhaar_hash=f"HASH_{i:04d}",
            mobile=f"9{random.randint(100000000, 999999999)}",
            email=f"{name.split()[0].lower()}.{random.randint(100,999)}@example.com"
        )
        db.add(o)
        owners.append(o)
    db.commit()
    db.refresh(owners[0])
    return db.query(Owner).all()


def seed_parcels(db, owners):
    parcels_per_zone = {"Jhunsi": 200, "Naini": 150, "Civil Lines": 150}
    all_parcels = []
    idx = 1

    RESERVED_ULPINS = {"UP-PRY-001245", "UP-PRY-000042"}

    for village, zone in ZONES.items():
        count = parcels_per_zone[village]
        generated = 0
        while generated < count:
            ulpin = f"UP-PRY-{idx:06d}"
            if ulpin in RESERVED_ULPINS:
                idx += 1
                continue
            generated += 1
            land_use = random.choice(zone["land_uses"])
            area_gis = round(random.uniform(0.05, 2.50), 4)

            # 10% government land
            land_type = "Government" if random.random() < 0.05 else "Private"
            if land_type == "Government":
                land_use = "Government"

            # Satellite change flag — 12% of parcels
            sat_change = 1 if random.random() < 0.12 else 0

            khasra_seq = random.randint(1, 999)
            sub = random.choice(["", "/1", "/2", "/3"])
            khasra_no = f"{khasra_seq}{sub}"

            geom = random_polygon(zone["center"][0], zone["center"][1], area_gis)

            parcel = Parcel(
                ulpin=ulpin,
                khasra_no=khasra_no,
                state="Uttar Pradesh",
                district="Prayagraj",
                tehsil=zone["tehsil"],
                village=village,
                area_gis=area_gis,
                land_use=land_use,
                land_type=land_type,
                geometry=json.dumps(geom),
                satellite_change_flag=sat_change,
                risk_score=0,
                risk_level="LOW"
            )
            db.add(parcel)
            all_parcels.append((ulpin, area_gis, land_use, land_type, sat_change))
            idx += 1

    # SPECIAL DEMO PARCEL — UP-PRY-001245 with all anomalies
    demo_geom = random_polygon(25.4358, 81.9108, 0.84)
    demo = Parcel(
        ulpin="UP-PRY-001245",
        khasra_no="125/2",
        state="Uttar Pradesh",
        district="Prayagraj",
        tehsil="Soraon",
        village="Jhunsi",
        area_gis=0.84,
        land_use="Residential",
        land_type="Private",
        geometry=json.dumps(demo_geom),
        satellite_change_flag=1,
        risk_score=0,
        risk_level="LOW"
    )
    db.add(demo)

    # CLEAN DEMO PARCEL
    clean_geom = random_polygon(25.4538, 81.8467, 0.52)
    clean = Parcel(
        ulpin="UP-PRY-000042",
        khasra_no="42/1",
        state="Uttar Pradesh",
        district="Prayagraj",
        tehsil="Sadar",
        village="Civil Lines",
        area_gis=0.52,
        land_use="Residential",
        land_type="Private",
        geometry=json.dumps(clean_geom),
        satellite_change_flag=0,
        risk_score=5,
        risk_level="LOW"
    )
    db.add(clean)
    db.commit()
    print(f"✅ {idx-1} parcels created (+2 demo parcels)")
    return all_parcels


def seed_records(db, owners, all_parcels):
    owner_list = owners
    reg_no = 1
    bp_no = 1
    case_no = 1
    tax_no = 1

    for ulpin, area_gis, land_use, land_type, sat_change in all_parcels:
        owner = random.choice(owner_list)

        # Area noise for RoR (5-15% of parcels have mismatch)
        ror_noise = 1.0
        if random.random() < 0.15:
            ror_noise = random.uniform(0.82, 0.98)
        area_ror = round(area_gis * ror_noise, 4)

        # Ownership record
        db.add(OwnershipRecord(
            ulpin=ulpin,
            owner_id=owner.id,
            ownership_type=random.choice(["Sole", "Sole", "Joint", "Inherited"]),
            share=1.0,
            area_ror=area_ror,
            valid_from=f"20{random.randint(5,22)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            status="ACTIVE"
        ))

        # Registration (80% have one, 20% have 2-3)
        num_reg = random.choices([1, 2, 3], weights=[80, 15, 5])[0]
        prev_owner = random.choice(owner_list)
        for r in range(num_reg):
            reg_area = round(area_gis * random.uniform(0.96, 1.04), 4)
            doc_no = f"REG-{2020+r}-{reg_no:06d}"
            try:
                db.add(Registration(
                    ulpin=ulpin,
                    document_no=doc_no,
                    transaction_type=random.choice(["Sale", "Sale", "Sale", "Gift", "Partition"]),
                    transaction_date=f"20{random.randint(15,25)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                    seller=prev_owner.name,
                    buyer=owner.name,
                    area_registered=reg_area,
                    amount=round(area_gis * random.uniform(500000, 2000000), 0),
                    status="REGISTERED"
                ))
                reg_no += 1
                prev_owner = owner
            except Exception:
                pass

        # Encumbrance (15% of parcels)
        if random.random() < 0.15:
            db.add(Encumbrance(
                ulpin=ulpin,
                type=random.choice(["Mortgage", "Mortgage", "Lien", "Charge"]),
                institution=random.choice(INSTITUTIONS),
                amount=round(random.uniform(200000, 5000000), 0),
                start_date=f"20{random.randint(18,24)}-{random.randint(1,12):02d}-01",
                end_date=f"20{random.randint(28,35)}-{random.randint(1,12):02d}-01",
                status="ACTIVE"
            ))

        # Building permission (60% of non-agricultural)
        if land_use != "Agricultural" and random.random() < 0.6:
            # Zoning conflict: 10% have wrong building type
            build_type = land_use
            if random.random() < 0.10 and land_use == "Residential":
                build_type = "Commercial"

            db.add(BuildingPermission(
                ulpin=ulpin,
                application_no=f"BP-{bp_no:06d}",
                building_type=build_type,
                floors=random.randint(1, 5),
                area_sqm=round(area_gis * 10000 * 0.4, 1),
                approval_date=f"20{random.randint(18,25)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                valid_until=f"20{random.randint(26,30)}-12-31",
                status=random.choices(["APPROVED", "PENDING", "REJECTED"], weights=[70, 20, 10])[0]
            ))
            bp_no += 1

        # Land use record
        permitted = land_use
        has_conflict = 0
        if random.random() < 0.08:  # 8% have zoning conflict
            permitted = random.choice(["Residential", "Agricultural"])
            has_conflict = 1 if permitted != land_use else 0

        db.add(LandUseRecord(
            ulpin=ulpin,
            current_use=land_use,
            permitted_use=permitted,
            zoning=ZONING_MAP.get(land_use, "R1"),
            master_plan_ref=f"PRY-MP-2031-{random.randint(100,999)}",
            has_conflict=has_conflict
        ))

        # Dispute (8% of parcels)
        if random.random() < 0.08:
            db.add(Dispute(
                ulpin=ulpin,
                case_no=f"CS-{random.randint(2018,2025)}-{case_no:05d}",
                type=random.choice(DISPUTE_TYPES),
                status=random.choices(["PENDING", "RESOLVED"], weights=[60, 40])[0],
                court=random.choice(COURTS),
                filed_date=f"20{random.randint(18,25)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            ))
            case_no += 1

        # Property tax
        tax_area = round(area_gis * random.uniform(0.92, 1.02), 4)
        annual_tax = round(area_gis * random.uniform(5000, 25000), 0)
        paid = random.random() < 0.75
        db.add(PropertyTax(
            ulpin=ulpin,
            assessment_year="2025-26",
            area_taxed=tax_area,
            annual_tax=annual_tax,
            paid_amount=annual_tax if paid else round(annual_tax * random.uniform(0, 0.5), 0),
            payment_date=f"2026-{random.randint(1,6):02d}-{random.randint(1,28):02d}" if paid else None,
            status=random.choices(["PAID", "PENDING", "OVERDUE"], weights=[75, 15, 10])[0]
        ))

        # Utilities (Water + Electricity always; Sewage/Gas ~60%)
        for ut_type in ["Water", "Electricity"]:
            db.add(Utility(
                ulpin=ulpin,
                utility_type=ut_type,
                provider=UTILITY_PROVIDERS[ut_type],
                connection_id=f"{ut_type[:3].upper()}-{ulpin[-6:]}",
                status="ACTIVE"
            ))
        for ut_type in ["Sewage", "Gas"]:
            if random.random() < 0.60:
                db.add(Utility(
                    ulpin=ulpin,
                    utility_type=ut_type,
                    provider=UTILITY_PROVIDERS[ut_type],
                    connection_id=f"{ut_type[:3].upper()}-{ulpin[-6:]}",
                    status=random.choices(["ACTIVE", "INACTIVE"], weights=[85, 15])[0]
                ))

    db.commit()
    print(f"✅ All records seeded for {len(all_parcels)} parcels")


def seed_demo_parcel_records(db, owners):
    """Seed the special demo parcel UP-PRY-001245 with all anomalies."""
    ulpin = "UP-PRY-001245"
    owner = owners[0]  # Pranjal Kumar

    # Clear existing
    from app.models import OwnershipRecord, Registration, Encumbrance, BuildingPermission
    from app.models import LandUseRecord, Dispute, PropertyTax, Utility

    # Ownership with area mismatch (GIS: 0.84, RoR: 0.72 — 14.3% mismatch)
    db.add(OwnershipRecord(ulpin=ulpin, owner_id=owner.id, ownership_type="Sole",
                           share=1.0, area_ror=0.72, valid_from="2026-06-15", status="ACTIVE"))

    # Historical owner (shows recent change)
    db.add(OwnershipRecord(ulpin=ulpin, owner_id=owners[1].id, ownership_type="Sole",
                           share=1.0, area_ror=0.84, valid_from="2018-03-10", valid_to="2026-06-15", status="HISTORICAL"))

    # Multiple registrations
    for i, (seller, buyer, year, amount) in enumerate([
        (owners[2].name, owners[1].name, 2018, 4200000),
        (owners[1].name, owner.name, 2026, 6800000),
    ]):
        try:
            db.add(Registration(ulpin=ulpin, document_no=f"REG-{year}-001245-{i}",
                                transaction_type="Sale",
                                transaction_date=f"{year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                                seller=seller, buyer=buyer,
                                area_registered=0.84, amount=amount, status="REGISTERED"))
        except Exception:
            pass

    # Active encumbrance
    db.add(Encumbrance(ulpin=ulpin, type="Mortgage", institution="SBI Home Loans",
                       amount=3500000, start_date="2024-09-01", end_date="2039-09-01", status="ACTIVE"))

    # Zoning conflict: Residential zone, Commercial building permit
    db.add(LandUseRecord(ulpin=ulpin, current_use="Commercial", permitted_use="Residential",
                         zoning="R1", master_plan_ref="PRY-MP-2031-245", has_conflict=1))
    db.add(BuildingPermission(ulpin=ulpin, application_no="BP-001245",
                               building_type="Commercial", floors=3, area_sqm=3360,
                               approval_date="2025-01-15", valid_until="2030-01-15", status="APPROVED"))

    # Active dispute
    db.add(Dispute(ulpin=ulpin, case_no="CS-2025-01245", type="Boundary", status="PENDING",
                   court="District Court Prayagraj", filed_date="2025-03-22"))

    # Tax with mismatch (taxed 0.80, GIS 0.84)
    db.add(PropertyTax(ulpin=ulpin, assessment_year="2025-26", area_taxed=0.80,
                       annual_tax=8420, paid_amount=8420,
                       payment_date="2026-04-10", status="PAID"))

    # Utilities
    for ut_type in ["Water", "Electricity", "Sewage"]:
        db.add(Utility(ulpin=ulpin, utility_type=ut_type,
                       provider=UTILITY_PROVIDERS[ut_type],
                       connection_id=f"{ut_type[:3].upper()}-001245", status="ACTIVE"))
    db.commit()
    print("✅ Demo parcel UP-PRY-001245 seeded with anomalies")


def seed_clean_parcel_records(db, owners):
    """Seed the clean demo parcel UP-PRY-000042."""
    ulpin = "UP-PRY-000042"
    owner = owners[4]  # Ajay Yadav

    db.add(OwnershipRecord(ulpin=ulpin, owner_id=owner.id, ownership_type="Sole",
                           share=1.0, area_ror=0.52, valid_from="2015-08-20", status="ACTIVE"))
    try:
        db.add(Registration(ulpin=ulpin, document_no="REG-2015-000042",
                            transaction_type="Sale", transaction_date="2015-08-20",
                            seller="Previous Owner", buyer=owner.name,
                            area_registered=0.52, amount=2600000, status="REGISTERED"))
    except Exception:
        pass
    db.add(LandUseRecord(ulpin=ulpin, current_use="Residential", permitted_use="Residential",
                         zoning="R1", master_plan_ref="PRY-MP-2031-042", has_conflict=0))
    db.add(BuildingPermission(ulpin=ulpin, application_no="BP-DEMO-000042",
                               building_type="Residential", floors=2, area_sqm=1040,
                               approval_date="2016-02-10", valid_until="2031-02-10", status="APPROVED"))
    db.add(PropertyTax(ulpin=ulpin, assessment_year="2025-26", area_taxed=0.52,
                       annual_tax=5200, paid_amount=5200,
                       payment_date="2026-03-15", status="PAID"))
    for ut_type in ["Water", "Electricity", "Sewage", "Gas"]:
        db.add(Utility(ulpin=ulpin, utility_type=ut_type,
                       provider=UTILITY_PROVIDERS.get(ut_type, "N/A"),
                       connection_id=f"{ut_type[:3].upper()}-000042", status="ACTIVE"))
    db.commit()
    print("✅ Clean demo parcel UP-PRY-000042 seeded")


if __name__ == "__main__":
    print("🌱 BhoomiStack Seed Script starting...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    db = SessionLocal()
    try:
        create_users(db)
        owners = create_owners(db)
        all_parcels = seed_parcels(db, owners)
        seed_records(db, owners, all_parcels)
        seed_demo_parcel_records(db, owners)
        seed_clean_parcel_records(db, owners)
        print("🎉 Seeding complete!")
        print(f"   Total parcels: {db.query(Parcel).count()}")
        print(f"   Total owners: {db.query(Owner).count()}")
        print(f"   Total users: {db.query(User).count()}")
        print()
        print("Demo credentials (all use password: demo1234):")
        print("  citizen@demo.bhoomistack")
        print("  revenue@demo.bhoomistack")
        print("  planning@demo.bhoomistack")
        print("  municipal@demo.bhoomistack")
        print("  admin@demo.bhoomistack")
    finally:
        db.close()
