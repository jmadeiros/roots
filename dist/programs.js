(function (root) {
  'use strict';

  const programs = [
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
