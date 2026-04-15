# School Management MVP Plan

This plan is ordered by implementation priority so the app becomes usable as early as possible.

## Phase 1: Foundation (Must Have)

Goal: login, role separation, and base academic structure.

### Data Models
- `User` (admin, teacher, guardian, student-role account)
- `Class`
- `Section` (new)
- `Subject`
- `AcademicSession` (new)
- `Enrollment` (new: student + class + section + session)

### Core Features
- Auth (login/logout) with role-based access
- Admin can create class/section/subject/session
- Student admission + enrollment to class/section/session

### API/Pages
- `/api/auth/*`
- `/api/users`
- `/api/classes`, `/api/sections`, `/api/subjects`
- `/api/students`, `/api/enrollments`
- Admin dashboard + student list + enrollment UI

## Phase 2: Daily Operations

Goal: run day-to-day school workflow.

### Data Models
- `Attendance` (already added)
- `Timetable` (new: class + section + subject + teacher + period)
- `Notice` (new)

### Core Features
- Daily attendance entry
- Class routine management
- Notice publish for students/guardians/teachers

### API/Pages
- `/api/attendance`
- `/api/timetables`
- `/api/notices`
- Teacher attendance panel
- Routine view by class/section

## Phase 3: Exams and Results

Goal: academic evaluation workflow.

### Data Models
- `Exam` (already added)
- `ExamSchedule` (new: exam + subject + date/time)
- `Result` (already added, extend with GPA fields)
- Optional: `MarkDistribution` (CQ/MCQ/Practical)

### Core Features
- Exam setup
- Marks entry by teacher
- Result publish + grade/GPA generation

### API/Pages
- `/api/exams`, `/api/exam-schedules`
- `/api/results`
- Marks entry screen
- Result card/report page

## Phase 4: Fees and Payments

Goal: make billing usable.

### Data Models
- `Fee` (already added)
- `FeeStructure` (new)
- `Invoice` (new)
- `Payment` (new)

### Core Features
- Monthly/term fee generation
- Due tracking
- Payment entry + receipt

### API/Pages
- `/api/fees`, `/api/fee-structures`
- `/api/invoices`, `/api/payments`
- Admin billing dashboard
- Guardian payment history

## Phase 5: Production Readiness

Goal: reliability and scale.

### Additions
- Audit log (`createdBy`, `updatedBy`, action logs)
- Soft delete where needed
- Validation layer (zod or equivalent)
- Permission guards on every API
- Basic analytics dashboard
- Backup/export (CSV/PDF)

## Suggested Build Order (Short)

1. Auth + Role + Student Enrollment
2. Attendance + Timetable
3. Exam + Result publish
4. Fee + Invoice + Payment
5. Audit + reports + hardening

## Your Current Status

Already done:
- `Student`, `Teacher`, `Class`, `Subject`
- `Attendance`, `Exam`, `Fee`, `Result`, `User`

Next best step:
1. Add `Section`
2. Add `AcademicSession`
3. Add `Enrollment`
4. Build student admission + enrollment APIs
