import psycopg2

# Database connection details
db_params = {
    "host": "localhost",
    "database": "smart_inventory",
    "user": "postgres",
    "password": "123456789",
    "port": "5432"
}

# List of new MSI products to add
new_products = [
    ("MSI Titan GT77", 950000.00, 5, 2, "Flagship gaming laptop with 4K display and RTX 4090."),
    ("MSI Stealth 16 Studio", 580000.00, 10, 3, "Slim and powerful laptop for creators and gamers."),
    ("MSI MAG B760 Tomahawk", 75000.00, 25, 5, "High-performance Intel motherboard with Wi-Fi 6E."),
    ("MSI GeForce RTX 4080 Super", 420000.00, 12, 4, "Ultimate graphics power with DLSS 3 support."),
    ("MSI MPG GUNGNIR 110R", 35000.00, 15, 5, "Premium mid-tower gaming case with ARGB fans."),
    ("MSI Optix MAG274QRF-QD", 145000.00, 18, 5, "Rapid IPS gaming monitor with Quantum Dot technology."),
    ("MSI Vigor GK50 Elite", 22000.00, 40, 10, "Mechanical gaming keyboard with Kailh Blue switches."),
    ("MSI Clutch GM41", 18000.00, 35, 8, "Lightweight wireless gaming mouse with 20K DPI."),
    ("MSI Spatium M480 2TB", 65000.00, 20, 5, "PCIe 4.0 NVMe M.2 SSD with extreme speeds."),
    ("MSI MEG Coreliquid S360", 95000.00, 14, 4, "Ultimate AIO liquid cooler with 2.4 inch IPS display.")
]

def insert_products():
    conn = None
    try:
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()
        
        # SQL query for insertion
        query = """
            INSERT INTO products (name, price, stock_quantity, min_stock_level, description, category_id)
            VALUES (%s, %s, %s, %s, %s, 1)
        """
        
        # Execute multiple inserts
        cur.executemany(query, new_products)
        
        conn.commit()
        print(f"Success! {cur.rowcount} new products inserted into the database.")
        cur.close()
        
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error: {error}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    insert_products()

