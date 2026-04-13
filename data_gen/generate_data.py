import psycopg2
import random
from datetime import datetime, timedelta

# Database connection configuration
# Replace 'your_password' with your actual PostgreSQL password
db_params = {
    "host": "localhost",
    "database": "smart_inventory",
    "user": "postgres",
    "password": "123456789",
    "port": "5432"
}

def generate_sales_data():
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()

        print("Connected to database. Starting data generation...")

        # Get all product IDs from the database
        cur.execute("SELECT id, price FROM products")
        products = cur.fetchall()

        if not products:
            print("No products found in the database. Please add products first.")
            return

        # Get a customer ID (Assuming at least one user exists)
        cur.execute("SELECT id FROM users LIMIT 1")
        user = cur.fetchone()
        
        # If no user exists, create a dummy admin/customer
        if not user:
            cur.execute("INSERT INTO users (name, email, password, role) VALUES ('Test User', 'test@example.com', '123', 'customer') RETURNING id")
            user_id = cur.fetchone()[0]
        else:
            user_id = user[0]

        # Generate data for the last 365 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        total_orders = 0

        current_date = start_date
        while current_date <= end_date:
            # Generate 2-5 random orders per day
            num_orders_today = random.randint(2, 5)
            
            for _ in range(num_orders_today):
                # Pick a random product
                product = random.choice(products)
                product_id = product[0]
                unit_price = float(product[1])
                quantity = random.randint(1, 3)
                total_amount = unit_price * quantity

                # 1. Insert into orders table
                cur.execute(
                    "INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (%s, %s, %s, %s) RETURNING id",
                    (user_id, current_date, total_amount, 'completed')
                )
                order_id = cur.fetchone()[0]

                # 2. Insert into order_items table
                cur.execute(
                    "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s, %s, %s, %s)",
                    (order_id, product_id, quantity, unit_price)
                )
                total_orders += 1

            current_date += timedelta(days=1)

        # Commit changes and close connection
        conn.commit()
        cur.close()
        conn.close()
        print(f"Success! Inserted {total_orders} sales records into the database.")

    except Exception as error:
        print(f"Error: {error}")

if __name__ == "__main__":
    generate_sales_data()


