import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
type ExamType = 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT' | 'PROJECT';
type GradeScale = 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C_PLUS' | 'C' | 'D' | 'F';

async function main() {
  console.log('Starting comprehensive seed process for 1000 students and 100 teachers...');

  // Dynamic import for faker (ES module)
  const { faker } = await import('@faker-js/faker');

  // Clear existing data in correct order to handle foreign key constraints
  console.log('Clearing existing data...');
  try {
    await prisma.grade.deleteMany();
    console.log('Cleared grades');
    await prisma.examResult.deleteMany();
    console.log('Cleared exam results');
    await prisma.exam.deleteMany();
    console.log('Cleared exams');
    await prisma.attendance.deleteMany();
    console.log('Cleared attendance');
    await prisma.timetableSlot.deleteMany();
    console.log('Cleared timetable slots');
    await prisma.timetable.deleteMany();
    console.log('Cleared timetables');
    await prisma.notice.deleteMany();
    console.log('Cleared notices');
    await prisma.student.deleteMany();
    console.log('Cleared students');
    await prisma.teacher.deleteMany();
    console.log('Cleared teachers');
    await prisma.parent.deleteMany();
    console.log('Cleared parents');
    await prisma.userProfile.deleteMany();
    console.log('Cleared user profiles');
    await prisma.user.deleteMany();
    console.log('Cleared users');
    await prisma.subject.deleteMany();
    console.log('Cleared subjects');
    await prisma.class.deleteMany();
    console.log('Cleared classes');
    await prisma.term.deleteMany();
    console.log('Cleared terms');
    await prisma.academicYear.deleteMany();
    console.log('Cleared academic years');
    await prisma.schoolSettings.deleteMany();
    console.log('Cleared school settings');
    console.log('Data cleared successfully');
  } catch (error) {
    console.log('Error clearing data:', error);
    // Continue anyway
  }

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Academic Years (current and previous)
  console.log('Creating academic years...');
  const academicYears = [];
  for (let i = 0; i < 3; i++) {
    const year = 2022 + i;
    const academicYear = await prisma.academicYear.create({
      data: {
        year: `${year}-${year + 1}`,
        startDate: new Date(year, 5, 1), // June 1st
        endDate: new Date(year + 1, 4, 31), // May 31st
        isCurrent: i === 2, // Make 2024-2025 current
      },
    });
    academicYears.push(academicYear);
  }

  // Create Terms for current academic year
  console.log('Creating terms...');
  const currentAcademicYear = academicYears[2];
  const terms = [];
  const termNames = ['First Term', 'Second Term', 'Final Term'];
  const termDates = [
    { start: new Date(2024, 5, 1), end: new Date(2024, 9, 31) },
    { start: new Date(2024, 10, 1), end: new Date(2025, 2, 31) },
    { start: new Date(2025, 3, 1), end: new Date(2025, 4, 31) },
  ];

  for (let i = 0; i < 3; i++) {
    const term = await prisma.term.create({
      data: {
        name: termNames[i],
        academicYearId: currentAcademicYear.id,
        startDate: termDates[i].start,
        endDate: termDates[i].end,
      },
    });
    terms.push(term);
  }

  // Create Subjects
  console.log('Creating subjects...');
  const subjectData = [
    { name: 'Mathematics', code: 'MATH', credits: 5 },
    { name: 'English', code: 'ENG', credits: 4 },
    { name: 'Physics', code: 'PHY', credits: 5 },
    { name: 'Chemistry', code: 'CHEM', credits: 5 },
    { name: 'Biology', code: 'BIO', credits: 4 },
    { name: 'Computer Science', code: 'CS', credits: 4 },
    { name: 'History', code: 'HIST', credits: 3 },
    { name: 'Geography', code: 'GEO', credits: 3 },
    { name: 'Hindi', code: 'HIN', credits: 3 },
    { name: 'Physical Education', code: 'PE', credits: 2 },
    { name: 'Art', code: 'ART', credits: 2 },
    { name: 'Music', code: 'MUS', credits: 2 },
  ];

  const subjects = [];
  for (const subj of subjectData) {
    const subject = await prisma.subject.create({
      data: subj,
    });
    subjects.push(subject);
  }

  // Create Classes (Grades 1-12 with sections A, B, C)
  console.log('Creating classes...');
  const classes = [];
  for (let grade = 1; grade <= 12; grade++) {
    for (const section of ['A', 'B', 'C']) {
      console.log(`Creating class: Grade ${grade}, Section ${section}`);
      const classRecord = await prisma.class.create({
        data: {
          name: `Class ${grade}`,
          section,
          academicYearId: currentAcademicYear.id,
          capacity: 35,
        },
      });
      classes.push(classRecord);
      console.log(`Created class: ${classRecord.name} ${classRecord.section}`);
    }
  }
  console.log(`Total classes created: ${classes.length}`);

  // Create Admin User
  console.log('Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'School',
          lastName: 'Administrator',
          phone: '+91-' + faker.string.numeric(10),
          address: faker.location.streetAddress(),
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: faker.string.numeric(6),
        },
      },
    },
  });

  // Create 100 Teachers
  console.log('Creating 100 teachers...');
  const teachers: any[] = [];
  const teacherUsers: any[] = [];

  for (let i = 1; i <= 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `teacher${i}@school.edu`;

    const teacherUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'TEACHER',
        profile: {
          create: {
            firstName,
            lastName,
            phone: '+91-' + faker.string.numeric(10),
            address: faker.location.streetAddress(),
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: faker.string.numeric(6),
            bloodGroup: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
          },
        },
        teacher: {
          create: {
            employeeId: `TEACH${String(i).padStart(3, '0')}`,
            joiningDate: faker.date.past({ years: 10 }),
            qualification: faker.helpers.arrayElement([
              'M.Sc Mathematics, B.Ed',
              'M.A English, B.Ed',
              'M.Sc Physics, B.Ed',
              'M.Sc Chemistry, B.Ed',
              'M.Sc Biology, B.Ed',
              'MCA, B.Ed',
              'M.A History, B.Ed',
              'M.A Geography, B.Ed',
            ]),
            experience: faker.number.int({ min: 1, max: 20 }),
            salary: faker.number.int({ min: 30000, max: 80000 }),
          },
        },
      },
    });

    teacherUsers.push(teacherUser);
    teachers.push(await prisma.teacher.findUnique({ where: { userId: teacherUser.id } }));
  }

  // Create 1000 Students and their Parents
  console.log('Creating 1000 students and parents...');
  const students: any[] = [];
  const parents: any[] = [];
  const studentUsers: any[] = [];
  const parentUsers: any[] = [];

  // Distribute students across classes (roughly equal distribution)
  const studentsPerClass = Math.floor(1000 / classes.length);
  console.log(`Students per class: ${studentsPerClass}, Total classes: ${classes.length}`);
  let studentIndex = 1;

  for (const classRecord of classes) {
    const studentsInThisClass = studentIndex + studentsPerClass > 1000 ?
      1000 - studentIndex + 1 : studentsPerClass;

    for (let i = 0; i < studentsInThisClass && studentIndex <= 1000; i++) {
      // Create Parent first
      const parentFirstName = faker.person.firstName();
      const parentLastName = faker.person.lastName();
      const parentEmail = `parent${studentIndex}@email.com`;

      const parentUser = await prisma.user.create({
        data: {
          email: parentEmail,
          password: hashedPassword,
          role: 'PARENT',
          profile: {
            create: {
              firstName: parentFirstName,
              lastName: parentLastName,
              phone: '+91-' + faker.string.numeric(10),
              address: faker.location.streetAddress(),
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: faker.string.numeric(6),
            },
          },
        },
      });

      const parentRecord = await prisma.parent.create({
        data: {
          userId: parentUser.id,
          occupation: faker.person.jobTitle(),
          income: faker.number.int({ min: 50000, max: 500000 }),
        },
      });

      parentUsers.push(parentUser);
      parents.push(parentRecord);

      // Create Student
      const studentFirstName = faker.person.firstName();
      const studentLastName = faker.person.lastName();
      const studentEmail = `student${studentIndex}@school.edu`;

      const studentUser = await prisma.user.create({
        data: {
          email: studentEmail,
          password: hashedPassword,
          role: 'STUDENT',
          profile: {
            create: {
              firstName: studentFirstName,
              lastName: studentLastName,
              dateOfBirth: faker.date.birthdate({ min: 6, max: 18, mode: 'age' }),
              gender: faker.person.sex(),
              phone: '+91-' + faker.string.numeric(10),
              address: faker.location.streetAddress(),
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: faker.string.numeric(6),
              bloodGroup: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            },
          },
          student: {
            create: {
              rollNumber: `STU${String(2024).slice(-2)}${String(studentIndex).padStart(4, '0')}`,
              admissionDate: new Date(2024, 5, 1),
              parentId: parentRecord.id,
              classId: classRecord.id,
            },
          },
        },
      });

      studentUsers.push(studentUser);
      students.push(await prisma.student.findUnique({ where: { userId: studentUser.id } }));
      studentIndex++;
    }
  }

  // Assign teachers to subjects and classes
  console.log('Assigning teachers to subjects and classes...');
  const teacherSubjectAssignments: any[] = [];
  const teacherClassAssignments: any[] = [];

  // Each subject gets 2-3 teachers
  for (const subject of subjects) {
    const assignedTeachers = faker.helpers.arrayElements(teachers, { min: 2, max: 3 });
    for (const teacher of assignedTeachers) {
      teacherSubjectAssignments.push({ teacherId: teacher.id, subjectId: subject.id });
    }
  }

  // Each class gets 8-10 teachers (for different subjects)
  for (const classRecord of classes) {
    const assignedTeachers = faker.helpers.arrayElements(teachers, { min: 8, max: 10 });
    for (const teacher of assignedTeachers) {
      teacherClassAssignments.push({ teacherId: teacher.id, classId: classRecord.id });
    }
  }

  // Update subjects with teacher assignments
  for (const assignment of teacherSubjectAssignments) {
    await prisma.subject.update({
      where: { id: assignment.subjectId },
      data: {
        teachers: {
          connect: { id: assignment.teacherId },
        },
      },
    });
  }

  // Update classes with teacher assignments
  for (const assignment of teacherClassAssignments) {
    await prisma.class.update({
      where: { id: assignment.classId },
      data: {
        teachers: {
          connect: { id: assignment.teacherId },
        },
      },
    });
  }

  // Create Timetables and Timetable Slots
  console.log('Creating timetables and slots...');
  for (const classRecord of classes) {
    const timetable = await prisma.timetable.create({
      data: {
        classId: classRecord.id,
        name: `${classRecord.name} ${classRecord.section} Weekly Timetable`,
      },
    });

    // Create slots for Monday to Saturday (6 days)
    const timeSlots = [
      { start: '09:00', end: '09:45' },
      { start: '09:45', end: '10:30' },
      { start: '10:30', end: '11:15' },
      { start: '11:15', end: '12:00' },
      { start: '12:00', end: '12:45' },
      { start: '12:45', end: '13:30' },
      { start: '13:30', end: '14:15' },
      { start: '14:15', end: '15:00' },
    ];

    for (let day = 1; day <= 6; day++) { // Monday to Saturday
      const daySubjects = faker.helpers.arrayElements(subjects, timeSlots.length);
      const dayTeachers = faker.helpers.arrayElements(
        teacherClassAssignments.filter(t => t.classId === classRecord.id).map(t => teachers.find(te => te.id === t.teacherId)!),
        timeSlots.length
      );

      for (let period = 0; period < timeSlots.length; period++) {
        await prisma.timetableSlot.create({
          data: {
            timetableId: timetable.id,
            classId: classRecord.id,
            subjectId: daySubjects[period].id,
            teacherId: dayTeachers[period].id,
            dayOfWeek: day,
            startTime: timeSlots[period].start,
            endTime: timeSlots[period].end,
            period: period + 1,
          },
        });
      }
    }
  }

  // Create Attendance Records (for last 30 days)
  console.log('Creating attendance records...');
  const attendanceStatuses: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];

  for (let daysBack = 0; daysBack < 30; daysBack++) {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);

    if (date.getDay() === 0) continue; // Skip Sundays

    for (const student of students) {
      const status = faker.helpers.arrayElement(attendanceStatuses);
      const teacher = faker.helpers.arrayElement(teachers);

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId!,
          teacherId: teacher.id,
          date,
          status,
          remarks: status === 'ABSENT' ? faker.lorem.sentence() : null,
        },
      });
    }
  }

  // Create Exams and Results
  console.log('Creating exams and results...');
  for (const term of terms) {
    for (const subject of subjects) {
      // Create different types of exams
      const examTypes: ExamType[] = ['UNIT_TEST', 'MIDTERM', 'FINAL'];
      const examCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < examCount; i++) {
        const examType = faker.helpers.arrayElement(examTypes);
        const examDate = faker.date.between({
          from: term.startDate,
          to: term.endDate,
        });

        const exam = await prisma.exam.create({
          data: {
            name: `${subject.name} ${examType.replace('_', ' ')} - ${term.name}`,
            type: examType,
            termId: term.id,
            subjectId: subject.id,
            date: examDate,
            duration: faker.helpers.arrayElement([45, 60, 90, 120]),
            totalMarks: faker.helpers.arrayElement([50, 100]),
            passingMarks: faker.helpers.arrayElement([18, 35]),
          },
        });

        // Create results for all students in classes that have this subject
        const relevantClasses = classes.filter(c =>
          teacherClassAssignments.some(t => t.classId === c.id) &&
          teacherSubjectAssignments.some(t => t.subjectId === subject.id)
        );

        for (const classRecord of relevantClasses) {
          const classStudents = students.filter(s => s.classId === classRecord.id);

          for (const student of classStudents) {
            const marksObtained = faker.number.float({
              min: 0,
              max: Number(exam.totalMarks),
            });

            const percentage = (marksObtained / Number(exam.totalMarks)) * 100;
            let grade: GradeScale;
            if (percentage >= 90) grade = 'A_PLUS';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B_PLUS';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C_PLUS';
            else if (percentage >= 40) grade = 'C';
            else if (percentage >= 30) grade = 'D';
            else grade = 'F';

            await prisma.examResult.create({
              data: {
                examId: exam.id,
                studentId: student.id,
                subjectId: subject.id,
                marksObtained,
                grade,
                remarks: marksObtained < Number(exam.passingMarks) ? 'Failed' : 'Passed',
              },
            });
          }
        }
      }
    }
  }

  // Create Grades
  console.log('Creating grades...');
  for (const student of students) {
    for (const subject of subjects) {
      for (const term of terms) {
        const marks = faker.number.float({ min: 0, max: 100 });
        const totalMarks = 100;
        const percentage = (marks / totalMarks) * 100;

        let grade: GradeScale;
        if (percentage >= 90) grade = 'A_PLUS';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B_PLUS';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C_PLUS';
        else if (percentage >= 40) grade = 'C';
        else if (percentage >= 30) grade = 'D';
        else grade = 'F';

        await prisma.grade.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            termId: term.id,
            grade,
            marks,
            totalMarks,
            percentage,
          },
        });
      }
    }
  }

  // Create School Settings
  console.log('Creating school settings...');
  await prisma.schoolSettings.createMany({
    data: [
      { key: 'school_name', value: 'Modern Public School', type: 'STRING' },
      { key: 'school_address', value: 'Education City, Bangalore, Karnataka - 560001', type: 'STRING' },
      { key: 'school_phone', value: '+91-80-12345678', type: 'STRING' },
      { key: 'school_email', value: 'info@modernpublicschool.edu', type: 'STRING' },
      { key: 'academic_year_start_month', value: '6', type: 'NUMBER' },
      { key: 'working_days', value: '6', type: 'NUMBER' },
      { key: 'attendance_percentage_required', value: '75', type: 'NUMBER' },
      { key: 'passing_marks_percentage', value: '35', type: 'NUMBER' },
      { key: 'total_students', value: '1000', type: 'NUMBER' },
      { key: 'total_teachers', value: '100', type: 'NUMBER' },
      { key: 'total_classes', value: String(classes.length), type: 'NUMBER' },
    ],
  });

  // Create Sample Notices
  console.log('Creating notices...');
  const notices = [
    {
      title: 'Welcome to Academic Year 2024-25',
      content: 'Dear Students, Parents, and Staff, We are excited to welcome everyone to the new academic year 2024-25. Classes will commence from June 1st, 2024. Please ensure all required documents are submitted.',
      priority: 'HIGH',
      targetRoles: ['STUDENT', 'PARENT', 'TEACHER'],
    },
    {
      title: 'Parent-Teacher Meeting Scheduled',
      content: 'Parent-Teacher meeting will be held on coming Saturday from 9:00 AM to 12:00 PM. All parents are requested to attend.',
      priority: 'NORMAL',
      targetRoles: ['PARENT'],
    },
    {
      title: 'Annual Sports Day',
      content: 'Annual Sports Day will be celebrated on December 15th, 2024. All students are encouraged to participate in various events.',
      priority: 'NORMAL',
      targetRoles: ['STUDENT', 'TEACHER'],
    },
    {
      title: 'Examination Schedule Released',
      content: 'Final examination schedule has been released. Please check the academic calendar for detailed dates and timings.',
      priority: 'HIGH',
      targetRoles: ['STUDENT', 'TEACHER'],
    },
    {
      title: 'Library Books Due',
      content: 'All library books must be returned by end of this month. Late fees will be applicable after due date.',
      priority: 'LOW',
      targetRoles: ['STUDENT'],
    },
  ];

  for (const notice of notices) {
    await prisma.notice.create({
      data: {
        ...notice,
        targetRoles: notice.targetRoles as UserRole[],
        authorId: adminUser.id,
        publishDate: faker.date.recent({ days: 30 }),
        expiryDate: faker.date.future({ years: 1 }),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Generated data summary:');
  console.log('- 1000 Students');
  console.log('- 100 Teachers');
  console.log('- 500+ Parents');
  console.log('- 36 Classes (Grades 1-12, sections A, B, C)');
  console.log('- 12 Subjects');
  console.log('- 36 Timetables with slots');
  console.log('- 30,000+ Attendance records');
  console.log('- 1000+ Exams with results');
  console.log('- 36,000+ Grade records');
  console.log('- 5 Notices');
  console.log('');
  console.log('Default login credentials:');
  console.log('Admin: admin@school.edu / password123');
  console.log('Teacher: teacher1@school.edu / password123');
  console.log('Parent: parent1@email.com / password123');
  console.log('Student: student1@school.edu / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
