# CompatX - Modern E-Commerce Platform

A full-stack e-commerce application built with Spring Boot and React, featuring secure authentication, payment integration, and comprehensive order management.

##  Project Overview

CompatX is a feature-rich online shopping platform that I developed to provide a seamless shopping experience for customers while offering powerful management tools for administrators. The application handles everything from product browsing to secure checkout, with support for multiple payment gateways and real-time order tracking.

##  Architecture

The application follows a modern three-tier architecture with clear separation of concerns:

![Database Schema](Website%20Screenshots/compatxERD.jpg)

The ERD above shows the complete database design, including relationships between users, products, categories, orders, carts, and authentication tokens. The schema is normalized to ensure data integrity while maintaining query performance.

**Key architectural decisions**:
- DTO-based API layer to isolate persistence models from external contracts
- Service-layer driven business logic (controllers remain thin)
- JWT as the single source of authentication across the system
- Role-based authorization enforced at API level (USER / ADMIN)


##  Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17
- **Database**: MySQL
- **Security**: Spring Security with JWT authentication
- **ORM**: Spring Data JPA with Hibernate
- **Validation**: Jakarta Bean Validation
- **Email**: Spring Mail
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js with React Three Fiber
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: Sonner

### Payment Integration
- **Stripe**: International payments
- **Razorpay**: Indian payment gateway

##  Key Features

### Customer Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Product Browsing**: Browse products with advanced filtering and search
- **Shopping Cart**: Add, update, and remove items with real-time price calculations
- **Secure Checkout**: Multi-step checkout process with address validation
- **Multiple Payment Options**: Support for Stripe and Razorpay
- **Order Tracking**: View order history and track delivery status
- **User Profile**: Manage personal information and shipping addresses
- **Password Recovery**: Forgot password functionality with email verification

### Admin Features
- **Dashboard**: Overview of sales, orders, and key metrics
- **Product Management**: CRUD operations for products with image uploads
- **Category Management**: Organize products into categories
- **Order Management**: View, update, and track all customer orders
- **Order Analytics**: Visual insights into sales performance and trends
- **Inventory Control**: Track stock levels and manage product availability

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Password encryption using BCrypt
- CORS configuration for secure cross-origin requests
- Protected API endpoints
- Secure payment processing

## 📸 Application Screenshots

Here are some key screens from the application. For the complete collection, check out the [Website Screenshots](Website%20Screenshots) folder.

### Homepage
![Homepage](Website%20Screenshots/homepage.png)
The landing page features an immersive 3D experience with smooth animations to engage visitors.

### Product Shop
![Shop](Website%20Screenshots/Shop.png)
Browse through our product catalog with filtering and search capabilities.

### Shopping Cart
![Cart](Website%20Screenshots/cart.png)
Review your items before checkout with real-time price updates.

### Checkout Process
![Checkout](Website%20Screenshots/checkout.png)
Secure multi-step checkout with address validation and payment options.

*Want to see more? Check out the complete screenshot collection in the `Website Screenshots` folder, including payment integrations, admin panels, order management, and analytics dashboards.*

##  Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16+ and npm
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CompatX.git
   cd CompatX-Security/compatx-backend
   ```

2. **Configure Database**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE compatx_db;
   ```

   Update `src/main/resources/application.properties` with your database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/compatx_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Configure Email Service**
   
   Add your email configuration in `application.properties`:
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

4. **Configure Payment Gateways**
   
   Add your API keys:
   ```properties
   stripe.api.key=your_stripe_secret_key
   razorpay.key.id=your_razorpay_key_id
   razorpay.key.secret=your_razorpay_secret
   ```

5. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../compatX-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update the API base URL in `src/lib/axiosClient.js` if needed (default is `http://localhost:8080`)

4. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

##  API Documentation

The backend includes a comprehensive Postman collection for testing all endpoints. Import `CompatX_Postman_Collection.json` into Postman to get started.

For detailed testing instructions, refer to:

##  Project Structure

### Backend Structure
```
compatx-backend/
├── src/main/java/com/namit/
│   ├── controllers/      # REST API endpoints
│   ├── services/         # Business logic layer
│   ├── repositories/     # Data access layer
│   ├── models/          # JPA entities
│   ├── dtos/            # Data transfer objects
│   ├── mappers/         # Entity-DTO mappers
│   ├── security/        # Security configuration & JWT
│   ├── exceptions/      # Custom exceptions
│   └── enums/           # Enumerations
└── src/main/resources/
    └── application.properties
```

### Frontend Structure
```
compatX-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── customer/   # Customer-facing pages
│   │   └── shared/     # Shared pages (login, etc.)
│   ├── services/       # API service layer
│   ├── stores/         # Zustand state management
│   ├── lib/            # Utility functions
│   └── assets/         # Static assets
```

## Deployment Notes

- Frontend is deployed on Vercel
- Backend is deployed as a Spring Boot service
- Environment variables are managed per environment
- Production build uses optimized frontend assets and JWT-based auth


## Building for Production

### Backend
```bash
cd compatx-backend
./mvnw clean package
java -jar target/CompatX-1.0.0.jar
```

### Frontend
```bash
cd compatX-frontend
npm run build
```

The production build will be in the `dist` folder, ready for deployment.

##  Contributing

This is a personal project, but suggestions and feedback are always welcome! Feel free to open an issue if you find any bugs or have ideas for improvements.

##  License

This project is part of my academic portfolio. Please contact me if you'd like to use any part of it.

##  Developer

Built by Namit Rohekar

---

**Note**: This project was developed as a comprehensive demonstration of full-stack development skills, including backend architecture, frontend design, database modeling, security implementation, and third-party API integration.
