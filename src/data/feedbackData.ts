import {
  FeedbackItem,
  ThemeInsight,
  EmergingTheme,
  FeedbackSource,
} from '../types/feedback';

export const feedbackList: FeedbackItem[] = [
  // 1. AI Interview Coach - Pacing & Audio
  {
    id: 'FB-201',
    title: 'Audio delay when answering questions in the AI Mock Interview on mobile',
    content:
      'I was doing mock behavioral interview practice on my iPhone during lunch. When answering the situational questions, there was a 3-4 second audio lag before the AI coach started generating feedback.',
    rawQuote:
      '"Loved the feedback on my STAR method answers, but there was an annoying audio lag on Safari mobile where the transcript paused before scoring my pace. Could we get a smoother mic buffer?"',
    source: 'Slack',
    sourceChannelLabel: 'Sample Slack Community (#interview-prep)',
    author: {
      name: 'Maya Lin',
      role: 'Career Switcher (Biochem to Product Management)',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-18T14:20:00Z',
    careerProductArea: 'AI Interview Coach',
    theme: 'AI Interview Practice & Voice Feedback',
    sentiment: 'needs_attention',
    urgency: 'high',
    userGoal: 'Practice realistic mock interviews on-the-go without technical friction or audio lag.',
    aiTakeaway: 'Optimize mobile browser WebRTC audio streaming buffer to reduce latency on Safari.',
    similarItemIds: ['FB-207', 'FB-214'],
  },

  // 2. Resume & Portfolio - ATS Keyword Scoring
  {
    id: 'FB-202',
    title: 'Confused why my resume score went down after adding AWS & PMP certifications',
    content:
      'I updated my resume in the Leeg Career OS builder with my new certifications. My match score for Junior Cloud Engineer surprisingly dropped from 84% to 76%. I want to understand what triggered the lower score.',
    rawQuote:
      '"Just added my new AWS Cloud Practitioner cert, but my ATS target score actually dipped. Is there an explanation breakdown showing which bullet points lowered the score?"',
    source: 'Gmail',
    sourceChannelLabel: 'Sample Member Support (hello@leeg.ai)',
    author: {
      name: 'Julian Vance',
      role: 'Junior DevOps Candidate',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-17T11:45:00Z',
    careerProductArea: 'Resume & Portfolio',
    theme: 'Resume Scoring & Keyword Explanations',
    sentiment: 'needs_attention',
    urgency: 'high',
    userGoal: 'Clear, transparent explanations for resume score adjustments so users know how to improve.',
    aiTakeaway: 'Add an expandable "Score Breakdown" modal explaining keyword density vs conciseness.',
    similarItemIds: ['FB-208', 'FB-219'],
  },

  // 3. Mentor Matching - Timezone filter
  {
    id: 'FB-203',
    title: 'Need a timezone filter to easily find Western Canada / MST mentors',
    content:
      'When browsing the mentor directory for design leaders, all available slots showed in EST without clear timezone labels. I accidentally booked a 6:00 AM session with a mentor in Toronto.',
    rawQuote:
      '"Accidentally booked a 6 AM coffee chat because the calendar didn\'t detect my Calgary Mountain Time. A simple local timezone filter or auto-converter would save so much confusion!"',
    source: 'LinkedIn',
    sourceChannelLabel: 'Sample LinkedIn Direct Message',
    author: {
      name: 'Chloe Bennett',
      role: 'Aspiring UX/UI Designer',
      location: 'Edmonton, AB',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-17T09:30:00Z',
    careerProductArea: 'Mentor Matching',
    theme: 'Mentor Discovery & Calendar Scheduling',
    sentiment: 'needs_attention',
    urgency: 'medium',
    userGoal: 'Frictionless mentor booking that respects local timezones and avoids scheduling mistakes.',
    aiTakeaway: 'Default booking calendar to user local browser timezone and display clear MST/EST badges.',
    similarItemIds: ['FB-209', 'FB-221'],
  },

  // 4. Job Tracker - Follow-up Reminders
  {
    id: 'FB-204',
    title: 'Automated 5-day follow-up reminder after sending application',
    content:
      'The Kanban board for tracking applications is so helpful, but I keep forgetting to follow up with recruiters on LinkedIn after the initial application. A smart reminder nudge would be awesome.',
    rawQuote:
      '"I have 18 active job cards in my Leeg pipeline. It would be a lifesaver if the board reminded me: \'Hey, it\'s been 5 days since you applied to Benevity, here is a message template to follow up.\'"',
    source: 'Slack',
    sourceChannelLabel: 'Sample Slack (#job-hunt-wins)',
    author: {
      name: 'Devon Patel',
      role: 'Full-Stack Developer actively interviewing',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-16T16:15:00Z',
    careerProductArea: 'Job Application Tracker',
    theme: 'Job Application Kanban & Follow-up Workflows',
    sentiment: 'positive',
    urgency: 'medium',
    userGoal: 'Stay proactive and organized during multi-company interview cycles with automated nudges.',
    aiTakeaway: 'Introduce optional "Smart Follow-Up Nudges" with pre-filled professional message drafts.',
    similarItemIds: ['FB-210', 'FB-216'],
  },

  // 5. Career Pathways - Calgary Tech Salary Benchmarks
  {
    id: 'FB-205',
    title: 'More localized Canadian salary benchmarks (Calgary tech compensation vs US rates)',
    content:
      'The salary range visualizer shows general North American medians, which skew heavily towards Silicon Valley. It would be much more practical for local candidates to see realistic Western Canadian compensation bands.',
    rawQuote:
      '"The career path roadmap is inspiring, but the salary range shows $140k USD for intermediate PMs. In Calgary, local tech compensation is different. Having local YYC/YVR benchmarks would help in negotiations."',
    source: 'User research',
    sourceChannelLabel: 'Sample User Interview (#Cohort-4 Discovery)',
    author: {
      name: 'Alistair Ross',
      role: 'Associate Product Manager',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-15T13:00:00Z',
    careerProductArea: 'Career Pathways & Benchmarks',
    theme: 'Localized Salary & Skill Benchmarks',
    sentiment: 'positive',
    urgency: 'low',
    userGoal: 'Realistic compensation expectations and negotiation leverage based on their specific city.',
    aiTakeaway: 'Add city filter (Calgary, Vancouver, Toronto, Remote) to salary trajectory graphs.',
    similarItemIds: ['FB-211', 'FB-223'],
  },

  // 6. Networking - Voice notes after coffee chats
  {
    id: 'FB-206',
    title: 'Voice-to-text quick capture for coffee chat takeaways',
    content:
      'Right after leaving a networking coffee chat downtown, I want to quickly speak into the app to record 3 key things the contact mentioned (kids, projects, recommended books) before I forget.',
    rawQuote:
      '"Coffee chats are intense. If I can tap a mic button on the subway ride home and say \'Spoke with Sarah, she recommended reading Inspired, follow up on Friday\', that would make Leeg my irreplaceable career CRM."',
    source: 'Instagram',
    sourceChannelLabel: 'Sample Instagram Story Reply (@leegapp)',
    author: {
      name: 'Talia Morissette',
      role: 'Recent Tech Bootcamp Graduate',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-15T10:10:00Z',
    careerProductArea: 'Networking & Coffee Chats',
    theme: 'Networking Quick Capture & Contact Notes',
    sentiment: 'positive',
    urgency: 'medium',
    userGoal: 'Effortlessly preserve relationship context from real-world networking without manual typing.',
    aiTakeaway: 'Add 30-second audio memo button to Contact cards with automated action item extraction.',
    similarItemIds: ['FB-212', 'FB-220'],
  },

  // 7. AI Interview Coach - Technical Question Banks
  {
    id: 'FB-207',
    title: 'Request for system design and architecture question prompts for Senior Engineers',
    content:
      'The current mock interview practice focuses mostly on generic behavioral questions like "Tell me about a time you had a conflict". Senior engineers need specialized system design case studies and architectural trade-off questions.',
    rawQuote:
      '"Behavioral feedback is solid, but I am preparing for Senior Staff Engineer interviews. Could you add system design tracks with trade-off rubrics (scalability, microservices vs monolith)?"',
    source: 'Slack',
    sourceChannelLabel: 'Sample Slack Community (#interview-prep)',
    author: {
      name: 'Marcus Chen',
      role: 'Senior Backend Engineer',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-14T17:30:00Z',
    careerProductArea: 'AI Interview Coach',
    theme: 'AI Interview Practice & Voice Feedback',
    sentiment: 'neutral',
    urgency: 'medium',
    userGoal: 'Tailored interview questions suited for senior technical roles beyond basic behavioral questions.',
    aiTakeaway: 'Expand interview question libraries into Senior System Design and Product Strategy tracks.',
    similarItemIds: ['FB-201', 'FB-214'],
  },

  // 8. Resume & Portfolio - 1-Click PDF Export
  {
    id: 'FB-208',
    title: 'Clean 1-page PDF export that matches Canadian tech industry formatting',
    content:
      'The resume tailoring tool provides great bullet point suggestions, but exporting to PDF occasionally spills onto a second page with just two lines. Need a strict "Fit to 1 Page" toggle.',
    rawQuote:
      '"Recruiters in Calgary keep telling me to keep it strictly to one page. Can we get a smart auto-format toggle that adjusts margins slightly so it never spills 2 lines onto page 2?"',
    source: 'Product analytics',
    sourceChannelLabel: 'Sample Product Telemetry (Export_Resume_Page_Count)',
    author: {
      name: 'Elena Rostova',
      role: 'Junior Data Analyst',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-14T09:20:00Z',
    careerProductArea: 'Resume & Portfolio',
    theme: 'Resume Scoring & Keyword Explanations',
    sentiment: 'neutral',
    urgency: 'medium',
    userGoal: 'Professional, recruiter-ready 1-page resume exports without formatting frustration.',
    aiTakeaway: 'Implement auto-condense typography styling to guarantee single-page PDF output.',
    similarItemIds: ['FB-202', 'FB-219'],
  },

  // 9. Mentor Matching - Icebreaker Suggestions
  {
    id: 'FB-209',
    title: 'Suggested conversation topics based on mentor background',
    content:
      'As an introverted career changer, reaching out to VP-level mentors feels intimidating. Having 3 personalized question suggestions based on their LinkedIn journey made my first session 10x less scary.',
    rawQuote:
      '"The icebreaker prompts Leeg generated before my call with a Calgary Tech Director were gold. We talked about transitioning from engineering to founder. Please keep this feature front and center!"',
    source: 'LinkedIn',
    sourceChannelLabel: 'Sample LinkedIn Post Mention',
    author: {
      name: 'Felix Tremblay',
      role: 'Career Changer (Mechanical Eng to Software)',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-13T19:00:00Z',
    careerProductArea: 'Mentor Matching',
    theme: 'Mentor Discovery & Calendar Scheduling',
    sentiment: 'positive',
    urgency: 'low',
    userGoal: 'Confidence and structure when approaching senior mentors for advice.',
    aiTakeaway: 'Promote pre-session icebreaker generator into the standard meeting confirmation email.',
    similarItemIds: ['FB-203', 'FB-221'],
  },

  // 10. Job Tracker - Stage Drag-and-Drop
  {
    id: 'FB-210',
    title: 'Loving the Kanban view for tracking 15+ job applications',
    content:
      'Before Leeg, I kept an ugly Google Sheet that I abandoned after 2 weeks. Dragging cards from "Screening" to "Technical Interview" gives me a tangible sense of progress during a tough job market.',
    rawQuote:
      '"Dragging a job card to \'Offer Received\' yesterday was the most satisfying click of my entire year. The visual pipeline genuinely kept me motivated when rejection emails hit."',
    source: 'Gmail',
    sourceChannelLabel: 'Sample Member Feedback Email',
    author: {
      name: 'Brooke Hall',
      role: 'Intermediate Frontend Developer',
      location: 'Edmonton, AB',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-12T15:10:00Z',
    careerProductArea: 'Job Application Tracker',
    theme: 'Job Application Kanban & Follow-up Workflows',
    sentiment: 'positive',
    urgency: 'low',
    userGoal: 'Maintain morale and clear visibility over multi-stage interview pipelines.',
    aiTakeaway: 'Add celebratory visual micro-interaction when a user moves a card to "Offer Received".',
    similarItemIds: ['FB-204', 'FB-216'],
  },

  // 11. Career Pathways - Skill Gap Visualizer
  {
    id: 'FB-211',
    title: 'The "Missing Skills" radar chart clearly showed me what to learn next',
    content:
      'Comparing my current profile against Senior Product Designer job descriptions revealed that I lacked user analytics and SQL experience. It gave me a focused 3-month learning goal.',
    rawQuote:
      '"Instead of feeling overwhelmed by 50 requirements on job boards, Leeg\'s gap analysis narrowed it down to just 2 key missing skills (Mixpanel & SQL). Super actionable."',
    source: 'User research',
    sourceChannelLabel: 'Sample User Interview (#Cohort-3 Retrospective)',
    author: {
      name: 'Kendra O\'Connor',
      role: 'UI Designer aiming for Senior Product Role',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-11T14:40:00Z',
    careerProductArea: 'Career Pathways & Benchmarks',
    theme: 'Localized Salary & Skill Benchmarks',
    sentiment: 'positive',
    urgency: 'low',
    userGoal: 'Prioritize skill acquisition based on real employer demand rather than guesswork.',
    aiTakeaway: 'Link missing skill recommendations directly to curated project briefs or courses.',
    similarItemIds: ['FB-205', 'FB-223'],
  },

  // 12. Networking - Contact Relationship Cadence
  {
    id: 'FB-212',
    title: 'Need a "Stay in Touch" reminder cadence for informal mentors',
    content:
      'I meet great people at Platform Calgary tech meetups, but after 3 months I forget to check in with them. Would love an option to set a 60-day or 90-day "Say Hello" reminder on contacts.',
    rawQuote:
      '"Networking isn\'t just asking for jobs; it\'s nurturing relationships over time. If Leeg could ping me: \'It has been 3 months since you last caught up with David\', that would keep connections alive."',
    source: 'Instagram',
    sourceChannelLabel: 'Sample Instagram DM (@leegapp)',
    author: {
      name: 'Zane Gallagher',
      role: 'Junior Tech Founder / Product Builder',
      location: 'Calgary, AB',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    date: '2026-09-10T18:25:00Z',
    careerProductArea: 'Networking & Coffee Chats',
    theme: 'Networking Quick Capture & Contact Notes',
    sentiment: 'positive',
    urgency: 'medium',
    userGoal: 'Maintain authentic, long-term professional relationships without awkward gaps.',
    aiTakeaway: 'Allow users to set 30/60/90-day reconnection intervals on networking contacts.',
    similarItemIds: ['FB-206', 'FB-220'],
  },
];

// Top Recurring Themes for Leeg Career OS
export const themeInsights: ThemeInsight[] = [
  {
    id: 'theme-1',
    name: 'AI Interview Practice & Voice Feedback',
    category: 'recurring_theme',
    count: 14,
    sentimentBreakdown: { positive: 8, neutral: 3, needs_attention: 3 },
    careerProductArea: 'AI Interview Coach',
    summary:
      'Members praise the personalized STAR method critique, but highlight mobile audio lag on Safari and are requesting senior-level technical question banks.',
    coreUserGoal:
      'Practice mock interview responses with instant, realistic pacing and behavioral feedback before real recruiter interviews.',
    recommendedNextStep:
      'Improve mobile audio latency buffer and introduce senior-track question modules.',
    feedbackIds: ['FB-201', 'FB-207'],
    trendLabel: '+28% practice sessions this month',
  },
  {
    id: 'theme-2',
    name: 'Resume Scoring & Keyword Explanations',
    category: 'emerging_issue',
    count: 12,
    sentimentBreakdown: { positive: 5, neutral: 2, needs_attention: 5 },
    careerProductArea: 'Resume & Portfolio',
    summary:
      'Users are enthusiastic about ATS tailoring but confused when certification updates inadvertently lower their score without clear rationale.',
    coreUserGoal:
      'Understand how recruiters and algorithms evaluate their resume bullets so they can optimize effectively.',
    recommendedNextStep:
      'Add transparent "Score Explanation Breakdown" and guarantee 1-page PDF formatting.',
    feedbackIds: ['FB-202', 'FB-208'],
    trendLabel: '+35% inquiry spike around score drops',
  },
  {
    id: 'theme-3',
    name: 'Mentor Discovery & Calendar Scheduling',
    category: 'recurring_theme',
    count: 10,
    sentimentBreakdown: { positive: 7, neutral: 1, needs_attention: 2 },
    careerProductArea: 'Mentor Matching',
    summary:
      'High user satisfaction with icebreaker prompts, but confusion around Eastern vs Mountain timezone booking slots requires immediate fix.',
    coreUserGoal:
      'Seamlessly discover and schedule coffee chats with industry veterans without calendar timezone mix-ups.',
    recommendedNextStep:
      'Add prominent local timezone switcher and auto-detect MST/EST during booking.',
    feedbackIds: ['FB-203', 'FB-209'],
    trendLabel: 'High engagement across Calgary tech cohort',
  },
  {
    id: 'theme-4',
    name: 'Job Application Kanban & Follow-up Workflows',
    category: 'recurring_theme',
    count: 11,
    sentimentBreakdown: { positive: 10, neutral: 1, needs_attention: 0 },
    careerProductArea: 'Job Application Tracker',
    summary:
      'Extremely high positive sentiment. Candidates report the visual pipeline keeps their motivation high; requesting automated follow-up reminders.',
    coreUserGoal:
      'Stay organized and proactive across dozens of concurrent job applications and interview stages.',
    recommendedNextStep:
      'Introduce smart 5-day follow-up nudges with customizable outreach email templates.',
    feedbackIds: ['FB-204', 'FB-210'],
    trendLabel: 'Consistently 90%+ positive sentiment',
  },
  {
    id: 'theme-5',
    name: 'Localized Salary & Skill Benchmarks',
    category: 'feature_wish',
    count: 8,
    sentimentBreakdown: { positive: 6, neutral: 2, needs_attention: 0 },
    careerProductArea: 'Career Pathways & Benchmarks',
    summary:
      'Members love the skill gap visualizer; strongly request Canadian regional market filters (Calgary, Vancouver, Toronto) instead of US medians.',
    coreUserGoal:
      'Accurate salary transparency and strategic skill planning tailored to their actual local job market.',
    recommendedNextStep:
      'Incorporate Canadian tech compensation data with city-level filters in career roadmaps.',
    feedbackIds: ['FB-205', 'FB-211'],
    trendLabel: 'Top requested career roadmap addition',
  },
  {
    id: 'theme-6',
    name: 'Networking Quick Capture & Contact Notes',
    category: 'feature_wish',
    count: 7,
    sentimentBreakdown: { positive: 7, neutral: 0, needs_attention: 0 },
    careerProductArea: 'Networking & Coffee Chats',
    summary:
      'Bootcamp grads and career switchers want rapid voice-to-text notes and 60-day cadence reminders after in-person tech coffee chats.',
    coreUserGoal:
      'Turn informal in-person connections into meaningful long-term professional relationships without administrative overhead.',
    recommendedNextStep:
      'Prototype mobile audio memo recorder for contact profiles with automated follow-up scheduling.',
    feedbackIds: ['FB-206', 'FB-212'],
    trendLabel: 'Emerging power-user habit',
  },
];

// Emerging Themes / Issues for immediate attention
export const emergingThemes: EmergingTheme[] = [
  {
    id: 'EMERGING-01',
    title: 'Mobile Audio Lag on Safari during AI Mock Interviews',
    theme: 'AI Interview Practice & Voice Feedback',
    sourceHighlight: 'Slack Community & User Research',
    userObservation:
      'Candidates practicing on mobile phones encounter a 3-4s pause when speaking answers before scoring feedback appears.',
    suggestedFocus:
      'Improve iOS Safari microphone buffer and add visual "Listening / Processing" wave animation.',
    feedbackIds: ['FB-201', 'FB-207'],
  },
  {
    id: 'EMERGING-02',
    title: 'Resume Match Score Drop After Adding Certifications',
    theme: 'Resume Scoring & Keyword Explanations',
    sourceHighlight: 'Support Inbox & Telemetry',
    userObservation:
      'Members are confused when updating bullet points causes their ATS match percentage to drop without visible explanation.',
    suggestedFocus:
      'Display an expandable "Why did my score change?" breakdown showing exact keyword weighting.',
    feedbackIds: ['FB-202', 'FB-208'],
  },
  {
    id: 'EMERGING-03',
    title: 'Timezone Booking Mismatches on Mentor Calendars',
    theme: 'Mentor Discovery & Calendar Scheduling',
    sourceHighlight: 'LinkedIn DMs & Member Feedback',
    userObservation:
      'Western Canadian users inadvertently book early morning sessions due to calendar defaulting to Eastern Time.',
    suggestedFocus:
      'Auto-detect visitor timezone and clearly display Mountain Time (MST) on session confirmations.',
    feedbackIds: ['FB-203', 'FB-209'],
  },
];

// Sample Source Distribution
export const sampleSourceStats: {
  source: FeedbackSource;
  label: string;
  count: number;
  percentage: number;
  color: string;
}[] = [
  { source: 'Slack', label: 'Slack Community', count: 18, percentage: 37, color: '#7c3aed' },
  { source: 'Gmail', label: 'Member Emails', count: 11, percentage: 23, color: '#9333ea' },
  { source: 'User research', label: 'Discovery Interviews', count: 8, percentage: 17, color: '#a855f7' },
  { source: 'LinkedIn', label: 'LinkedIn Messages', count: 5, percentage: 11, color: '#6366f1' },
  { source: 'Instagram', label: 'Instagram Stories & DMs', count: 4, percentage: 8, color: '#ec4899' },
  { source: 'Product analytics', label: 'In-app Feedback Events', count: 2, percentage: 4, color: '#8b5cf6' },
];

export function getFeedbackById(id: string): FeedbackItem | undefined {
  return feedbackList.find((item) => item.id.toLowerCase() === id.toLowerCase());
}

export function getFeedbackByIds(ids: string[]): FeedbackItem[] {
  return feedbackList.filter((item) => ids.includes(item.id));
}

export function getFeedbackByTheme(themeName: string): FeedbackItem[] {
  return feedbackList.filter(
    (item) => item.theme.toLowerCase() === themeName.toLowerCase()
  );
}
