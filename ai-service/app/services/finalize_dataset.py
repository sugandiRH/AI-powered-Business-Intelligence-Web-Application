from sqlalchemy import text

def finalize_dataset(dataset_id, db):

    rows = db.execute(
        text("""
        SELECT *
        FROM temp_business_data
        WHERE dataset_id = :id
        AND is_valid = true
        """),
        {"id": dataset_id}
    ).fetchall()

    for row in rows:

        db.execute(
            text("""
            INSERT INTO business_data
            (dataset_id, date, month, year, product, category, quantity, price, total)
            VALUES
            (:dataset_id, :date, :month, :year, :product, :category, :quantity, :price, :total)
            """),
            row._mapping
        )

    db.execute(
        text("""
        DELETE FROM temp_business_data
        WHERE dataset_id = :id
        AND is_valid = true
        """),
        {"id": dataset_id}
    )

    db.commit()