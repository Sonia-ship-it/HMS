# Smart Hospital Appointment & Queue Management System

## 🏥 Complete Hospital Management System with Advanced Features

A full-featured hospital management system with dynamic scheduling, role-based security, real-time queue management, and comprehensive reporting.

---

## 📚 Documentation

### Quick Start
- **[COMPREHENSIVE_GUIDE.md](COMPREHENSIVE_GUIDE.md)** - Complete setup and usage guide
- **[ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md)** - Environment variables and configuration

### Advanced Features
- **[PROJECT_FEATURES_COMPLETE_OVERVIEW.md](PROJECT_FEATURES_COMPLETE_OVERVIEW.md)** - All features explained
- **[ADVANCED_FEATURES_GUIDE.md](ADVANCED_FEATURES_GUIDE.md)** - Technical deep dive
- **[COMPLETE_FEATURES_TESTING_GUIDE.md](COMPLETE_FEATURES_TESTING_GUIDE.md)** - How to test everything

### Specific Features
- **[DYNAMIC_SCHEDULER_GUIDE.md](DYNAMIC_SCHEDULER_GUIDE.md)** - Dynamic scheduling system
- **[SCHEDULER_UI_TESTING_GUIDE.md](SCHEDULER_UI_TESTING_GUIDE.md)** - Test scheduler UI
- **[QUEUE_SYSTEM_GUIDE.md](QUEUE_SYSTEM_GUIDE.md)** - Queue management
- **[SCHEDULER_AND_SECURITY_EXPLANATION.md](SCHEDULER_AND_SECURITY_EXPLANATION.md)** - Security details

### Credentials & Setup
- **[DEFAULT_CREDENTIALS.md](DEFAULT_CREDENTIALS.md)** - Login credentials
- **[COMPLETE_CREDENTIALS_AND_TESTING.md](COMPLETE_CREDENTIALS_AND_TESTING.md)** - Testing guide
- **[RESET_DATABASE_AND_USERS.md](RESET_DATABASE_AND_USERS.md)** - Database reset

---

## 🚀 Quick Start

```bash
cd backend
mvn spring-boot:run
```

### Backend
```bash
cd backend
cp .env.example .env  # Edit with your PostgreSQL password
mvn spring-boot:run
```
**URL**: http://localhost:8080  
**Swagger**: http://localhost:8080/swagger-ui.html

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**URL**: http://localhost:3000

---

## 👤 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Receptionist | reception | reception123 |
| Doctor | doctor1 | doctor123 |
| Patient | patient1 | patient123 |

See [DEFAULT_CREDENTIALS.md](DEFAULT_CREDENTIALS.md) for complete list.

---

## ✨ Key Features

### 1. Dynamic Scheduling System
- Configure schedulers at runtime (no restart needed)
- Enable/disable tasks via UI
- Monitor execution history
- Change cron expressions or fixed rates
- **Access**: `/admin/schedulers` (Admin only)

### 2. Advanced Pagination
- All list pages paginated (10-50 items per page)
- Sorting by any field
- Filtering and search
- Optimized database queries

### 3. Comprehensive Security
- JWT-based authentication
- Role-based authorization (4 roles)
- BCrypt password hashing
- Stateless sessions
- Protected endpoints

### 4. JPQL Queries & Analytics
- Doctor workload analysis
- Time series data (appointments per day)
- Complex aggregations
- Dashboard statistics

### 5. Queue Management
- Real-time queue updates
- Estimated wait times
- Auto-refresh
- Doctor call next patient
- Complete appointment workflow

### 6. Reports & Analytics
- PDF generation with detailed statistics
- Doctor workload reports
- Appointment trends
- Patient demographics
- Black/white professional design

---

## 🏗️ Architecture

### Backend (Spring Boot 3.2)
- **Database**: PostgreSQL
- **Security**: JWT + Spring Security
- **API Docs**: Swagger/OpenAPI
- **Monitoring**: Spring Actuator
- **Scheduling**: Dynamic task scheduler

### Frontend (Next.js 16)
- **Styling**: CSS + Lucide React icons
- **State**: React Hooks
- **API**: Fetch with JWT interceptor
- **Routing**: Next.js App Router

---

## 📁 Project Structure

### Backend
```
backend/src/main/java/com/sonia/hms/
├── config/          # Security, CORS, Schedulers
├── controller/      # REST endpoints
├── service/         # Business logic
├── repository/      # Data access (JPA)
├── entity/          # Domain models
├── dto/             # Data transfer objects
├── security/        # JWT, UserDetails
├── scheduler/       # Dynamic schedulers
└── exception/       # Error handling
```

### Frontend
```
frontend/src/app/
├── login/           # Authentication
├── dashboard/       # Role-based dashboard
├── patients/        # Patient management
├── doctors/         # Doctor management
├── appointments/    # Appointment booking
├── queue/           # Queue management
├── reports/         # Analytics & PDF
├── notifications/   # User notifications
└── admin/
    └── schedulers/  # Dynamic scheduler UI
```

---

## 🔧 Environment Configuration

### Backend (.env)
```bash
DB_URL=jdbc:postgresql://localhost:5432/hospitaldb
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-secret-key
SERVER_PORT=8080
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

See [ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md) for details.

---

## 🧪 Testing

### Run Tests (When Implemented)
```bash
cd backend
mvn test
```

**Status**: Tests not yet implemented. See [COMPLETE_FEATURES_TESTING_GUIDE.md](COMPLETE_FEATURES_TESTING_GUIDE.md) for testing procedures.

---

## 📊 Features Demonstrated

| Feature | Implementation | Status |
|---------|---------------|---------|
| **Dynamic Schedulers** | Database-driven cron/fixed-rate tasks | ✅ Complete |
| **Pagination** | PageRequest + Sort on all entities | ✅ Complete |
| **JPQL Queries** | Complex aggregations & time series | ✅ Complete |
| **Security** | JWT + role-based access control | ✅ Complete |
| **Queue System** | Real-time updates with wait times | ✅ Complete |
| **Reports** | PDF generation with statistics | ✅ Complete |
| **Notifications** | Real-time user notifications | ✅ Complete |
| **Testing** | Unit, integration, API tests | ❌ Not implemented |

---

## 🔗 API Endpoints

### Public
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Reset password

### Protected (Requires Authentication)
- `GET /api/dashboard` - Dashboard stats
- `GET /api/patients` - List patients (paginated)
- `GET /api/doctors` - List doctors (paginated)
- `GET /api/appointments` - List appointments (paginated)
- `GET /api/notifications` - User notifications
- `GET /api/reports` - Generate reports

### Admin Only
- `GET /api/schedulers` - List schedulers
- `PUT /api/schedulers/{id}` - Update scheduler
- `POST /api/schedulers/{taskName}/enable` - Enable scheduler
- `POST /api/schedulers/{taskName}/disable` - Disable scheduler

See Swagger UI for complete API documentation.

---

## 🎯 Testing Guide

### 1. Test Scheduler Management
1. Login as admin
2. Visit `/admin/schedulers`
3. View 3 schedulers
4. Edit schedule
5. Enable/disable
6. Monitor executions

See [SCHEDULER_UI_TESTING_GUIDE.md](SCHEDULER_UI_TESTING_GUIDE.md)

### 2. Test Pagination
1. Visit any list page (patients, doctors)
2. Verify 10 items per page
3. Search/filter
4. Navigate pages
5. Sort by columns

### 3. Test Security
1. Try accessing protected pages without login (blocked)
2. Login as patient
3. Try accessing admin pages (403 Forbidden)
4. Login as admin
5. Access all pages successfully

### 4. Test Queue System
1. Check in patient (receptionist)
2. View queue (doctor)
3. Call next patient
4. Complete appointment

See [QUEUE_SYSTEM_GUIDE.md](QUEUE_SYSTEM_GUIDE.md)

---

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database `hospitaldb` exists
- Check `.env` file has correct credentials

### Frontend can't connect
- Verify backend is running on port 8080
- Check CORS configuration
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Login issues
- Reset database if needed (see RESET_DATABASE_AND_USERS.md)
- Clear browser localStorage
- Check credentials in DEFAULT_CREDENTIALS.md

---

## 📈 Monitoring & Actuator

### Actuator Endpoints
- `/actuator/health` - Health status
- `/actuator/info` - Application info
- `/actuator/metrics` - Performance metrics
- `/actuator/beans` - Spring beans

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting section
3. Check browser/backend console for errors
4. Verify configuration files

---

**Last Updated**: June 2026  
**Version**: 2.0 - Complete Feature Implementation  
**Status**: ✅ Production Ready

## Demo accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| doctor1 | doctor123 | DOCTOR |
| reception | reception123 | RECEPTIONIST |
| patient1 | patient123 | PATIENT |

## Project structure (backend)

```
backend/src/main/java/com/sonia/hms/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── security/
├── exception/
├── config/
└── scheduler/
```

## Frontend routes

Login, register, role-based dashboard, patients, doctors, appointments (book + detail), live queue, TV queue board, reports, users, settings, profile, notifications, 403/404.
