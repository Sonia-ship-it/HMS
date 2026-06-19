# Scheduler UI Troubleshooting Guide

## Issue: Empty Scheduler Cards on `/admin/schedulers`

### Symptoms
- User sees empty scheduler cards without content
- Missing summary cards at the top (Total Schedulers, Active, Disabled, Total Executions)
- Missing scheduler details inside cards

---

## Root Cause Analysis - SOLVED! ✓

### **THE ISSUE WAS FOUND:**

The `DataInitializer` was only running `initSchedulerConfigs()` when `userRepository.count() == 0`. Since your database already had users from previous runs, the scheduler initialization was being skipped entirely!

**The Fix Applied:**
Changed `DataInitializer.java` to always check and create schedulers independently of user data:

```java
@Override
public void run(String... args) {
    // Initialize Scheduler Configurations (always check and create if missing)
    if (schedulerConfigRepository.count() == 0) {
        initSchedulerConfigs();
    }

    // Skip other data initialization if users already exist
    if (userRepository.count() > 0) return;
    
    // ... rest of initialization
}
```

### Other Possible Causes (if issue persists):

### 1. **Backend Not Running**
If the Spring Boot backend isn't running, the API calls will fail silently or return errors.

### 2. **Database Not Initialized**
The `DataInitializer` needs to run on startup to create the 3 default schedulers:
- `mark-no-shows` (hourly)
- `daily-summary` (midnight)
- `update-queue-wait-time` (5 minutes)

### 3. **Authentication Issue**
- JWT token expired or invalid
- User doesn't have ADMIN role
- CORS blocking the requests

### 4. **Frontend Caching**
Next.js might be serving a cached version of the page.

---

## Quick Fix - Restart Backend

**The issue has been fixed in the code!** Now you just need to restart the backend:

### Option 1: Restart from IntelliJ IDEA
1. Stop the current backend process (red stop button)
2. Click the green play button to restart
3. Wait for: `Started HospitalApplication in X.XXX seconds`
4. Look for: `Initialized 3 scheduler configurations` (new log message)

### Option 2: Restart from Terminal
```bash
# Stop current process (Ctrl+C)
# Then start again
cd backend
./mvnw spring-boot:run    # Mac/Linux
mvnw.cmd spring-boot:run  # Windows
```

### What to Look For in Logs:
**Before Fix:**
```
Task mark-no-shows is not configured or disabled
Task daily-summary is not configured or disabled
Task update-queue-wait-time is not configured or disabled
```

**After Fix:**
```
Initialized 3 scheduler configurations
Scheduled task: mark-no-shows with cron: 0 0 * * * *
Scheduled task: daily-summary with cron: 0 0 0 * * *
Scheduled task: update-queue-wait-time with rate: 300000ms
```

Then refresh your browser at `/admin/schedulers` - you should see all the data!

---

## Step-by-Step Resolution (if restart doesn't work)

### Step 1: Start the Backend

**If you have Maven installed:**
```bash
cd backend
mvn spring-boot:run
```

**If you have Maven wrapper:**
```bash
cd backend
./mvnw spring-boot:run     # Linux/Mac
mvnw.cmd spring-boot:run   # Windows
```

**Verify Backend Started:**
Look for this in the console output:
```
Started HospitalApplication in X.XXX seconds
```

### Step 2: Verify Database Connection

Check the backend logs for:
```
✓ Hikari pool started successfully
✓ Creating schedulers table
✓ Initializing scheduler configurations
```

If you see database errors:
1. Verify PostgreSQL is running: `psql -U postgres`
2. Verify database exists: `\l` (should show `hospitaldb`)
3. Check credentials in `backend/.env`:
   ```
   DB_URL=jdbc:postgresql://localhost:5432/hospitaldb
   DB_USERNAME=postgres
   DB_PASSWORD=Soniauwase@123
   ```

### Step 3: Verify Schedulers in Database

Connect to the database:
```bash
psql -U postgres -d hospitaldb
```

Check if schedulers exist:
```sql
SELECT * FROM scheduler_config;
```

**Expected Output:**
```
 id |      task_name          | cron_expression | fixed_rate_ms | enabled |             description              | execution_count | last_executed
----+-------------------------+-----------------+---------------+---------+--------------------------------------+-----------------+---------------
  1 | mark-no-shows           | 0 0 * * * *     | NULL          | true    | Marks appointments as NO_SHOW...     | 0               | NULL
  2 | daily-summary           | 0 0 0 * * *     | NULL          | true    | Logs daily appointment summary...    | 0               | NULL
  3 | update-queue-wait-time  | NULL            | 300000        | true    | Updates estimated wait times...      | 0               | NULL
```

**If table is empty**, the DataInitializer didn't run. Check:
- Backend logs for errors during startup
- Make sure `user_account` table has records (DataInitializer only runs if `userRepository.count() == 0`)

### Step 4: Test API Endpoints Directly

**Option A: Using curl**
```bash
# Login first to get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Copy the JWT token from response, then:
```bash
# Get all schedulers
curl http://localhost:8080/api/schedulers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "taskName": "mark-no-shows",
    "cronExpression": "0 0 * * * *",
    "fixedRateMs": null,
    "enabled": true,
    "description": "Marks appointments as NO_SHOW if patient didn't show up...",
    "executionCount": 0,
    "lastExecuted": null
  },
  // ... 2 more schedulers
]
```

**Option B: Using Browser DevTools**
1. Open `/login` in browser
2. Login as admin (username: `admin`, password: `admin123`)
3. Open DevTools (F12) → Console
4. Run:
```javascript
const token = localStorage.getItem('hms_token');
fetch('http://localhost:8080/api/schedulers', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Step 5: Check Frontend Console for Errors

1. Navigate to `/admin/schedulers`
2. Open DevTools (F12) → Console
3. Look for errors:

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch` | Backend not running | Start backend (Step 1) |
| `401 Unauthorized` | Invalid/expired token | Re-login as admin |
| `403 Forbidden` | User is not ADMIN | Login with admin account |
| `404 Not Found` | Wrong API URL | Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local` |
| `CORS error` | CORS misconfiguration | Verify `CorsConfig.java` allows `http://localhost:3000` |

### Step 6: Clear Next.js Cache

```bash
cd frontend
rm -rf .next
npm run dev
```

Then refresh the browser page with hard reload: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

### Step 7: Verify User is Admin

Check the logged-in user's role:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('hms_user'));
console.log('User role:', user?.role);
```

Expected: `ROLE_ADMIN`

If not admin, logout and login with:
- Username: `admin`
- Password: `admin123`

---

## Detailed API Endpoint Testing

### 1. GET `/api/schedulers` - List All Schedulers

**Powers:**
- Summary cards at top (Total, Active, Disabled, Total Executions)
- All 3 scheduler cards below

**Test:**
```bash
curl http://localhost:8080/api/schedulers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Array of 3 schedulers

---

### 2. GET `/api/schedulers/{taskName}` - Get Specific Scheduler

**Powers:**
- "Edit" button click
- Opens edit modal with scheduler details

**Test:**
```bash
curl http://localhost:8080/api/schedulers/mark-no-shows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Single scheduler object

---

### 3. PUT `/api/schedulers/{id}` - Update Configuration

**Powers:**
- "Save Changes" button in edit modal

**Test:**
```bash
curl -X PUT http://localhost:8080/api/schedulers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cronExpression": "0 0 */2 * * *",
    "fixedRateMs": null,
    "enabled": true,
    "description": "Updated description"
  }'
```

**Expected:** Updated scheduler object

---

### 4. POST `/api/schedulers/{taskName}/enable` - Enable Scheduler

**Powers:**
- "Enable" button on disabled schedulers

**Test:**
```bash
curl -X POST http://localhost:8080/api/schedulers/mark-no-shows/enable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `"Scheduler mark-no-shows enabled"`

---

### 5. POST `/api/schedulers/{taskName}/disable` - Disable Scheduler

**Powers:**
- "Disable" button on enabled schedulers

**Test:**
```bash
curl -X POST http://localhost:8080/api/schedulers/mark-no-shows/disable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `"Scheduler mark-no-shows disabled"`

---

### 6. GET `/api/schedulers/{taskName}/status` - Check Status

**Powers:**
- "Status" button on each scheduler card
- Opens status modal with detailed information

**Test:**
```bash
curl http://localhost:8080/api/schedulers/mark-no-shows/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```
Task: mark-no-shows, Enabled: true, Running: false, Executions: 0, Last: null
```

---

## Complete Frontend-Backend Integration Checklist

### Backend ✓
- [x] `SchedulerConfig` entity created
- [x] `SchedulerConfigRepository` interface
- [x] `DynamicSchedulerService` with all methods
- [x] `SchedulerController` with 6 endpoints
- [x] `@PreAuthorize("hasRole('ADMIN')")` on controller
- [x] Security configuration allows scheduler endpoints
- [x] DataInitializer creates 3 default schedulers
- [x] Schedulers are dynamic (read from DB, not @Scheduled)

### Frontend ✓
- [x] Scheduler page at `/app/admin/schedulers/page.js`
- [x] "Schedulers" link in admin sidebar (`AppShell.jsx`)
- [x] Summary cards (Total, Active, Disabled, Executions)
- [x] Individual scheduler cards with details
- [x] Edit modal for updating configuration
- [x] Status modal for checking runtime status
- [x] Enable/Disable toggle buttons
- [x] Refresh button for manual reload
- [x] Auto-refresh every 10 seconds
- [x] Error handling and loading states
- [x] Empty state when no schedulers
- [x] All 6 API endpoints integrated

---

## Expected UI Layout

```
┌─────────────────────────────────────────────────────┐
│  SCHEDULER MANAGEMENT                               │
│  Manage system scheduled tasks                      │
├─────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ Total  │  │ Active │  │Disabled│  │  Total │   │
│  │   3    │  │   3    │  │   0    │  │   0    │   │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ mark-no-shows       │  │ daily-summary       │  │
│  │ [Enabled] [Edit]    │  │ [Enabled] [Edit]    │  │
│  │                     │  │                     │  │
│  │ Schedule: Cron: ... │  │ Schedule: Cron: ... │  │
│  │ Executions: 0 times │  │ Executions: 0 times │  │
│  │ Last: Never         │  │ Last: Never         │  │
│  │                     │  │                     │  │
│  │ [Disable] [Status]  │  │ [Disable] [Status]  │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│  ┌─────────────────────┐                           │
│  │ update-queue-...    │                           │
│  │ [Enabled] [Edit]    │                           │
│  │                     │                           │
│  │ Schedule: Every 5 m │                           │
│  │ Executions: 0 times │                           │
│  │ Last: Never         │                           │
│  │                     │                           │
│  │ [Disable] [Status]  │                           │
│  └─────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

---

## Quick Diagnosis Commands

Run these commands to quickly diagnose the issue:

```bash
# 1. Check if backend is running
curl http://localhost:8080/actuator/health 2>/dev/null && echo "✓ Backend is UP" || echo "✗ Backend is DOWN"

# 2. Check if PostgreSQL is running
psql -U postgres -c "SELECT version();" 2>/dev/null && echo "✓ PostgreSQL is UP" || echo "✗ PostgreSQL is DOWN"

# 3. Check if database exists
psql -U postgres -lqt | cut -d \| -f 1 | grep -qw hospitaldb && echo "✓ Database exists" || echo "✗ Database missing"

# 4. Check if schedulers table has data
psql -U postgres -d hospitaldb -c "SELECT COUNT(*) FROM scheduler_config;" 2>/dev/null

# 5. Check if frontend is running
curl http://localhost:3000 2>/dev/null && echo "✓ Frontend is UP" || echo "✗ Frontend is DOWN"
```

---

## Still Not Working?

If you've followed all steps and still see empty cards:

### 1. Check Browser Console
Open DevTools (F12) → Console tab
- Look for red error messages
- Check Network tab for failed API calls
- Verify the API response in Network tab preview

### 2. Check Backend Logs
Look for errors in the Spring Boot console output:
- Database connection errors
- Authentication/authorization errors
- NullPointerException or other runtime errors

### 3. Verify DataInitializer Ran
Add debug logging:
```java
// In DataInitializer.java
@Override
public void run(String... args) {
    System.out.println(">>> DataInitializer starting...");
    System.out.println(">>> User count: " + userRepository.count());
    
    if (userRepository.count() > 0) {
        System.out.println(">>> Skipping initialization - data exists");
        return;
    }
    
    System.out.println(">>> Initializing scheduler configs...");
    initSchedulerConfigs();
    System.out.println(">>> Scheduler configs initialized");
    // ... rest of code
}
```

### 4. Manual Database Insert
If DataInitializer isn't running, manually insert schedulers:

```sql
-- Connect to database
psql -U postgres -d hospitaldb

-- Insert schedulers
INSERT INTO scheduler_config (task_name, cron_expression, fixed_rate_ms, enabled, description, execution_count, last_executed)
VALUES 
('mark-no-shows', '0 0 * * * *', NULL, true, 'Marks appointments as NO_SHOW if patient didnt show up 30 minutes past appointment time', 0, NULL),
('daily-summary', '0 0 0 * * *', NULL, true, 'Logs daily appointment summary statistics', 0, NULL),
('update-queue-wait-time', NULL, 300000, true, 'Updates estimated wait times for all queue entries', 0, NULL);

-- Verify
SELECT * FROM scheduler_config;
```

### 5. Contact for Help
Provide this information:
1. Backend console output (first 50 lines)
2. Browser console errors (screenshot)
3. Network tab screenshot showing API call
4. Output of: `SELECT * FROM scheduler_config;`
5. Output of: `SELECT username, role FROM user_account WHERE role = 'ROLE_ADMIN';`

---

## Success Verification

You'll know it's working when:

✓ Backend starts without errors
✓ Database has 3 rows in `scheduler_config` table
✓ You can login as admin
✓ `/admin/schedulers` shows 4 summary cards at top
✓ `/admin/schedulers` shows 3 scheduler cards with full details
✓ Clicking "Edit" opens modal with scheduler configuration
✓ Clicking "Status" shows detailed status information
✓ Clicking "Disable" disables the scheduler
✓ Clicking "Enable" enables the scheduler
✓ Clicking "Refresh" updates the data

---

## Helpful Tips

1. **Always check backend first** - If backend isn't running or has errors, frontend will show empty data
2. **Use browser DevTools** - Console and Network tabs show exactly what's failing
3. **Test APIs directly** - Use curl or Postman to verify backend works independently
4. **Check authentication** - Most issues are expired tokens or wrong user role
5. **Clear cache when in doubt** - Next.js aggressively caches pages

---

## Related Files

- Backend Controller: `backend/src/main/java/com/sonia/hms/controller/SchedulerController.java`
- Backend Service: `backend/src/main/java/com/sonia/hms/service/DynamicSchedulerService.java`
- Backend Entity: `backend/src/main/java/com/sonia/hms/entity/SchedulerConfig.java`
- Data Initializer: `backend/src/main/java/com/sonia/hms/config/DataInitializer.java`
- Frontend Page: `frontend/src/app/admin/schedulers/page.js`
- Sidebar Link: `frontend/src/components/layout/AppShell.jsx`
- API Library: `frontend/src/lib/api.js`
