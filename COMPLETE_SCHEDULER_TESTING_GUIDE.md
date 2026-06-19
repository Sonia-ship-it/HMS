# Complete Scheduler Testing Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend UI Testing](#frontend-ui-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Verification Checklist](#verification-checklist)

---

## Prerequisites

### 1. Start PostgreSQL Database
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

### 2. Start Backend Server
```bash
cd backend
./mvnw spring-boot:run    # Mac/Linux
mvnw.cmd spring-boot:run  # Windows (or run from IntelliJ)
```

**Wait for this log message:**
```
Started HospitalApplication in X.XXX seconds
```

**Verify schedulers were initialized:**
Look for these logs (after the fix):
```
INFO - Initializing scheduler configurations
INFO - Created scheduler: mark-no-shows
INFO - Created scheduler: daily-summary
INFO - Created scheduler: update-queue-wait-time
```

### 3. Start Frontend Server
```bash
cd frontend
npm run dev
```

**Access frontend at:** http://localhost:3000

### 4. Login as Admin
- URL: http://localhost:3000/login
- Username: `admin`
- Password: `admin123`

---

## Backend Testing

### Test 1: Verify Schedulers in Database

```bash
# Connect to database
psql -U postgres -d hospitaldb
```

```sql
-- Check scheduler configs
SELECT id, task_name, cron_expression, fixed_rate_ms, enabled, execution_count 
FROM scheduler_config;
```

**Expected Output:**
```
 id |      task_name          | cron_expression | fixed_rate_ms | enabled | execution_count
----+-------------------------+-----------------+---------------+---------+-----------------
  1 | mark-no-shows           | 0 0 * * * *     | NULL          | t       | 0
  2 | daily-summary           | 0 0 0 * * *     | NULL          | t       | 0
  3 | update-queue-wait-time  | NULL            | 300000        | t       | 0
```

✅ **PASS:** 3 rows returned with correct task names
❌ **FAIL:** 0 rows or missing tasks

---

### Test 2: API Endpoint Testing with cURL

#### 2.1 Login and Get JWT Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ROLE_ADMIN",
  "fullName": "System Administrator"
}
```

**Copy the JWT token** from the response for next commands.

---

#### 2.2 Test GET /api/schedulers (List All)
```bash
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
  {
    "id": 2,
    "taskName": "daily-summary",
    "cronExpression": "0 0 0 * * *",
    "fixedRateMs": null,
    "enabled": true,
    "description": "Logs daily appointment summary statistics",
    "executionCount": 0,
    "lastExecuted": null
  },
  {
    "id": 3,
    "taskName": "update-queue-wait-time",
    "cronExpression": null,
    "fixedRateMs": 300000,
    "enabled": true,
    "description": "Updates estimated wait times for all queue entries",
    "executionCount": 0,
    "lastExecuted": null
  }
]
```

✅ **PASS:** Array of 3 schedulers returned
❌ **FAIL:** Empty array, 401 error, or 403 error

---

#### 2.3 Test GET /api/schedulers/{taskName} (Get Specific)
```bash
curl http://localhost:8080/api/schedulers/mark-no-shows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": 1,
  "taskName": "mark-no-shows",
  "cronExpression": "0 0 * * * *",
  "fixedRateMs": null,
  "enabled": true,
  "description": "Marks appointments as NO_SHOW...",
  "executionCount": 0,
  "lastExecuted": null
}
```

✅ **PASS:** Single scheduler object returned
❌ **FAIL:** 404 Not Found

---

#### 2.4 Test POST /api/schedulers/{taskName}/disable (Disable)
```bash
curl -X POST http://localhost:8080/api/schedulers/mark-no-shows/disable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```
Scheduler mark-no-shows disabled
```

**Verify in Database:**
```sql
SELECT task_name, enabled FROM scheduler_config WHERE task_name = 'mark-no-shows';
```

**Expected:** `enabled = false`

✅ **PASS:** ption textarea (pre-filled)
- Cron Expression input (pre-filled with "0 0 * * * *")
- Fixed Rate input (empty)
- Enabled checkbox (checked)
- Cancel and Save Changes buttons

✅ **PASS:** Modal opens with pre-filled data
❌ **FAIL:** Modal doesn't open or fields are empty

---

#### 4.2 Update Configuration
/Disabled)
- Description
- Schedule information (Cron or Fixed Rate)
- Execution count
- Last executed timestamp
- Buttons: Disable/Enable, Status, Refresh, Edit

✅ **PASS:** All 3 cards visible with complete information
❌ **FAIL:** Empty cards or missing details

---

### Test 4: Edit Scheduler Configuration

#### 4.1 Open Edit Modal
1. Click **"Edit"** button on the "mark-no-shows" card
2. Modal should appear with current configuration

**Expected Modal Content:**
- Title: "Edit Scheduler: mark-no-shows"
- Descriould see 3 detailed scheduler cards:

**Each card should show:**
- Task name (e.g., "mark-no-shows")
- Status badge (Enabled │
│ Schedulers     │  │                │  │                │  │ Executions     │
│                │  │                │  │                │  │                │
│      3         │  │      3         │  │      0         │  │      0         │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
```

✅ **PASS:** All 4 cards visible with correct counts
❌ **FAIL:** Cards missing or showing 0 for Total Schedulers

---

#### 3.3 Verify Scheduler Cards
Below the summary cards, you sh───┐  ┌────────────────┐  ┌────────────────┐
│ Total          │  │ Active         │  │ Disabled       │  │ Total          remain

---

## Frontend UI Testing

### Test 3: Access Scheduler Management Page

#### 3.1 Navigate to Schedulers
1. Login as admin at http://localhost:3000/login
2. Look at the left sidebar
3. Find and click **"Schedulers"** link (should be visible for ADMIN only)

**Expected:** Redirects to `/admin/schedulers`

✅ **PASS:** Page loads
❌ **FAIL:** Link not visible or 404 error

---

#### 3.2 Verify Summary Cards
At the top of the page, you should see 4 summary cards:

```
┌────────────────┐  ┌─────────────er_config WHERE id = 1;
```

✅ **PASS:** Configuration updated
❌ **FAIL:** Old values2 * * *",
    "fixedRateMs": null,
    "enabled": true,
    "description": "Updated: Marks appointments as NO_SHOW (every 2 hours)"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "taskName": "mark-no-shows",
  "cronExpression": "0 0 */2 * * *",
  "fixedRateMs": null,
  "enabled": true,
  "description": "Updated: Marks appointments as NO_SHOW (every 2 hours)",
  "executionCount": 0,
  "lastExecuted": null
}
```

**Verify in Database:**
```sql
SELECT cron_expression, description FROM schedullication/json" \
  -d '{
    "cronExpression": "0 0 */eck Status)
```bash
curl http://localhost:8080/api/schedulers/mark-no-shows/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```
Task: mark-no-shows, Enabled: true, Running: false, Executions: 0, Last: null
```

✅ **PASS:** Status string returned
❌ **FAIL:** 404 or error

---

#### 2.7 Test PUT /api/schedulers/{id} (Update Configuration)
```bash
curl -X PUT http://localhost:8080/api/schedulers/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: app Still disabled or error

---

#### 2.6 Test GET /api/schedulers/{taskName}/status (ChScheduler disabled
❌ **FAIL:** Still enabled or error

---

#### 2.5 Test POST /api/schedulers/{taskName}/enable (Enable)
```bash
curl -X POST http://localhost:8080/api/schedulers/mark-no-shows/enable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```
Scheduler mark-no-shows enabled
```

**Verify in Database:**
```sql
SELECT task_name, enabled FROM scheduler_config WHERE task_name = 'mark-no-shows';
```

**Expected:** `enabled = true`

✅ **PASS:** Scheduler enabled
❌ **FAIL:**