import os
import pymongo
import datetime
import certifi
import pathlib
import random
import hashlib
import secrets
from dotenv import load_dotenv

# Load environment variables
env_path = pathlib.Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv('MONGO_URI')

if not MONGO_URI:
    print("Error: MONGO_URI not found in environment variables.")
    exit(1)

def get_database():
    try:
        # Connect to MongoDB with certifi for SSL context
        client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where())
        print("✔ Connected to MongoDB")
        return client.get_database() # Uses the DB name from the connection string
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        exit(1)

def hash_password(password):
    """Simple password hashing using SHA256 (for demo purposes)"""
    # Note: In production, bcryptjs is used by the Node.js backend
    # This is just for seeding purposes
    return hashlib.sha256(password.encode()).hexdigest()

def seed_data():
    db = get_database()
    
    # Collections matching backend/models/*.js
    stores_col = db['stores']
    products_col = db['products']
    users_col = db['users']
    adminusers_col = db['adminusers']
    transactions_col = db['transactions']
    transactionitems_col = db['transactionitems']
    barcodemaps_col = db['barcodemaps']
    qrreceipts_col = db['qrreceipts']
    
    # Clear existing data (Optional: Remove if you want to append)
    print("Clearing existing data...")
    stores_col.delete_many({})
    products_col.delete_many({})
    users_col.delete_many({})
    adminusers_col.delete_many({})
    transactions_col.delete_many({})
    transactionitems_col.delete_many({})
    barcodemaps_col.delete_many({})
    qrreceipts_col.delete_many({})

    # 1. Stores (Matching Store Schema: name, logo_url, is_active, is_deleted)
    stores_data = [
        {"name": "Monster", "logo_url": "https://logo.clearbit.com/monsterenergy.com"},
        {"name": "Nike", "logo_url": "https://logo.clearbit.com/nike.com"},
        {"name": "Adidas", "logo_url": "https://logo.clearbit.com/adidas.com"},
        {"name": "Walmart", "logo_url": "https://logo.clearbit.com/walmart.com"},
        {"name": "Apple", "logo_url": "https://logo.clearbit.com/apple.com"},
        {"name": "IKEA", "logo_url": "https://logo.clearbit.com/ikea.com"}
    ]

    print("Inserting stores...")
    store_map = {} # To map name -> ObjectId
    
    for store in stores_data:
        store_doc = {
            "name": store["name"],
            "logo_url": store["logo_url"],
            "is_active": True,
            "is_deleted": False,
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        result = stores_col.insert_one(store_doc)
        store_map[store["name"]] = result.inserted_id
        
    print(f"✔ {len(stores_data)} Stores inserted successfully")

    # 2. Products (Matching Product Schema: store_id, name, price, sku, barcode_value, image_url, description)
    products_templates = {
        "Monster": [
            {"base_name": "Monster Original 16oz", "price": 2.99},
            {"base_name": "Monster Zero Ultra", "price": 2.99},
            {"base_name": "Monster Mango Loco", "price": 3.29},
            {"base_name": "Monster Pipeline Punch", "price": 3.49},
            {"base_name": "Monster Rehab", "price": 2.79}
        ],
        "Nike": [
            {"base_name": "Air Force 1", "price": 110.00},
            {"base_name": "Dunk Low", "price": 115.00},
            {"base_name": "Air Max 90", "price": 130.00},
            {"base_name": "Pegasus 40", "price": 140.00},
            {"base_name": "Tech Fleece Hoodie", "price": 110.00}
        ],
        "Adidas": [
            {"base_name": "Ultraboost", "price": 180.00},
            {"base_name": "Samba", "price": 100.00},
            {"base_name": "Stan Smith", "price": 90.00},
            {"base_name": "Gazelle", "price": 100.00},
            {"base_name": "Assorted Slides", "price": 45.00}
        ],
        "Walmart": [
            {"base_name": "Water 24pk", "price": 3.99},
            {"base_name": "Paper Towels", "price": 16.99},
            {"base_name": "Milk Gallon", "price": 3.49},
            {"base_name": "Bread", "price": 2.49},
            {"base_name": "Bananas (lb)", "price": 0.59}
        ],
        "Apple": [
            {"base_name": "iPhone 15 Pro", "price": 999.00},
            {"base_name": "MacBook Air", "price": 1099.00},
            {"base_name": "AirPods Pro", "price": 249.00},
            {"base_name": "iPad Air", "price": 599.00},
            {"base_name": "Apple Watch", "price": 399.00}
        ],
        "IKEA": [
            {"base_name": "BILLY Bookcase", "price": 89.00},
            {"base_name": "POANG Chair", "price": 129.00},
            {"base_name": "KALLAX Shelf", "price": 79.99},
            {"base_name": "MALM Bed", "price": 249.00},
            {"base_name": "Meatballs (Frozen)", "price": 12.99}
        ]
    }

    print("Generating and inserting products...")
    product_ids = []
    
    for store_name, templates in products_templates.items():
        store_id = store_map.get(store_name)
        if not store_id:
            continue
            
        # Create 10+ products per store by using templates twice + variations
        for i in range(12): 
            template = templates[i % len(templates)]
            
            # Creating variations to ensure uniqueness
            variant = i // len(templates) + 1
            prod_name = f"{template['base_name']}"
            if variant > 1:
                prod_name += f" V{variant}"
            
            # Generate Unique SKU and Barcode
            sku = f"{store_name[:3].upper()}-{random.randint(1000, 9999)}-{i}"
            barcode = f"{random.randint(100000000000, 999999999999)}"
            
            product_doc = {
                "store_id": store_id,
                "name": prod_name,
                "price": template["price"],
                "sku": sku,
                "barcode_value": barcode,
                "image_url": "https://placehold.co/600x400",
                "description": f"Description for {prod_name}",
                "is_active": True,
                "is_deleted": False,
                "createdAt": datetime.datetime.utcnow(),
                "updatedAt": datetime.datetime.utcnow()
            }
            result = products_col.insert_one(product_doc)
            product_ids.append({
                "id": result.inserted_id,
                "barcode": barcode,
                "price": template["price"],
                "name": prod_name
            })

    print(f"✔ {len(product_ids)} Products inserted successfully")

    # 3. Users (Matching User Schema: email, password, phone, name, is_active, is_deleted)
    users_data = [
        {"email": "john.doe@example.com", "password": "password123", "phone": "+1234567890", "name": "John Doe"},
        {"email": "jane.smith@example.com", "password": "password123", "phone": "+1234567891", "name": "Jane Smith"},
        {"email": "mike.wilson@example.com", "password": "password123", "phone": "+1234567892", "name": "Mike Wilson"},
        {"email": "sarah.johnson@example.com", "password": "password123", "phone": "+1234567893", "name": "Sarah Johnson"},
        {"email": "test@example.com", "password": "password123", "phone": "+1234567894", "name": "Test User"}
    ]

    print("Inserting users...")
    user_ids = []
    
    for user in users_data:
        user_doc = {
            "email": user["email"],
            "password": hash_password(user["password"]),  # Hashed password
            "phone": user["phone"],
            "name": user["name"],
            "is_active": True,
            "is_deleted": False,
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        result = users_col.insert_one(user_doc)
        user_ids.append(result.inserted_id)
        
    print(f"✔ {len(users_data)} Users inserted successfully")

    # 4. AdminUsers (Matching AdminUser Schema: username, email, password_hash, role, store_id, is_active, is_deleted)
    adminusers_data = [
        {"username": "admin", "email": "admin@nexhacks.com", "password": "admin123", "role": "ADMIN", "store_id": None},
        {"username": "nike_manager", "email": "manager@nike.com", "password": "manager123", "role": "MANAGER", "store_id": "Nike"},
        {"username": "walmart_gate", "email": "gate@walmart.com", "password": "gate123", "role": "GATE_STAFF", "store_id": "Walmart"},
        {"username": "apple_manager", "email": "manager@apple.com", "password": "manager123", "role": "MANAGER", "store_id": "Apple"}
    ]

    print("Inserting admin users...")
    
    for admin in adminusers_data:
        store_id = store_map.get(admin["store_id"]) if admin["store_id"] else None
        
        admin_doc = {
            "username": admin["username"],
            "email": admin["email"],
            "password_hash": hash_password(admin["password"]),
            "role": admin["role"],
            "store_id": store_id,
            "is_active": True,
            "is_deleted": False,
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        adminusers_col.insert_one(admin_doc)
        
    print(f"✔ {len(adminusers_data)} Admin users inserted successfully")

    # 5. BarcodeMaps (Matching BarcodeMap Schema: barcode_value, product_id)
    print("Inserting barcode maps...")
    barcode_count = 0
    
    for product in product_ids:
        barcode_doc = {
            "barcode_value": product["barcode"],
            "product_id": product["id"],
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        barcodemaps_col.insert_one(barcode_doc)
        barcode_count += 1
        
    print(f"✔ {barcode_count} Barcode maps inserted successfully")

    # 6. Transactions (Matching Transaction Schema: store_id, user_id, total_amount, subtotal, tax_amount, status, payment_provider, payment_reference, payment_intent_id)
    print("Inserting transactions with items...")
    transaction_count = 0
    
    # Create sample transactions
    for i in range(10):
        # Pick random store and user
        store_name = random.choice(list(store_map.keys()))
        store_id = store_map[store_name]
        user_id = random.choice(user_ids) if random.random() > 0.3 else None  # 70% have user, 30% are anonymous
        
        # Pick random products from this store (2-5 items)
        store_products = [p for p in product_ids if products_col.find_one({"_id": p["id"]})["store_id"] == store_id]
        if not store_products:
            continue
            
        num_items = random.randint(2, min(5, len(store_products)))
        selected_products = random.sample(store_products, num_items)
        
        # Calculate totals
        subtotal = sum(p["price"] * random.randint(1, 3) for p in selected_products)
        tax_amount = round(subtotal * 0.08, 2)  # 8% tax
        total_amount = round(subtotal + tax_amount, 2)
        
        transaction_doc = {
            "store_id": store_id,
            "user_id": user_id,
            "total_amount": total_amount,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "status": random.choice(["PAID", "PAID", "PAID", "PENDING"]),  # Mostly paid
            "payment_provider": random.choice(["APPLE_PAY", "GOOGLE_PAY", "CARD", "PAYPAL"]),
            "payment_reference": f"REF-{secrets.token_hex(8).upper()}",
            "payment_intent_id": f"pi_{secrets.token_hex(12)}",
            "createdAt": datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 30)),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        transaction_result = transactions_col.insert_one(transaction_doc)
        transaction_id = transaction_result.inserted_id
        transaction_count += 1
        
        # 7. TransactionItems (Matching TransactionItem Schema: transaction_id, product_id, qty, unit_price, total_price)
        for product in selected_products:
            qty = random.randint(1, 3)
            unit_price = product["price"]
            total_price = round(qty * unit_price, 2)
            
            item_doc = {
                "transaction_id": transaction_id,
                "product_id": product["id"],
                "qty": qty,
                "unit_price": unit_price,
                "total_price": total_price,
                "createdAt": datetime.datetime.utcnow(),
                "updatedAt": datetime.datetime.utcnow()
            }
            transactionitems_col.insert_one(item_doc)
        
        # 8. QRReceipts (Matching QrReceipt Schema: transaction_id, qr_token, qr_image_base64, expires_at, verified_at, verified_by, is_verified)
        # Create QR receipt for paid transactions
        if transaction_doc["status"] == "PAID":
            qr_token = secrets.token_urlsafe(32)
            is_verified = random.choice([True, False])
            
            qr_doc = {
                "transaction_id": transaction_id,
                "qr_token": qr_token,
                "qr_image_base64": None,  # Would contain actual QR code in production
                "expires_at": datetime.datetime.utcnow() + datetime.timedelta(days=7),
                "verified_at": datetime.datetime.utcnow() if is_verified else None,
                "verified_by": "gate_staff" if is_verified else None,
                "is_verified": is_verified,
                "createdAt": datetime.datetime.utcnow(),
                "updatedAt": datetime.datetime.utcnow()
            }
            qrreceipts_col.insert_one(qr_doc)
    
    print(f"✔ {transaction_count} Transactions with items and QR receipts inserted successfully")
    
    # Summary
    print("\n" + "="*50)
    print("DATABASE SEEDING COMPLETED")
    print("="*50)
    print(f"Stores:           {stores_col.count_documents({})}")
    print(f"Products:         {products_col.count_documents({})}")
    print(f"Users:            {users_col.count_documents({})}")
    print(f"Admin Users:      {adminusers_col.count_documents({})}")
    print(f"Barcode Maps:     {barcodemaps_col.count_documents({})}")
    print(f"Transactions:     {transactions_col.count_documents({})}")
    print(f"Transaction Items:{transactionitems_col.count_documents({})}")
    print(f"QR Receipts:      {qrreceipts_col.count_documents({})}")
    print("="*50)
    print("\n✔ Script execution completed successfully!")

if __name__ == "__main__":
    seed_data()