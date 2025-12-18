# Deployment Guide for CompatX

This guide outlines the steps to deploy the CompatX application using **Vercel** for the frontend, **Render** for the Spring Boot backend, and **Railway** for the MySQL database.

## Prerequisites

- [ ] GitHub repository containing the project (pushed and up-to-date).
- [ ] Accounts on [Vercel](https://vercel.com/), [Render](https://render.com/), and [Railway](https://railway.app/).
- [ ] Your API keys (Razorpay, Stripe) and Email/App Password ready.

---

## Phase 1: Database (Railway)

We'll start with the database so we have the connection URL ready for the backend.

1.  **Create Project**: Log in to Railway and click "New Project" > "Provision MySQL".
2.  **Get Credentials**:
    -   Click on the newly created MySQL service.
    -   Go to the **Variables** tab or **Connect** tab.
    -   Find the `MYSQL_URL` or the individual connection details (Host, Port, User, Password, Database).
    -   **Note**: Railway works best if you use the full connection URL (e.g., `mysql://root:password@host:port/railway`) or constructs it. For Spring Boot, we will format it as a JDBC URL.
    -   **JDBC URL Format**: `jdbc:mysql://<HOST>:<PORT>/<DATABASE_NAME>`
    -   Keep these details handy for the Render configuration.

---

## Phase 2: Backend (Render)

Deploy the Spring Boot API.

1.  **Create Web Service**:
    -   Log in to Render and click "New +" > "Web Service".
    -   Connect your GitHub repository.
2.  **Configuration**:
    -   **Name**: `compatx-backend` (or your choice).
    -   **Root Directory**: `compatx-backend` (Important: since your backend is in a generic subfolder).
    -   **Environment**: `Java`.
    -   **Build Command**: `./mvnw clean package -DskipTests` (Skips tests to save time/resources during build).
    -   **Start Command**: `java -jar target/CompatX-1.0.0.jar`
        -   *Note*: Verify the JAR name matches `target/` after a local build if unsure, but typically it follows `artifactId-version.jar` from `pom.xml`. `artifactId` is `CompatX`, `version` is `1.0.0`.
3.  **Environment Variables**:
    -   Add the following environment variables (Environmental Variables section):

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<RAILWAY_HOST>:<PORT>/<DATABASE>` | From Railway |
    | `SPRING_DATASOURCE_USERNAME` | `<RAILWAY_USER>` | From Railway which is usually `root` |
    | `SPRING_DATASOURCE_PASSWORD` | `<RAILWAY_PASSWORD>` | From Railway |
    | `JWT_SECRET` | `<YOUR_SECURE_RANDOM_STRING>` | Generate a strong secret |
    | `RAZORPAY_KEY_ID` | `<YOUR_ID>` | Your Razorpay Key ID |
    | `RAZORPAY_KEY_SECRET` | `<YOUR_SECRET>` | Your Razorpay Secret |
    | `STRIPE_PUBLIC_KEY` | `<YOUR_KEY>` | Stripe Public Key |
    | `STRIPE_SECRET_KEY` | `<YOUR_SECRET>` | Stripe Secret Key |
    | `SPRING_MAIL_USERNAME` | `<YOUR_EMAIL>` | For sending emails |
    | `SPRING_MAIL_PASSWORD` | `<YOUR_APP_PASSWORD>` | App Password (not login password) |
    | `SERVER_PORT` | `10000` | Render expects apps to bind to port 10000 by default (or the value of $PORT). Setting this tells Spring Boot to listen on 10000. |

4.  **Deploy**: Click "Create Web Service".
5.  **Get URL**: Once deployed, copy the backend URL (e.g., `https://compatx-backend.onrender.com`).

---

## Phase 3: Frontend (Vercel)

Deploy the React/Vite frontend.

1.  **Create Project**:
    -   Log in to Vercel and click "Add New..." > "Project".
    -   Import your GitHub repository.
2.  **Configuration**:
    -   **Framework Preset**: `Vite` (Vercel should auto-detect).
    -   **Root Directory**: Click "Edit" and select `compatX-frontend`.
    -   **Build Command**: `npm run build` (Default).
    -   **Output Directory**: `dist` (Default).
3.  **Environment Variables**:
    -   Expand "Environment Variables" and add:

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `VITE_API_URL` | `https://compatx-backend.onrender.com` | Your Render Backend URL (no trailing slash) |
    | `VITE_RAZORPAY_KEY_ID` | `<YOUR_KEY>` | Same as backend |
    | `VITE_STRIPE_PUBLIC_KEY` | `<YOUR_KEY>` | Same as backend |

4.  **Deploy**: Click "Deploy".
5.  **Verification**: Visit the provided Vercel URL. Test Login, Products, and Checkout.

---

## Additional Suggestions

-   **Database Security**: Ensure your Railway database is accessible from Render. Railway usually exposes public URLs, but for better security, check if you can peer them or if you need to allow-list IPs (usually not needed for basic Railway/Render setups).
-   **CORS**: Your Spring Boot backend likely has CORS configured. If it's hardcoded to `localhost`, you must update it to allow your Vercel domain.
    -   *Action*: Check `CorsConfig.java` or `WebSecurityConfig.java`. If you see `.allowedOrigins("http://localhost:5173")`, you might need to add an env var for CORS allowed origins or update the code to allow the Vercel URL.
