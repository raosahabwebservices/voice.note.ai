import { SmartNote } from '../types';

export const INITIAL_SAMPLE_NOTES: SmartNote[] = [
  {
    id: 'note-1',
    title: 'AI Startup Pitch & Go-To-Market Strategy',
    category: 'Entrepreneur',
    tags: ['Pitch', 'SaaS', 'Fundraising', 'Strategy'],
    summary: 'Discussion with co-founders regarding our Q3 seed fundraising milestones and beta launch customer acquisition metrics. Key focus on reducing CAC by 35% through organic developer-led growth and AI workflow automation features.',
    transcript: "Alright team, let's review the Q3 seed deck and GTM metrics. First, our current customer acquisition cost is sitting around $120, which is too high for self-serve tiers. We need to focus on product-led growth and viral voice-sharing loops. Sarah, can you finalize the financial model by Thursday? Also, we have the Sequoia investor pitch on August 15th at 10 AM. We need to emphasize our 98% transcription accuracy and lightning-fast latency. Let's make sure our deck highlights the new multi-speaker diarization feature.",
    keyPoints: [
      'Customer acquisition cost (CAC) needs reduction below $80 through PLG loops.',
      'Highlight 98% transcription accuracy and sub-second latency in investor pitch.',
      'Targeting Sequoia seed meeting on August 15th.',
      'Launch multi-speaker diarization feature before beta rollout.'
    ],
    actionItems: [
      { task: 'Finalize financial model with unit economics', assignee: 'Sarah', completed: true, dueDate: '2026-08-05' },
      { task: 'Update Sequoia pitch deck with diarization benchmarks', assignee: 'Alex', completed: false, dueDate: '2026-08-10' },
      { task: 'Schedule user testing with 15 beta design partners', assignee: 'Marcus', completed: false, dueDate: '2026-08-12' }
    ],
    deadlines: [
      { event: 'Financial model completion', date: 'August 5, 2026' },
      { event: 'Sequoia Seed Pitch Meeting', date: 'August 15, 2026' }
    ],
    questions: [
      'What is our projected burn rate after expanding server clusters?',
      'Should we price tiered plans per seat or per processed audio hour?'
    ],
    audioDurationSeconds: 245, // 4 mins 5 sec
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    sourceType: 'sample'
  },
  {
    id: 'note-2',
    title: 'Organic Chemistry II: Reaction Mechanisms & Spectroscopy',
    category: 'Student',
    tags: ['Chemistry', 'ExamPrep', 'StudyNotes', 'NMR'],
    summary: 'Comprehensive lecture review covering carbonyl condensation reactions, Aldol additions, Claisen condensations, and Interpretation of H-NMR and C-NMR spectroscopy for midterms.',
    transcript: "Today's lecture focused heavily on enolates, Aldol reactions, and spectroscopic analysis. Remember that thermodynamic enolates are formed under high temperature with a weaker, more substituted base like LDA at low temp gives kinetic enolates. When analyzing NMR spectra, always check the chemical shift, integration, splitting pattern (n+1 rule), and number of unique carbon environments. Professor Higgins announced that midterm exam 2 is scheduled for next Wednesday in Hall B.",
    keyPoints: [
      'Kinetic vs Thermodynamic enolates: LDA at -78°C gives kinetic enolate; warmer temps favor thermodynamic.',
      'NMR Spectroscopy: Use n+1 rule for splitting patterns; chemical shifts indicate electronegative shielding.',
      'Midterm exam covers chapters 16 through 21.'
    ],
    actionItems: [
      { task: 'Complete practice problem set 4 on enolate synthesis', assignee: 'Self', completed: true, dueDate: '2026-08-03' },
      { task: 'Review NMR chemical shift reference table', assignee: 'Self', completed: false, dueDate: '2026-08-06' }
    ],
    deadlines: [
      { event: 'Midterm Exam 2 (Hall B)', date: 'August 12, 2026' },
      { event: 'Problem Set 4 Submission', date: 'August 4, 2026' }
    ],
    questions: [
      'How do cross-aldol reactions prevent self-condensation products?',
      'What distinguishes splitting in complex aromatic systems?'
    ],
    audioDurationSeconds: 412, // 6 mins 52 sec
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    sourceType: 'sample'
  },
  {
    id: 'note-3',
    title: 'Q3 Enterprise Product Roadmap & UX Alignment',
    category: 'Professional',
    tags: ['Product', 'Roadmap', 'Engineering', 'UX'],
    summary: 'Cross-functional sync between Product, Design, and Engineering leads to prioritize Q3 enterprise features including SSO/SAML integration, role-based access control, and SOC2 compliance audits.',
    transcript: "Welcome everyone to our Q3 product sync. Our main objective this quarter is enterprise readiness. Key enterprise clients like Acme Corp and GlobalBank require SAML-based SSO and SOC2 Type II certification before signing annual contracts. Engineering estimates 3 weeks for Okta and Azure AD integration. Design lead Emma presented the new dark mode accessibility color contrast updates which scored WCAG AAA compliance.",
    keyPoints: [
      'Enterprise readiness is the #1 priority for Q3 revenue expansion.',
      'SAML/SSO integration (Okta, Azure AD) scheduled for completion by end of month.',
      'SOC2 Type II audit walkthrough with auditor scheduled for August 20th.'
    ],
    actionItems: [
      { task: 'Set up Okta SAML developer sandbox integration', assignee: 'DevOps Lead', completed: true, dueDate: '2026-08-02' },
      { task: 'Finalize WCAG AAA contrast tokens in design system', assignee: 'Emma', completed: true, dueDate: '2026-08-03' },
      { task: 'Prepare SOC2 compliance evidence folder', assignee: 'Security Team', completed: false, dueDate: '2026-08-18' }
    ],
    deadlines: [
      { event: 'SOC2 Type II Audit Walkthrough', date: 'August 20, 2026' },
      { event: 'Enterprise Beta Release', date: 'September 1, 2026' }
    ],
    questions: [
      'Will audit logs export automatically to Datadog or Splunk?',
      'What is our SLA guarantee for enterprise tier customers?'
    ],
    audioDurationSeconds: 320, // 5 mins 20 sec
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    sourceType: 'sample'
  },
  {
    id: 'note-4',
    title: 'YouTube Channel Growth & Sponsor Scripting',
    category: 'Content Creator',
    tags: ['YouTube', 'Creator', 'Monetization', 'Scripting'],
    summary: 'Brainstorming session for upcoming deep-dive video on "The Future of AI Voice Assistants". Planning B-roll sequences, sponsor integration for Notion/VoiceNotes AI, and thumbnail A/B testing strategy.',
    transcript: "Hey channel fam! Today we are outlining our biggest tech documentary yet. We need a killer hook in the first 15 seconds. Instead of a standard intro, let's open with a live audio snippet generated in real-time. Our sponsor is VoiceNotes AI—we'll show how it auto-summarizes a 30-minute meeting in 3 seconds. Thumbnail A compares Siri in 2011 vs Gemini 3.6 Flash. Let's aim for a publishing date of next Friday.",
    keyPoints: [
      'Video hook: Start with live AI voice generation in first 15 seconds.',
      'Sponsor integration: Demonstrate VoiceNotes AI live during mid-roll.',
      'Thumbnail A/B test: Historical vs Modern AI assistant comparison.'
    ],
    actionItems: [
      { task: 'Draft video script outline and timestamps', assignee: 'Creator', completed: true, dueDate: '2026-08-01' },
      { task: 'Record voiceover and B-roll voice clips', assignee: 'Editor', completed: false, dueDate: '2026-08-06' },
      { task: 'Design 3 thumbnail variations for Creator Studio A/B testing', assignee: 'Designer', completed: false, dueDate: '2026-08-07' }
    ],
    deadlines: [
      { event: 'Video Publishing Date', date: 'August 8, 2026' }
    ],
    questions: [
      'Should we include a dedicated chapter on privacy and local data encryption?',
      'What is the optimal video length for retention on this topic (12 vs 18 mins)?'
    ],
    audioDurationSeconds: 180, // 3 mins
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    sourceType: 'sample'
  }
];
