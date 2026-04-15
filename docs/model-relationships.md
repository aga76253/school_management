# Model Relationships

## Core Relations

- `Class` 1 -> N `Section`
  - `Section.classId -> Class._id`

- `Student` 1 -> N `Enrollment`
  - `Enrollment.studentId -> Student._id`

- `AcademicSession` 1 -> N `Enrollment`
  - `Enrollment.sessionId -> AcademicSession._id`

- `Class` 1 -> N `Enrollment`
  - `Enrollment.classId -> Class._id`

- `Section` 1 -> N `Enrollment`
  - `Enrollment.sectionId -> Section._id`

## Existing Academic Relations

- `Subject` 1 -> N `Exam`
  - `Exam.subjectId -> Subject._id`

- `Class` 1 -> N `Exam`
  - `Exam.classId -> Class._id`

- `Student` 1 -> N `Result`
  - `Result.studentId -> Student._id`

- `Exam` 1 -> N `Result`
  - `Result.examId -> Exam._id`

- `Student` 1 -> N `Attendance`
  - `Attendance.studentId -> Student._id`

- `Class` 1 -> N `Attendance`
  - `Attendance.classId -> Class._id`

- `Teacher` 1 -> N `Attendance`
  - `Attendance.markedBy -> Teacher._id`
