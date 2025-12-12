# 🚀 Quick Start - Testing Your API

## Morning Testing Steps

### 1️⃣ Start Your Application
```bash
./mvnw spring-boot:run
```
Wait for: "Started CompatXApplication"

### 2️⃣ Import Postman Collection
1. Open Postman
2. Click **Import**
3. Select `CompatX_Postman_Collection.json`
4. Done! Collection imported ✅

### 3️⃣ Quick Test Sequence

**Copy this order for Postman:**

```
1. Register User
2. Register Admin  
3. Create Category - Laptop
4. Create Category - Macbook
5. Create Category - Accessories
6. Create Product - Laptop Battery
7. Get All Products
8. Search Products - battery
9. Update Product
10. Delete Product
```

### 4️⃣ Expected Results

✅ **Success** = 200 OK or 201 Created  
⚠️ **Test Errors** = 404, 409, 400 (these are expected!)

---

## 📂 Files Created for You

1. **CompatX_Postman_Collection.json** - Import this into Postman
2. **POSTMAN_TESTING_GUIDE.md** - Detailed testing guide
3. **QUICK_START.md** - This file (quick reference)

---

## ⚡ Fastest Way to Test

Just run these **5 requests** to verify everything works:

| # | Request | Expected |
|---|---------|----------|
| 1 | Register User | 201 Created |
| 2 | Create Category - Laptop | 201 Created |
| 3 | Create Product | 201 Created |
| 4 | Get All Products | 200 OK |
| 5 | Search Products | 200 OK |

**If all 5 pass = Backend is working! 🎉**

---

## 🐛 Common Issues

**Port 8080 already in use?**
```bash
netstat -ano | findstr :8080
# Kill the process or change port in application.properties
```

**MySQL connection error?**
- Check MySQL is running on port 3307
- Check database `compatx_db` exists
- Check credentials in `application.properties`

**Import failed?**
- Make sure you're using Postman (not other tools)
- Try re-downloading the JSON file

---

## 📞 Need Help?

Check **POSTMAN_TESTING_GUIDE.md** for detailed instructions!

Good luck with your morning testing! ☕🚀










