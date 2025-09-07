import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

async function main() {
  console.log('Starting seed process...');

  // Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      year: '2024-2025',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
    },
  });

  // Create Terms
  const term1 = await prisma.term.create({
    data: {
      name: 'First Term',
      academicYearId: academicYear.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-10-31'),
    },
  });

  const term2 = await prisma.term.create({
    data: {
      name: 'Second Term',
      academicYearId: academicYear.id,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-03-31'),
    },
  });

  const term3 = await prisma.term.create({
    data: {
      name: 'Final Term',
      academicYearId: academicYear.id,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-05-31'),
    },
  });

  // Create Subjects
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Mathematics', code: 'MATH101', credits: 5 },
      { name: 'English', code: 'ENG101', credits: 4 },
      { name: 'Science', code: 'SCI101', credits: 5 },
      { name: 'Social Studies', code: 'SOC101', credits: 4 },
      { name: 'Hindi', code: 'HIN101', credits: 3 },
      { name: 'Computer Science', code: 'CS101', credits: 4 },
      { name: 'Physical Education', code: 'PE101', credits: 2 },
    ],
  });

  // Create Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Class 10',
      section: 'A',
      academicYearId: academicYear.id,
      capacity: 40,
    },
  });

  const class10B = await prisma.class.create({
    data: {
      name: 'Class 10',
      section: 'B',
      academicYearId: academicYear.id,
      capacity: 40,
    },
  });

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu',
      password: hashedPassword,
      role: 'ADMIN' as UserRole,
      profile: {
        create: {
          firstName: 'School',
          lastName: 'Administrator',
          phone: '+91-9876543210',
          address: 'School Campus, Education City',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
      },
    },
  });

  // Create Teacher Users
  const teacher1User = await prisma.user.create({
    data: {
      email: 'teacher1@school.edu',
      password: hashedPassword,
      role: 'TEACHER' as UserRole,
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Sharma',
          phone: '+91-9876543211',
          address: 'Teacher Colony, Block A',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560002',
        },
      },
      teacher: {
        create: {
          employeeId: 'TEACH001',
          joiningDate: new Date('2020-06-01'),
          qualification: 'M.Sc Mathematics, B.Ed',
          experience: 8,
          salary: 45000,
        },
      },
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'teacher2@school.edu',
      password: hashedPassword,
      role: 'TEACHER' as UserRole,
      profile: {
        create: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          phone: '+91-9876543212',
          address: 'Teacher Colony, Block B',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560002',
        },
      },
      teacher: {
        create: {
          employeeId: 'TEACH002',
          joiningDate: new Date('2019-06-01'),
          qualification: 'M.A English, B.Ed',
          experience: 10,
          salary: 48000,
        },
      },
    },
  });

  // Create Parent User
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent1@email.com',
      password: hashedPassword,
      role: 'PARENT' as UserRole,
      profile: {
        create: {
          firstName: 'Ramesh',
          lastName: 'Patel',
          phone: '+91-9876543213',
          address: 'Residential Area, Sector 5',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560003',
        },
      },
    },
  });

  // Create Parent record separately
  const parentRecord = await prisma.parent.create({
    data: {
      userId: parentUser.id,
      occupation: 'Software Engineer',
      income: 120000,
    },
  });

  // Create Student Users
  const student1User = await prisma.user.create({
    data: {
      email: 'student1@school.edu',
      password: hashedPassword,
      role: 'STUDENT' as UserRole,
      profile: {
        create: {
          firstName: 'Ananya',
          lastName: 'Patel',
          dateOfBirth: new Date('2009-03-15'),
          gender: 'Female',
          phone: '+91-9876543214',
          address: 'Residential Area, Sector 5',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560003',
          bloodGroup: 'A+',
        },
      },
      student: {
        create: {
          rollNumber: 'STU2024001',
          admissionDate: new Date('2024-06-01'),
          parentId: parentRecord.id,
          classId: class10A.id,
        },
      },
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student2@school.edu',
      password: hashedPassword,
      role: 'STUDENT' as UserRole,
      profile: {
        create: {
          firstName: 'Arjun',
          lastName: 'Singh',
          dateOfBirth: new Date('2009-07-22'),
          gender: 'Male',
          phone: '+91-9876543215',
          address: 'Park View Apartments, Lane 3',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560004',
          bloodGroup: 'B+',
        },
      },
      student: {
        create: {
          rollNumber: 'STU2024002',
          admissionDate: new Date('2024-06-01'),
          classId: class10A.id,
        },
      },
    },
  });

  // Create School Settings
  await prisma.schoolSettings.createMany({
    data: [
      { key: 'school_name', value: 'Modern Public School', type: 'STRING' },
      { key: 'school_address', value: 'Education City, Bangalore, Karnataka', type: 'STRING' },
      { key: 'school_phone', value: '+91-80-12345678', type: 'STRING' },
      { key: 'school_email', value: 'info@modernpublicschool.edu', type: 'STRING' },
      { key: 'academic_year_start_month', value: '6', type: 'NUMBER' },
      { key: 'working_days', value: '6', type: 'NUMBER' },
      { key: 'attendance_percentage_required', value: '75', type: 'NUMBER' },
      { key: 'passing_marks_percentage', value: '35', type: 'NUMBER' },
    ],
  });

  // Create Sample Notice
  await prisma.notice.create({
    data: {
      title: 'Welcome to Academic Year 2024-25',
      content: 'Dear Students, Parents, and Staff, We are excited to welcome everyone to the new academic year 2024-25. Classes will commence from June 1st, 2024. Please ensure all required documents are submitted.',
      priority: 'HIGH',
      targetRoles: ['STUDENT' as UserRole, 'PARENT' as UserRole, 'TEACHER' as UserRole],
      authorId: adminUser.id,
      expiryDate: new Date('2024-06-30'),
    },
  });

  console.log('Seed completed successfully!');
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
