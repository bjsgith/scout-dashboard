import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All data below is FAKE demo data, committed so a fresh clone shows a working UI.
// The user's real data lives only in their local, gitignored DB.

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  // Reset (idempotent re-seed). Order respects FK constraints.
  await prisma.interaction.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  // Single-row settings.
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { applicationStaleDays: 7, contactStaleDays: 30 },
    create: { id: 1, applicationStaleDays: 7, contactStaleDays: 30 },
  });

  // --- Companies ---
  const acme = await prisma.company.create({
    data: {
      name: "Acme Analytics",
      website: "https://acme.example.com",
      industry: "Data & Analytics",
      location: "Austin, TX",
      notes: "Series B startup. Met a recruiter at a meetup.",
    },
  });

  const globex = await prisma.company.create({
    data: {
      name: "Globex Corporation",
      website: "https://globex.example.com",
      industry: "Enterprise Software",
      location: "Seattle, WA",
      notes: "Large org, multiple open roles.",
    },
  });

  const initech = await prisma.company.create({
    data: {
      name: "Initech",
      website: "https://initech.example.com",
      industry: "Fintech",
      location: "Remote",
      notes: "Fully distributed team.",
    },
  });

  // --- Contacts ---
  const dana = await prisma.contact.create({
    data: {
      name: "Dana Reyes",
      title: "Engineering Manager",
      companyId: acme.id,
      email: "dana.reyes@acme.example.com",
      linkedinUrl: "https://example.com/in/dana-reyes",
      notes: "Warm intro via a former coworker.",
    },
  });

  const sam = await prisma.contact.create({
    data: {
      name: "Sam Patel",
      title: "Technical Recruiter",
      companyId: globex.id,
      email: "sam.patel@globex.example.com",
      phone: "555-0142",
      notes: "Responsive over LinkedIn.",
    },
  });

  const jordan = await prisma.contact.create({
    data: {
      name: "Jordan Lee",
      title: "Senior Engineer",
      companyId: initech.id,
      linkedinUrl: "https://example.com/in/jordan-lee",
      notes: "Potential referral for the backend role.",
    },
  });

  // --- Applications ---
  const app1 = await prisma.application.create({
    data: {
      jobTitle: "Senior Full-Stack Engineer",
      companyId: acme.id,
      status: "Interviewing",
      reachedInterview: true,
      dateApplied: daysAgo(18),
      platform: "Company website",
      employmentType: "FullTime",
      city: "Austin",
      state: "TX",
      workMode: "Hybrid",
      pay: "$160k–$185k",
      jobUrl: "https://acme.example.com/careers/senior-fullstack",
      notes: "Phone screen done; onsite scheduled.",
      followUpDate: daysAgo(-3),
      lastActivityAt: daysAgo(2),
      contacts: { connect: [{ id: dana.id }] },
    },
  });

  await prisma.application.create({
    data: {
      jobTitle: "Backend Engineer",
      companyId: globex.id,
      status: "Active",
      dateApplied: daysAgo(12),
      platform: "LinkedIn",
      employmentType: "FullTime",
      city: "Seattle",
      state: "WA",
      workMode: "Remote",
      pay: "$150k–$170k",
      jobUrl: "https://globex.example.com/jobs/backend",
      notes: "Applied through recruiter referral.",
      lastActivityAt: daysAgo(12),
      contacts: { connect: [{ id: sam.id }] },
    },
  });

  await prisma.application.create({
    data: {
      jobTitle: "Platform Engineer",
      companyId: initech.id,
      status: "Active",
      dateApplied: daysAgo(2),
      platform: "Hacker News",
      employmentType: "Contract",
      workMode: "Remote",
      pay: "$95/hr",
      jobUrl: "https://initech.example.com/careers/platform",
      notes: "Interesting infra role; applied through their careers page.",
      lastActivityAt: daysAgo(1),
      contacts: { connect: [{ id: jordan.id }] },
    },
  });

  await prisma.application.create({
    data: {
      jobTitle: "Frontend Engineer",
      companyId: globex.id,
      status: "Rejected",
      reachedInterview: true,
      dateApplied: daysAgo(40),
      platform: "Indeed",
      employmentType: "FullTime",
      city: "Seattle",
      state: "WA",
      workMode: "InPerson",
      pay: "$140k",
      notes: "Two interview rounds, then passed on.",
      lastActivityAt: daysAgo(25),
    },
  });

  // --- Interactions (drive "last spoken") ---
  await prisma.interaction.createMany({
    data: [
      {
        contactId: dana.id,
        date: daysAgo(2),
        type: "Meeting",
        notes: "Prep call before onsite.",
      },
      {
        contactId: dana.id,
        date: daysAgo(20),
        type: "Coffee",
        notes: "Intro chat about the team.",
      },
      {
        contactId: sam.id,
        date: daysAgo(12),
        type: "Email",
        notes: "Sent resume; confirmed application received.",
      },
      {
        contactId: jordan.id,
        date: daysAgo(45),
        type: "LinkedIn",
        notes: "Reached out about the platform role — overdue for follow-up.",
      },
    ],
  });

  // Link a contact to a second application (many-to-many demo).
  await prisma.application.update({
    where: { id: app1.id },
    data: { contacts: { connect: [{ id: sam.id }] } },
  });

  console.log("Seed complete: 3 companies, 4 applications, 3 contacts, 4 interactions.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
