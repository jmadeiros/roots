(function (root) {
  'use strict';

  const programs = [
    {
      id: 'b01',
      title: 'FFA placement hours',
      type: 'Volunteer benefit',
      category: 'benefits',
      matchKind: 'benefit',
      priority: 0.1,
      stage: 'local',
      provider: 'California FFA · Supervised Agricultural Experience',
      headlineBenefit: 'Logged farm and garden hours that count toward FFA awards and degrees',
      beneficiary: 'High-school agriculture students',
      summary: 'High-school agriculture students must log supervised agricultural experience. An unpaid placement at a garden or farm counts, so regular shifts here help them meet the requirement.',
      action: 'Ask each student’s agriculture teacher to approve the garden as their placement, then confirm hours for their record book each month.',
      requirements: [
        'At least 10 hours in the first year and 50 hours a year from year two, with at least one journal entry a month (California guidelines).',
        'The student’s FFA advisor approves the placement.',
        'The student logs hours in AET, the FFA online record book; the site confirms them.'
      ],
      steps: [
        'Send the students a short note: their garden shifts can count as placement hours.',
        'Offer a regular slot and a named supervisor, and confirm hours monthly.'
      ],
      sourceUrl: 'https://www.calaged.org/sites/default/files/apb/special-list/CA%20FFA%20SAE%20Guidelines%202025.pdf',
      sources: [
        { label: 'California FFA SAE guidelines 2025', url: 'https://www.calaged.org/sites/default/files/apb/special-list/CA%20FFA%20SAE%20Guidelines%202025.pdf' },
        { label: 'FFA proficiency awards', url: 'https://www.ffa.org/participate/awards/proficiencies/' }
      ],
      sourceCheckedAt: '2026-10-25',
      statusLabel: 'Ongoing · Advisor approval per student',
      benefitTag: 'ffa-sae',
      matchReason: 'Agriculture student who needs placement hours (fictional, recorded with permission).',
      fitFacts: [['Hours needed', '10 in year one, 50 a year after']],
      hostChecks: ['Get the advisor’s approval for each student’s placement.', 'Name a supervisor who can confirm hours monthly.'],
      fitSummary: '{n} agriculture students could log their placement hours here.',
      insight: {
        noun: ['agriculture student', 'agriculture students'],
        could: 'could log FFA placement hours here',
        sms: 'Hi {first_name}, good news: your shifts at the garden can count as FFA placement hours toward your awards and degree. Want us to set it up with your agriculture teacher? Reply STOP to opt out.',
        short: 'students could log FFA hours',
        chip: 'FFA hours',
        meta: '10 to 50 hours a year · advisor-approved',
        gets: 'Garden shifts count as an unpaid placement toward their FFA awards and degrees, so every visit moves them forward.',
        todo: 'Ask their agriculture teacher to approve the garden as a placement, then confirm their hours each month.',
        actionLabel: 'Tell the students'
      },
      interests: []
    },
    {
      id: 'b02',
      title: 'CalFresh work rule',
      type: 'Volunteer benefit',
      category: 'benefits',
      matchKind: 'benefit',
      priority: 0.2,
      stage: 'open',
      provider: 'California Department of Social Services',
      headlineBenefit: 'Volunteer hours that help keep CalFresh food benefits',
      beneficiary: 'CalFresh recipients aged 18–64 without young children',
      summary: 'Since 1 June 2026, adults aged 18–64 who can work and have no child under 14 must do 80 hours a month of work, training or volunteering to keep CalFresh beyond 3 months. Volunteering at a nonprofit counts if the hours can be verified.',
      action: 'Offer regular shifts and sign form CF 888 to confirm each person’s hours.',
      requirements: [
        '80 hours a month, which can combine volunteering, paid work and training.',
        'Volunteering at a nonprofit or public institution counts when the county can verify the hours.',
        'The site signs form CF 888 or a similar letter, or confirms by phone.',
        'Students, pregnant people and some other groups are exempt.'
      ],
      steps: [
        'Let volunteers know their hours here can count, without asking who receives CalFresh.',
        'Keep a simple monthly hours record so the form takes a minute to sign.'
      ],
      sourceUrl: 'https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2026/26-29.pdf',
      sources: [
        { label: 'CDSS All County Letter 26-29', url: 'https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2026/26-29.pdf' },
        { label: 'GetCalFresh: work requirements', url: 'https://www.getcalfresh.org/en/work-requirements/' }
      ],
      sourceCheckedAt: '2026-10-25',
      statusLabel: 'In force since 1 June 2026',
      benefitTag: 'calfresh-hours',
      matchReason: 'Asked whether their hours can count toward CalFresh (fictional, recorded with permission).',
      fitFacts: [['Hours a month', '80, combined with work or training']],
      hostChecks: ['Keep a monthly hours record for each person who asks.', 'Sign form CF 888 when they need it.'],
      fitSummary: '{n} volunteers asked whether their hours here can count toward CalFresh.',
      insight: {
        noun: ['volunteer', 'volunteers'],
        could: 'could count their hours toward keeping CalFresh',
        sms: 'Hi {first_name}, your volunteer hours here can count toward the 80 hours a month for CalFresh, and we can sign the form each month. Want to set up regular shifts? Reply STOP to opt out.',
        short: 'volunteers could keep CalFresh',
        chip: 'CalFresh hours',
        meta: '80 hours a month · in force since 1 June',
        gets: 'Their hours here count toward the 80 hours a month that keeps their CalFresh food benefits.',
        todo: 'Offer regular shifts and sign form CF 888 each month to confirm their hours.',
        actionLabel: 'Tell them their hours count'
      },
      interests: []
    },
    {
      id: 'b03',
      title: 'Community college work-experience credit',
      type: 'Volunteer benefit',
      category: 'benefits',
      matchKind: 'benefit',
      priority: 0.3,
      stage: 'local',
      provider: 'California community colleges · e.g. Peralta work experience',
      headlineBenefit: 'College credit: one unit for every 60 volunteer hours',
      beneficiary: 'Community college students taking at least 7 units',
      summary: 'Community college work-experience courses give credit for supervised volunteer work. Up to 4 units a semester, at 60 unpaid hours per unit.',
      action: 'Agree learning objectives with the college’s work-experience supervisor and keep an hours record.',
      requirements: [
        '60 unpaid hours per unit, up to 4 units a semester and 16 in total.',
        'The student takes at least 7 units that semester, including the course.',
        'The college approves the plan; the site confirms hours and gives an evaluation.'
      ],
      steps: [
        'Tell the students their garden hours can earn credit next semester.',
        'Name a site supervisor and agree two or three learning objectives.'
      ],
      sourceUrl: 'https://www.peralta.edu/hubfs/AP-4103-Work-Experience.pdf',
      sources: [
        { label: 'Peralta work experience procedure (AP 4103)', url: 'https://www.peralta.edu/hubfs/AP-4103-Work-Experience.pdf' },
        { label: 'Merritt College work experience', url: 'https://www.merritt.edu/coped' }
      ],
      sourceCheckedAt: '2026-10-25',
      statusLabel: 'Spring enrolment · College approval',
      benefitTag: 'cc-work-experience',
      matchReason: 'Community college student (fictional, recorded with permission).',
      fitFacts: [['Credit', '1 unit per 60 hours, up to 4 a semester']],
      hostChecks: ['Agree learning objectives with the college.', 'Confirm hours and give an evaluation at the end of term.'],
      fitSummary: '{n} community college students could earn credit for their hours here.',
      insight: {
        noun: ['college student', 'college students'],
        could: 'could earn course credit for their hours here',
        sms: 'Hi {first_name}, your garden hours could earn college credit: 1 unit for every 60 hours. Want us to talk to your college about it? Reply STOP to opt out.',
        short: 'students could earn college credit',
        chip: 'college credit',
        meta: '1 unit per 60 hours · up to 4 a semester',
        gets: 'Up to 4 units of college credit a semester for supervised volunteer work.',
        todo: 'Agree learning objectives with their college and confirm hours at the end of term.',
        actionLabel: 'Tell the students'
      },
      interests: []
    },
    {
      id: 'b04',
      title: 'State Seal of Civic Engagement',
      type: 'Volunteer benefit',
      category: 'benefits',
      matchKind: 'benefit',
      priority: 0.4,
      stage: 'local',
      provider: 'California Department of Education',
      headlineBenefit: 'A gold seal on their high-school diploma',
      beneficiary: 'High-school students in participating districts',
      summary: 'Students earn the seal with verified service hours and a civic project that tackles a real community problem, such as food access. Districts set the hours; Oakland asks for 15.',
      action: 'Write a short reference confirming each student’s hours and project.',
      requirements: [
        'Verified service hours set by the district, plus a civic project and a reflection.',
        'Volunteering alone is not enough: the project must address a real community problem.',
        'The organisation’s leader writes a reference.'
      ],
      steps: [
        'Offer a small food-access project students can own, such as a harvest-sharing day.',
        'Write each student a reference when they finish.'
      ],
      sourceUrl: 'https://www.cde.ca.gov/ci/pl/hssstateseal.asp',
      sources: [
        { label: 'CDE: State Seal of Civic Engagement', url: 'https://www.cde.ca.gov/ci/pl/hssstateseal.asp' },
        { label: 'Oakland USD seal requirements', url: 'https://www.ousd.org/seals/seal-of-civic-engagement' }
      ],
      sourceCheckedAt: '2026-10-25',
      statusLabel: 'Ongoing · District rules vary',
      benefitTag: 'civic-seal',
      matchReason: 'High-school student working toward the seal (fictional, recorded with permission).',
      fitFacts: [['Diploma seal', 'Hours plus a civic project']],
      hostChecks: ['Offer a project that addresses a real community need.', 'Write a reference for each student.'],
      fitSummary: '{n} high-school students could earn the diploma seal through a project here.',
      insight: {
        noun: ['high-school student', 'high-school students'],
        could: 'could earn a diploma seal through a project here',
        sms: 'Hi {first_name}, a small food-access project at the garden could earn you the State Seal of Civic Engagement on your diploma. Interested? Reply STOP to opt out.',
        short: 'students could earn a diploma seal',
        chip: 'diploma seal',
        meta: 'Hours plus a civic project',
        gets: 'A gold seal on their diploma for service and a project that tackles a real problem, such as food access.',
        todo: 'Offer a small food-access project they can own and write each of them a reference.',
        actionLabel: 'Tell the students'
      },
      interests: []
    },
    {
      id: 'o04',
      title: 'CalAgPlate education grant',
      type: 'Grant',
      category: 'grants',
      matchKind: 'education',
      priority: 1,
      stage: 'open',
      provider: 'California Department of Food and Agriculture',
      headlineBenefit: '$2,500–$10,000 for an education project',
      beneficiary: 'Grant paid to the eligible applicant organization',
      summary: 'The 2026 Tier 2 round funds agricultural education and leadership. School and community garden enrichment is an eligible example, so a defined learning programme could fit.',
      action: 'Check applicant eligibility and prepare a Tier 2 proposal in GOATS before 2 November.',
      requirements: [
        'California nonprofit or state, local or tribal agency delivering agricultural education for K–12, postsecondary or adult learners.',
        'Schools are encouraged to partner with eligible nonprofits. Higher-education institutions generally cannot apply directly; the RFP lists an exception for university-managed nonprofit programmes.',
        'Define beneficiaries, measurable learning outcomes, a workplan and an eligible budget. No minimum participant count is specified.',
        'Project spending must fall between 1 January 2027 and 30 June 2028.'
      ],
      steps: [
        'Turn the proposed school-growing sessions into a short curriculum, cohort plan and budget.',
        'Confirm the legal applicant and delivery partner, then submit through GOATS.'
      ],
      sourceUrl: 'https://www.cdfa.ca.gov/egov/calagplate/',
      sources: [
        { label: '2026 CalAgPlate programme and deadline', url: 'https://www.cdfa.ca.gov/egov/calagplate/' },
        { label: '2026 request for grant proposals', url: 'https://www.cdfa.ca.gov/egov/calagplate/docs/2026-CalAgPlate_RFP.pdf' },
        { label: 'GOATS application portal', url: 'https://applications.cdfa.ca.gov/grants/s' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'Open · Due 2 Nov, 9am PT',
      deadlineAt: '2026-11-02T09:00:00-08:00',
      amountMin: 2500,
      amountMax: 10000,
      interests: ['Environmental education', 'Youth mentoring', 'Community gardening']
    },
    {
      id: 'o13',
      title: 'Climate Action Event Microgrant',
      type: 'Grant',
      category: 'grants',
      matchKind: 'community-event',
      priority: 2,
      stage: 'open',
      provider: 'Keep California Beautiful · California Volunteers',
      headlineBenefit: 'Up to $1,500, tied to volunteer turnout',
      beneficiary: 'Reimbursement to the eligible event organizer',
      summary: 'Funding supports a volunteer event with a measurable climate outcome, including community greening or composting. The application remains available but says funds are nearly allocated.',
      action: 'Choose an event and confirm attendance against a funding tier before applying.',
      requirements: [
        'California public agency, eligible nonprofit, tribal government or educational institution.',
        'Minimum turnout: 12 volunteers for up to $250; 25 for $500; 50 for $1,000; 75 for $1,500.',
        'Staffing, tools, supplies, permits and recruitment can be funded. Food, beverages, incentives, swag and entertainment cannot.',
        'Funds reimburse completed work and reporting. Lower turnout can reduce payment; awards depend on remaining funds.'
      ],
      steps: [
        'Choose a climate outcome and event date, then invite the available cohort and record confirmations.',
        'Budget permitted costs and apply for the tier the event can deliver; plan attendance and outcome reporting.'
      ],
      sourceUrl: 'https://keepcabeautiful.org/climate-action-events/',
      sources: [
        { label: 'Programme operator', url: 'https://keepcabeautiful.org/climate-action-events/' },
        { label: 'Official application and volunteer tiers', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfdaYiTwOJ3RogTysWS7lFj6QLMBlD1RpBOICXBzmlMhvpl4g/viewform' },
        { label: 'California Volunteers programme link', url: 'https://www.californiavolunteers.ca.gov/california-climate-action-corps-sign-up-for-organizations/' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'Application available · Limited funds',
      tiers: [
        { people: 12, amount: 250 },
        { people: 25, amount: 500 },
        { people: 50, amount: 1000 },
        { people: 75, amount: 1500 }
      ],
      interests: ['Climate action', 'Community gardening', 'Composting', 'Food recovery', 'Native plants']
    },
    {
      id: 'o01',
      title: 'College Corps partnerships',
      type: 'Partnership',
      category: 'placements',
      matchKind: 'college',
      priority: 3,
      stage: 'campus',
      provider: 'California Volunteers · Participating colleges',
      headlineBenefit: 'Up to $10,000 per fellow for 450 service hours',
      beneficiary: 'Living allowance and education benefit for students; service capacity for the host',
      summary: 'Partner with a participating college to host regular student service in food security, climate action or education. Campus selection and supervision capacity determine the route.',
      action: 'Check UC Davis host arrangements; Sacramento State needs at least 3 places and reopens in March 2027.',
      requirements: [
        'State guidance requires a nonprofit or government host able to train, mentor and supervise at least 2 fellows.',
        'Fellows must be full-time undergraduates at a participating campus, meet financial-need and qualifying status rules, and commit for the academic year.',
        '450 hours is the full programme commitment, including training; student eligibility and placement are not established by age or interest.',
        'Sacramento State requires at least 3 fellows and 15 host-service hours per fellow each week. Two planned places do not meet its requirement.',
        'Sacramento State’s 2026–27 host cycle is closed; its next host application opens March 2027. Other campus timings need confirmation.'
      ],
      steps: [
        'Prepare supervised roles and a weekly timetable around the garden’s real capacity.',
        'Contact a suitable campus programme about host selection, student eligibility and the next intake.'
      ],
      sourceUrl: 'https://www.californiavolunteers.ca.gov/college-corps/',
      sources: [
        { label: 'State College Corps programme', url: 'https://www.californiavolunteers.ca.gov/college-corps/' },
        { label: 'Sacramento State host criteria and next intake', url: 'https://www.csus.edu/student-life/career-center/college-corps/community-partner-organizations.html' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'Campus partnership · Intake to confirm',
      minimumPeople: 2,
      campuses: ['UC Davis', 'Sacramento State'],
      campusMinimums: { 'Sacramento State': 3 },
      serviceHours: 450,
      participantBenefitMax: 10000,
      interests: ['Service hours', 'Environmental science', 'Community gardening', 'Food recovery']
    },
    {
      id: 'o02',
      title: 'California Climate Action Corps',
      type: 'Fellowship',
      category: 'placements',
      matchKind: 'climate-host',
      priority: 4,
      stage: 'upcoming',
      provider: 'California Volunteers · Bay Area Community Resources',
      headlineBenefit: '2 or more full-time fellows for 11 months',
      beneficiary: 'Funded service capacity for the host; programme benefits for fellows',
      summary: 'Hosts gain dedicated fellows for implementation-ready climate projects, including community gardens, greening and composting. The next host application window opens in January 2027.',
      action: 'Prepare two supervised roles and check host readiness ahead of the January application window.',
      requirements: [
        'Eligible hosts include nonprofits, public agencies, tribes and educational institutions; for-profit organizations cannot apply.',
        'Host at least 2 fellows with workspace, computers, a site supervisor and full-time service opportunities.',
        'Allow roughly 10 supervision hours per month for each fellow, plus recruitment, training and impact reporting.',
        'Use a defined urban-greening, organic-waste/food-recovery or wildfire-resilience project. The host page describes an 11-month placement at no programme charge.',
        'Fellow eligibility, schedule and benefits must be checked for the new cycle; this is not a grant paid to existing volunteers.'
      ],
      steps: [
        'Scope a volunteer-coordination and growing project with measurable outcomes and named supervisors.',
        'Review the January host call and confirm provisions and programme commitments before applying.'
      ],
      sourceUrl: 'https://www.caclimateactioncorps.org/host-partners',
      sources: [
        { label: 'Host requirements and January 2027 window', url: 'https://www.caclimateactioncorps.org/host-partners' },
        { label: 'California Volunteers fellowship overview', url: 'https://www.californiavolunteers.ca.gov/california-climate-action-corps-fellowship/' },
        { label: 'Published 2026–27 fellow eligibility', url: 'https://www.caclimateactioncorps.org/apply-now' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'Host applications open January 2027',
      minimumPeople: 2,
      durationMonths: 11,
      interests: ['Climate action', 'Composting', 'Ecosystem restoration', 'Community gardening']
    },
    {
      id: 'o05',
      title: 'School service-hour partnerships',
      type: 'Partnership',
      category: 'service',
      matchKind: 'school-service',
      priority: 5,
      stage: 'local',
      provider: 'Local school partner to agree',
      headlineBenefit: 'A supervised route to school service goals',
      beneficiary: 'Students gain recognized service hours if their school approves the placement',
      summary: 'A proposed partnership built around students’ individual service goals. Offer recurring garden sessions, supervision and hour records, then agree acceptance with their school.',
      action: 'Prepare a placement outline and ask the relevant school to approve the work and hour-recording process.',
      requirements: [
        'This is a local partnership proposal, not a verified grant or existing school agreement.',
        'Confirm each student’s actual target and deadline with the school. There is no universal 40-hour requirement.',
        'Agree age-appropriate activities, supervision, permissions, safeguarding and the method for signing off hours.',
        'A demo cohort or proposed schedule illustrates capacity; it does not confirm enrollment, attendance or school approval.'
      ],
      steps: [
        'Group students by school, remaining hours and availability, then design recurring supervised sessions.',
        'Agree the placement with the school and families where needed; invite students once the route is approved.'
      ],
      sourceUrl: null,
      sources: [],
      sourceCheckedAt: null,
      statusLabel: 'Local outreach · Partnership to agree',
      interests: ['Service hours', 'Youth mentoring', 'Environmental education']
    },
    {
      id: 'o12',
      title: 'Microsoft employee volunteer matching',
      type: 'Partnership',
      category: 'employer',
      matchKind: 'employer',
      priority: 6,
      stage: 'policy',
      provider: 'Microsoft employee giving',
      headlineBenefit: '$25 per eligible volunteer hour to the nonprofit',
      beneficiary: 'Donation to the eligible nonprofit, requested through an eligible employee',
      summary: 'Microsoft’s published U.S. policy matches eligible volunteer time with a donation. Its combined annual time-and-giving benefit is capped at $15,000 per eligible employee.',
      action: 'Confirm nonprofit eligibility and ask a willing employee connection to check the current internal programme.',
      requirements: [
        'Confirm that the organization meets nonprofit requirements and is registered with Benevity.',
        'A recorded Microsoft employer is a connection to explore, not proof of employee or activity eligibility.',
        'Check current employee terms and remaining annual allowance before estimating any donation.',
        'This is an employee-requested matching route; Microsoft’s guide excludes unsolicited grant and event-sponsorship requests.'
      ],
      steps: [
        'Prepare a supervised activity with accurate hour records and verify nonprofit registration.',
        'Ask an eligible employee to review the opportunity and submit any qualifying hour request after service.'
      ],
      sourceUrl: 'https://www.microsoft.com/en-us/reno/community-involvement',
      sources: [
        { label: 'Published U.S. employee giving policy', url: 'https://www.microsoft.com/en-us/reno/community-involvement' },
        { label: 'Microsoft nonprofit engagement guide', url: 'https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/FY25-Max-Employee-Engagement-March-2025.pdf' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'Public policy · Eligibility to confirm',
      employer: 'Microsoft',
      policyRate: 25,
      policyAnnualLimit: 15000,
      interests: []
    },
    {
      id: 'o03',
      title: 'Urban Agriculture Grant Programme',
      type: 'Grant',
      category: 'grants',
      matchKind: 'watchlist',
      priority: 7,
      stage: 'upcoming',
      provider: 'California Department of Food and Agriculture',
      headlineBenefit: 'New community-farm funding round in development',
      beneficiary: 'Future eligible project applicants; new-round rules are not published',
      summary: 'CDFA is developing a new round for creating or expanding city and suburban farms and gardens. The statewide allocation is $20 million; individual award amounts and the application window are not yet published.',
      action: 'Prepare the garden expansion scope and review the new rules when CDFA publishes them.',
      requirements: [
        'Applications are not open. New-round applicant eligibility, award amounts and deadlines remain unconfirmed.',
        'The announced purpose covers city and suburban community farms and gardens.',
        'Prior-round amounts and eligibility must not be carried forward as current rules.'
      ],
      steps: [
        'Document the site, growing-space needs, delivery capacity and intended community benefit.',
        'Reassess the proposal against the new funding notice before preparing an application.'
      ],
      sourceUrl: 'https://cafarmtofork.cdfa.ca.gov/farm_to_fork/grants/urban_ag.html',
      sources: [
        { label: 'CDFA programme status', url: 'https://cafarmtofork.cdfa.ca.gov/farm_to_fork/grants/urban_ag.html' }
      ],
      sourceCheckedAt: '2026-10-24',
      statusLabel: 'In development · No open application',
      interests: ['Community gardening', 'Environmental education', 'Carpentry']
    }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = programs;
  if (root) root.ROOTS_PROGRAMS = programs;
})(typeof window !== 'undefined' ? window : null);
