import psycopg2

db_params = {
    "host": "localhost",
    "database": "smart_inventory",
    "user": "postgres",
    "password": "123456789",
    "port": "5432"
}

def fix():
    try:
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()
        
        # 1. Ensure the column exists
        cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;")
        
        # 2. Update specific products with quality MSI images
        # We use a direct SQL update for certainty
        updates = [
            ("https://storage-asset.msi.com/global/picture/image/feature/vga/RTX-4060-Ti-GAMING-X-8G-landing.png", "MSI RTX 4060 Ti"),
            ("https://storage-asset.msi.com/global/picture/banner/banner_165035252514746f36802e869733c7f1f4568b200b.jpg", "MSI Katana GF66"),
            ("https://storage-asset.msi.com/global/picture/image/feature/monitor/Optix-G241/G241-banner.png", "MSI Optix G241")
        ]
        
        for url, name in updates:
            cur.execute("UPDATE products SET image_url = %s WHERE name = %s", (url, name))
            
        conn.commit()
        print("Database Updated Successfully!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix()