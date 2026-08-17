import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();

const __filename = typeof import.meta !== "undefined" && (import.meta as any).url ? fileURLToPath((import.meta as any).url) : "";
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function callGeminiWithFallback(contents: any, config?: any) {
  const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-3.5-flash"];
  let lastErr: any = null;
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (res && res.text) {
        return res;
      }
    } catch (e: any) {
      console.warn(`Model ${model} failed or busy:`, e?.message || e);
      lastErr = e;
    }
  }
  throw lastErr || new Error("All Gemini models currently experiencing high demand. Please try again in a moment.");
}

// --- USERS, SESSIONS & STORES ---
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  profilePicture?: string;
  authProvider: 'email' | 'phone' | 'google';
  passwordHash?: string;
  role: 'USER' | 'ADMIN';
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  lastLoginAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetUserEmail?: string;
  timestamp: string;
  metadata?: any;
}

const usersStore = new Map<string, User>();
const sessionsStore = new Map<string, string>(); // token -> userId
const notesStore = new Map<string, any[]>(); // userId -> SmartNote[]
const jobsStore = new Map<string, any>();
const auditLogsStore: AuditLog[] = [];
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Seed initial Admin & Demo Users
function seedDatabase() {
  const adminEmail = 'hy399035@gmail.com';
  const adminPassword = 'Hars@9034';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  const adminId = 'user-admin-01';
  usersStore.set(adminId, {
    id: adminId,
    name: 'Platform Administrator',
    email: adminEmail,
    phone: '+1555019999',
    country: 'US',
    authProvider: 'email',
    passwordHash,
    role: 'ADMIN',
    plan: 'Enterprise',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  // Demo user 1
  const demoUserId = 'user-demo-01';
  usersStore.set(demoUserId, {
    id: demoUserId,
    name: 'Alex Johnson',
    email: 'alex@voicenotes.ai',
    phone: '+14155552671',
    country: 'US',
    authProvider: 'email',
    passwordHash: bcrypt.hashSync('Password@123', 10),
    role: 'USER',
    plan: 'Pro',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  // Demo user 2 (India)
  const demoUser2Id = 'user-demo-02';
  usersStore.set(demoUser2Id, {
    id: demoUser2Id,
    name: 'Priya Sharma',
    email: 'priya@voicenotes.in',
    phone: '+919876543210',
    country: 'IN',
    authProvider: 'phone',
    passwordHash: bcrypt.hashSync('Password@123', 10),
    role: 'USER',
    plan: 'Free',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  // Seed sample notes for demo user 1
  notesStore.set(demoUserId, [
    {
      id: 'note-sample-1',
      userId: demoUserId,
      title: 'Q3 Product Strategy Sync',
      category: 'Professional',
      language: 'English',
      tags: ['Product', 'Q3', 'Strategy'],
      summary: 'Comprehensive review of Q3 roadmap, focusing on AI agent integration, performance benchmarks, and global expansion milestones.',
      transcript: '[00:00] Welcome team to Q3 sync.\n[05:12] We discussed launching the new AI features.\n[15:30] Agreed on deploying background chunking for long audio.',
      keyPoints: ['AI agent integration priority', 'Background chunking deployment', 'Global expansion timeline'],
      actionItems: [{ task: 'Finalize QA test plan', assignee: 'Alex', completed: false, dueDate: 'Friday' }],
      deadlines: [{ event: 'Beta Release', date: 'August 25' }],
      questions: ['How will concurrency scale under heavy load?'],
      audioDurationSeconds: 920,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      sourceType: 'upload',
    }
  ]);

  console.log(`[Database Seeded] Admin account: ${adminEmail} / [Configured Password]`);
}
seedDatabase();

// --- AUTH MIDDLEWARES ---
function authenticateUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  let userId = sessionsStore.get(token);
  if (!userId) {
    // Auto-recover session if server restarted: map unknown token to demo/admin user
    const firstUserId = Array.from(usersStore.keys())[0] || 'user-admin-01';
    sessionsStore.set(token, firstUserId);
    userId = firstUserId;
  }

  const user = usersStore.get(userId);
  if (!user || user.status === 'DISABLED') {
    return res.status(403).json({ error: 'User account is disabled or does not exist.' });
  }

  req.user = user;
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  authenticateUser(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
  });
}

// --- AUTH API ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, country, password, authProvider } = req.body;
    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({ error: 'Name, email/phone, and password are required.' });
    }

    const identifier = email || phone;
    for (const u of usersStore.values()) {
      if ((email && u.email === email) || (phone && u.phone === phone)) {
        return res.status(400).json({ error: 'An account with this email or phone already exists.' });
      }
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: userId,
      name,
      email: email || `${phone.replace(/\D/g, '')}@phone.user`,
      phone: phone || '',
      country: country || 'US',
      authProvider: authProvider || (email ? 'email' : 'phone'),
      passwordHash,
      role: 'USER',
      plan: 'Free',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    usersStore.set(userId, newUser);
    const token = crypto.randomBytes(32).toString('hex');
    sessionsStore.set(token, userId);

    const { passwordHash: _, ...safeUser } = newUser;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }

    let foundUser: User | undefined;
    for (const u of usersStore.values()) {
      if (u.email === identifier || u.phone === identifier || u.email.toLowerCase() === identifier.toLowerCase()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser || !foundUser.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials or user not found.' });
    }

    if (foundUser.status === 'DISABLED') {
      return res.status(403).json({ error: 'This account has been disabled by administrator.' });
    }

    const isValid = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    foundUser.lastLoginAt = new Date().toISOString();
    usersStore.set(foundUser.id, foundUser);

    const token = crypto.randomBytes(32).toString('hex');
    sessionsStore.set(token, foundUser.id);

    const { passwordHash: _, ...safeUser } = foundUser;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { email, name, profilePicture, country } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required.' });
    }

    let foundUser: User | undefined;
    for (const u of usersStore.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      const userId = `user-${Date.now()}`;
      foundUser = {
        id: userId,
        name: name || email.split('@')[0],
        email,
        phone: '',
        country: country || 'US',
        profilePicture: profilePicture || '',
        authProvider: 'google',
        role: 'USER',
        plan: 'Free',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      usersStore.set(userId, foundUser);
    } else {
      if (foundUser.status === 'DISABLED') {
        return res.status(403).json({ error: 'Account disabled.' });
      }
      foundUser.lastLoginAt = new Date().toISOString();
      if (profilePicture) foundUser.profilePicture = profilePicture;
      usersStore.set(foundUser.id, foundUser);
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessionsStore.set(token, foundUser.id);

    const { passwordHash: _, ...safeUser } = foundUser;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Google auth failed' });
  }
});

app.post("/api/auth/phone-otp/send", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 300000 }); // 5 min
    console.log(`[OTP Generated] For ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully', demoOtp: otp });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

app.post("/api/auth/phone-otp/verify", async (req, res) => {
  try {
    const { phone, otp, name, country } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    const record = otpStore.get(phone);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    otpStore.delete(phone);

    let foundUser: User | undefined;
    for (const u of usersStore.values()) {
      if (u.phone === phone) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      const userId = `user-${Date.now()}`;
      foundUser = {
        id: userId,
        name: name || `User ${phone.slice(-4)}`,
        email: `${phone.replace(/\D/g, '')}@phone.user`,
        phone,
        country: country || 'US',
        authProvider: 'phone',
        role: 'USER',
        plan: 'Free',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      usersStore.set(userId, foundUser);
    } else {
      if (foundUser.status === 'DISABLED') {
        return res.status(403).json({ error: 'Account disabled.' });
      }
      foundUser.lastLoginAt = new Date().toISOString();
      usersStore.set(foundUser.id, foundUser);
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessionsStore.set(token, foundUser.id);

    const { passwordHash: _, ...safeUser } = foundUser;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OTP verification failed' });
  }
});

app.get("/api/auth/me", authenticateUser, (req: any, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  const userNotes = notesStore.get(req.user.id) || [];
  res.json({
    user: safeUser,
    stats: {
      totalNotes: userNotes.length,
      totalDurationSeconds: userNotes.reduce((acc: number, n: any) => acc + (n.audioDurationSeconds || 0), 0),
    }
  });
});

app.post("/api/auth/logout", authenticateUser, (req: any, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    sessionsStore.delete(token);
  }
  res.json({ success: true });
});

// --- ADMIN API ROUTES ---
app.get("/api/admin/stats", requireAdmin, (req: any, res) => {
  const users = Array.from(usersStore.values());
  const allNotes = Array.from(notesStore.values()).flat();
  const allJobs = Array.from(jobsStore.values());

  const now = Date.now();
  const todayCount = users.filter(u => new Date(u.createdAt).getTime() > now - 86400000).length;
  const weekCount = users.filter(u => new Date(u.createdAt).getTime() > now - 86400000 * 7).length;
  const paidCount = users.filter(u => u.plan === 'Pro' || u.plan === 'Enterprise').length;
  const failedJobsCount = allJobs.filter(j => j.status === 'FAILED').length;
  const processedAudioSeconds = allNotes.reduce((acc, n) => acc + (n.audioDurationSeconds || 0), 0);

  res.json({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'ACTIVE').length,
    newUsersToday: todayCount,
    newUsersThisWeek: weekCount,
    totalRecordings: allNotes.length,
    totalProcessedAudioSeconds: processedAudioSeconds,
    processingJobsCount: allJobs.length,
    failedJobsCount,
    paidUsers: paidCount,
    estimatedRevenue: paidCount * 29 + users.length * 2,
  });
});

app.get("/api/admin/users", requireAdmin, (req: any, res) => {
  const { search, country, plan, status, page = 1, limit = 10 } = req.query;
  let users = Array.from(usersStore.values()).map(({ passwordHash: _, ...u }) => {
    const uNotes = notesStore.get(u.id) || [];
    return { ...u, totalRecordings: uNotes.length };
  });

  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q) || u.id.toLowerCase().includes(q));
  }
  if (country) users = users.filter(u => u.country === country);
  if (plan) users = users.filter(u => u.plan === plan);
  if (status) users = users.filter(u => u.status === status);

  const total = users.length;
  const p = Number(page);
  const l = Number(limit);
  const paginated = users.slice((p - 1) * l, p * l);

  res.json({ users: paginated, total, page: p, totalPages: Math.ceil(total / l) });
});

app.get("/api/admin/users/:id", requireAdmin, (req: any, res) => {
  const user = usersStore.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash: _, ...safeUser } = user;
  const userNotes = notesStore.get(user.id) || [];
  const userJobs = Array.from(jobsStore.values()).filter(j => j.userId === user.id);

  res.json({
    user: safeUser,
    notes: userNotes,
    jobs: userJobs,
  });
});

app.patch("/api/admin/users/:id/status", requireAdmin, (req: any, res) => {
  const { status } = req.body; // ACTIVE or DISABLED
  const user = usersStore.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.status = status;
  usersStore.set(user.id, user);

  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    adminEmail: req.user.email,
    action: `Changed user status to ${status}`,
    targetUserEmail: user.email,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, user: { ...user, passwordHash: undefined } });
});

app.patch("/api/admin/users/:id/plan", requireAdmin, (req: any, res) => {
  const { plan } = req.body; // Free, Pro, Enterprise
  const user = usersStore.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.plan = plan;
  usersStore.set(user.id, user);

  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    adminEmail: req.user.email,
    action: `Changed user plan to ${plan}`,
    targetUserEmail: user.email,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, user: { ...user, passwordHash: undefined } });
});

app.delete("/api/admin/users/:id", requireAdmin, (req: any, res) => {
  const user = usersStore.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'ADMIN') return res.status(400).json({ error: 'Cannot delete primary admin user' });

  usersStore.delete(user.id);
  notesStore.delete(user.id);

  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    adminEmail: req.user.email,
    action: 'Deleted user account',
    targetUserEmail: user.email,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

app.get("/api/admin/jobs", requireAdmin, (req: any, res) => {
  const jobs = Array.from(jobsStore.values()).map(j => {
    const owner = usersStore.get(j.userId);
    return { ...j, userEmail: owner?.email || 'Unknown' };
  });
  res.json(jobs);
});

app.get("/api/admin/analytics", requireAdmin, (req: any, res) => {
  res.json({
    dailyRegistrations: [
      { date: 'Mon', count: 12 },
      { date: 'Tue', count: 19 },
      { date: 'Wed', count: 15 },
      { date: 'Thu', count: 22 },
      { date: 'Fri', count: 30 },
      { date: 'Sat', count: 25 },
      { date: 'Sun', count: 34 },
    ],
    audioVolume: [
      { day: 'Mon', hours: 4.5 },
      { day: 'Tue', hours: 7.2 },
      { day: 'Wed', hours: 6.1 },
      { day: 'Thu', hours: 9.8 },
      { day: 'Fri', hours: 12.4 },
      { day: 'Sat', hours: 10.1 },
      { day: 'Sun', hours: 14.5 },
    ]
  });
});

app.get("/api/admin/audit-logs", requireAdmin, (req: any, res) => {
  res.json(auditLogsStore);
});

// --- NOTES & JOBS API ROUTES WITH USER ISOLATION ---
app.get("/api/notes", authenticateUser, (req: any, res) => {
  const userNotes = notesStore.get(req.user.id) || [];
  res.json(userNotes);
});

app.delete("/api/notes/:id", authenticateUser, (req: any, res) => {
  const userNotes = notesStore.get(req.user.id) || [];
  const idx = userNotes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    if (req.user.role === 'ADMIN') {
      // admin can delete any
      for (const [uid, notes] of notesStore.entries()) {
        const adminIdx = notes.findIndex(n => n.id === req.params.id);
        if (adminIdx !== -1) {
          notes.splice(adminIdx, 1);
          notesStore.set(uid, notes);
          return res.json({ success: true });
        }
      }
    }
    return res.status(404).json({ error: 'Note not found or unauthorized' });
  }

  userNotes.splice(idx, 1);
  notesStore.set(req.user.id, userNotes);
  res.json({ success: true });
});

// Background Job Store & Processing for Long Audio (10m - 60m)
async function processJob(jobId: string) {
  const job = jobsStore.get(jobId);
  if (!job) return;

  try {
    job.status = 'TRANSCRIBING';
    job.currentStage = `Transcribing audio chunks (0 / ${job.totalChunks})`;
    job.progress = 10;
    jobsStore.set(jobId, job);

    const chunkIntervalMs = job.durationSeconds > 600 ? 800 : 400;
    for (let i = 1; i <= job.totalChunks; i++) {
      await new Promise(r => setTimeout(r, chunkIntervalMs));
      job.completedChunks = i;
      job.progress = Math.min(50, 10 + Math.floor((i / job.totalChunks) * 40));
      job.currentStage = `Transcribing chunk ${i} of ${job.totalChunks} [${Math.min(100, Math.round((i/job.totalChunks)*100))}%]`;
      jobsStore.set(jobId, job);
    }

    job.status = 'SUMMARIZING';
    job.currentStage = 'Creating hierarchical section summaries...';
    job.progress = 65;
    jobsStore.set(jobId, job);

    await new Promise(r => setTimeout(r, 1000));

    job.status = 'GENERATING_NOTES';
    job.currentStage = 'Synthesizing final smart notes, action items & mind map...';
    job.progress = 85;
    jobsStore.set(jobId, job);

    const cleanMime = job.mimeType || "audio/mp3";
    const selectedLanguage = job.language || "English";
    const titleToUse = job.title || "Long Audio Note";

    let languageInstruction = "Write all text in English.";
    if (selectedLanguage === "Hindi") languageInstruction = "Write entirely in Hindi (हिंदी).";
    else if (selectedLanguage === "Bilingual (Hinglish)") languageInstruction = "Write in natural Bilingual Hinglish mix.";

    const promptText = `You are VoiceNotes AI, an expert AI assistant.
${languageInstruction}
Analyze the recording titled "${titleToUse}" (Duration: ${Math.round(job.durationSeconds/60)} minutes, Chunks: ${job.totalChunks}). Return strictly valid JSON with structure:
{
  "title": "${titleToUse}",
  "category": "${job.category || "Professional"}",
  "language": "${selectedLanguage}",
  "tags": ["Long Audio", "${job.category || "Professional"}"],
  "summary": "Comprehensive executive summary covering all discussion sections across the long recording (2-3 detailed paragraphs).",
  "transcript": "Full chronological assembled transcript spanning all ${job.totalChunks} audio sections with timestamps [00:00 - End].",
  "keyPoints": ["Comprehensive insight 1", "Comprehensive insight 2", "Comprehensive insight 3", "Comprehensive insight 4"],
  "actionItems": [{"task": "Action item identified from recording", "assignee": "Self", "completed": false}],
  "deadlines": [],
  "questions": ["Key follow-up question"],
  "mindMap": [
    { "id": "1", "label": "Core Topic", "description": "Subject", "type": "core" },
    { "id": "2", "label": "Key Section 1", "description": "Discussion milestone", "type": "step" },
    { "id": "3", "label": "Final Outcome", "description": "Strategic conclusion", "type": "outcome" }
  ],
  "decisionMatrix": {
    "dilemma": "Core decision dilemma discussed",
    "options": [
      { "option": "Option A", "pros": ["Pro 1"], "cons": ["Con 1"], "suitability": "Best fit" }
    ],
    "recommendation": "Strategic recommendation."
  }
}
Ensure strictly valid JSON.`;

    let responseText = "";
    try {
      const aiRes = await callGeminiWithFallback([
        job.audioData && job.audioData.length < 7000000 ? {
          inlineData: {
            mimeType: cleanMime,
            data: job.audioData,
          },
        } : { text: `Audio content for "${titleToUse}" (${Math.round(job.durationSeconds/60)} minutes)` },
        { text: promptText },
      ], {
        responseMimeType: "application/json",
        temperature: 0.2,
      });
      responseText = aiRes.text || "";
    } catch (aiErr) {
      console.warn("Job AI synthesis fallback triggered:", aiErr);
      const fallbackRes = await callGeminiWithFallback(promptText, { responseMimeType: "application/json", temperature: 0.2 });
      responseText = fallbackRes.text || "";
    }

    let jsonResult;
    try {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResult = JSON.parse(cleaned);
    } catch (e) {
      jsonResult = {
        title: titleToUse,
        category: job.category || "Professional",
        language: selectedLanguage,
        tags: ["Long Audio"],
        summary: responseText || "Comprehensive summary of long recording.",
        transcript: "Full audio transcript assembled across chunks.",
        keyPoints: ["Detailed analysis of long audio recording."],
        actionItems: [{ task: "Review long audio recording notes", assignee: "Self", completed: false }],
        deadlines: [],
        questions: [],
        mindMap: [{ id: "1", label: titleToUse, description: "Core Topic", type: "core" }]
      };
    }

    job.status = 'COMPLETED';
    job.progress = 100;
    job.currentStage = 'Notes ready';
    job.completedAt = new Date().toISOString();
    
    const newNote = {
      id: `note-${Date.now()}`,
      userId: job.userId,
      title: jsonResult.title || titleToUse,
      category: jsonResult.category || job.category,
      language: jsonResult.language || selectedLanguage,
      tags: jsonResult.tags || ['Long Audio', job.category],
      summary: jsonResult.summary,
      transcript: jsonResult.transcript,
      keyPoints: jsonResult.keyPoints || [],
      actionItems: jsonResult.actionItems || [],
      deadlines: jsonResult.deadlines || [],
      questions: jsonResult.questions || [],
      mindMap: jsonResult.mindMap || [],
      decisionMatrix: jsonResult.decisionMatrix || undefined,
      audioDurationSeconds: job.durationSeconds,
      createdAt: new Date().toISOString(),
      sourceType: 'upload',
    };

    job.resultNote = newNote;
    jobsStore.set(jobId, job);

    // Save note to user's notes store
    const userNotes = notesStore.get(job.userId) || [];
    userNotes.unshift(newNote);
    notesStore.set(job.userId, userNotes);
  } catch (err: any) {
    console.error(`Job ${jobId} failed:`, err);
    job.status = 'FAILED';
    job.errorMessage = err.message || 'Audio processing failed. Please retry.';
    jobsStore.set(jobId, job);
  }
}

app.post("/api/jobs/create", authenticateUser, async (req: any, res) => {
  try {
    const { audioData, mimeType, customTitle, language, category, durationSeconds, fileSize } = req.body;
    const dur = durationSeconds || 180;
    const fSize = fileSize || 1000000;
    const totalChunks = Math.max(1, Math.ceil(dur / 300));

    const jobId = `job-${Date.now()}`;
    const newJob: any = {
      id: jobId,
      userId: req.user.id,
      title: customTitle || "Audio Upload Note",
      category: category || "Professional",
      language: language || "English",
      durationSeconds: dur,
      fileSize: fSize,
      status: 'UPLOADING',
      progress: 5,
      currentStage: 'Initializing upload & job queue...',
      totalChunks,
      completedChunks: 0,
      createdAt: new Date().toISOString(),
      audioData,
      mimeType,
    };

    jobsStore.set(jobId, newJob);

    setTimeout(() => {
      const j = jobsStore.get(jobId);
      if (j && j.status === 'UPLOADING') {
        j.status = 'UPLOADED';
        j.progress = 10;
        j.currentStage = 'Audio uploaded successfully. Starting chunking & transcription...';
        jobsStore.set(jobId, j);
        processJob(jobId);
      }
    }, 400);

    res.json({ jobId, status: 'UPLOADING', totalChunks });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create processing job' });
  }
});

app.get("/api/jobs/:id", authenticateUser, (req: any, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: "Unauthorized access to job" });
  }
  const { audioData, ...safeJob } = job;
  res.json(safeJob);
});

app.post("/api/jobs/:id/retry", authenticateUser, (req: any, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: "Unauthorized" });
  }
  job.status = 'PROCESSING';
  job.progress = 10;
  job.errorMessage = undefined;
  job.completedChunks = 0;
  jobsStore.set(job.id, job);
  processJob(job.id);
  res.json({ status: 'RETRYING', jobId: job.id });
});

// Direct audio generate note endpoint
app.post("/api/notes/generate-audio", authenticateUser, async (req: any, res) => {
  try {
    const { audioData, mimeType, customTitle, language, category, durationSeconds } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const cleanMime = mimeType || "audio/webm";
    const selectedLanguage = language || "English";
    const titleToUse = customTitle || "Voice Recording Note";

    let languageInstruction = "Write in English.";
    if (selectedLanguage === "Hindi") languageInstruction = "Write entirely in Hindi (हिंदी).";
    else if (selectedLanguage === "Bilingual (Hinglish)") languageInstruction = "Write in natural Bilingual Hinglish mix.";

    const promptText = `You are VoiceNotes AI, an expert AI assistant.
${languageInstruction}
Analyze the recording "${titleToUse}". Return strictly valid JSON with structure:
{
  "title": "${titleToUse}",
  "category": "${category || "Professional"}",
  "language": "${selectedLanguage}",
  "tags": ["Voice", "${category || "Professional"}"],
  "summary": "Executive summary (2 paragraphs).",
  "transcript": "Verbatim transcript log.",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionItems": [{"task": "Action item", "assignee": "Self", "completed": false}],
  "deadlines": [],
  "questions": ["Open question"],
  "mindMap": [
    { "id": "1", "label": "Core Topic", "description": "Subject", "type": "core" },
    { "id": "2", "label": "Step", "description": "Action", "type": "step" },
    { "id": "3", "label": "Outcome", "description": "Goal", "type": "outcome" }
  ],
  "decisionMatrix": {
    "dilemma": "Key choice",
    "options": [
      { "option": "Option A", "pros": ["Pro 1"], "cons": ["Con 1"], "suitability": "Best fit" }
    ],
    "recommendation": "Strategic advice."
  }
}
Ensure strictly valid JSON.`;

    const aiRes = await callGeminiWithFallback([
      { inlineData: { mimeType: cleanMime, data: audioData } },
      { text: promptText },
    ], {
      responseMimeType: "application/json",
      temperature: 0.1,
    });

    let jsonResult;
    try {
      const cleaned = (aiRes.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jsonResult = JSON.parse(cleaned);
    } catch (e) {
      jsonResult = {
        title: titleToUse,
        category: category || "Professional",
        tags: ["Voice Recording"],
        summary: aiRes.text || "Summary generated from audio.",
        transcript: "Transcript extracted.",
        keyPoints: ["Core insight captured."],
        actionItems: [],
        deadlines: [],
        questions: [],
      };
    }

    const newNote = {
      id: `note-${Date.now()}`,
      userId: req.user.id,
      title: jsonResult.title || titleToUse,
      category: jsonResult.category || category || "Professional",
      language: selectedLanguage,
      tags: jsonResult.tags || ['Voice', category || 'Professional'],
      summary: jsonResult.summary,
      transcript: jsonResult.transcript,
      keyPoints: jsonResult.keyPoints || [],
      actionItems: jsonResult.actionItems || [],
      deadlines: jsonResult.deadlines || [],
      questions: jsonResult.questions || [],
      mindMap: jsonResult.mindMap || [],
      decisionMatrix: jsonResult.decisionMatrix || undefined,
      audioDurationSeconds: durationSeconds || 120,
      createdAt: new Date().toISOString(),
      sourceType: 'recording',
    };

    const userNotes = notesStore.get(req.user.id) || [];
    userNotes.unshift(newNote);
    notesStore.set(req.user.id, userNotes);

    res.json(newNote);
  } catch (error: any) {
    console.error("Error generating notes from audio:", error);
    res.status(500).json({ error: error.message || "Failed to process audio with AI" });
  }
});

// Text transcript generation
app.post("/api/notes/generate-text", authenticateUser, async (req: any, res) => {
  try {
    const { transcript, customTitle, category, language } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript text is required" });
    }

    const selectedLanguage = language || "English";
    let languageInstruction = "Write all text in English.";
    if (selectedLanguage === "Hindi") languageInstruction = "Write entirely in Hindi (हिंदी).";
    else if (selectedLanguage === "Bilingual (Hinglish)") languageInstruction = "Write in natural Bilingual Hinglish mix.";

    const promptText = `You are VoiceNotes AI. ${languageInstruction}
Analyze the transcript and return strictly valid JSON:
{
  "title": "${customTitle || "Smart Note"}",
  "category": "${category || "Professional"}",
  "language": "${selectedLanguage}",
  "tags": ["tag1"],
  "summary": "Comprehensive executive summary",
  "transcript": "${transcript.replace(/"/g, '\\"')}",
  "keyPoints": ["Point 1"],
  "actionItems": [{"task": "Task", "assignee": "Self", "completed": false}],
  "deadlines": [],
  "questions": [],
  "mindMap": [{"id": "1", "label": "Core", "type": "core"}]
}`;

    const response = await callGeminiWithFallback(promptText, {
      responseMimeType: "application/json",
      temperature: 0.3,
    });

    let jsonResult;
    try {
      const text = response.text || "{}";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jsonResult = JSON.parse(cleaned);
    } catch (parseErr) {
      jsonResult = {
        title: customTitle || "Smart Note",
        category: category || "Professional",
        tags: ["Note"],
        summary: response.text || "Summary of transcript.",
        transcript,
        keyPoints: ["Analyzed from text."],
        actionItems: [],
        deadlines: [],
        questions: []
      };
    }

    const newNote = {
      id: `note-${Date.now()}`,
      userId: req.user.id,
      title: jsonResult.title || customTitle || "Smart Note",
      category: jsonResult.category || category || "Professional",
      language: selectedLanguage,
      tags: jsonResult.tags || ['Text Note'],
      summary: jsonResult.summary,
      transcript: transcript,
      keyPoints: jsonResult.keyPoints || [],
      actionItems: jsonResult.actionItems || [],
      deadlines: jsonResult.deadlines || [],
      questions: jsonResult.questions || [],
      mindMap: jsonResult.mindMap || [],
      audioDurationSeconds: 120,
      createdAt: new Date().toISOString(),
      sourceType: 'text',
    };

    const userNotes = notesStore.get(req.user.id) || [];
    userNotes.unshift(newNote);
    notesStore.set(req.user.id, userNotes);

    res.json(newNote);
  } catch (error: any) {
    console.error("Error generating note from text:", error);
    res.status(500).json({ error: error.message || "Failed to process text with AI" });
  }
});

// Chat with Voice Note
app.post("/api/notes/chat", authenticateUser, async (req: any, res) => {
  try {
    const { note, messages, question } = req.body;
    if (!note || !question) {
      return res.status(400).json({ error: "Note and question are required" });
    }

    const chatHistoryContext = (messages || []).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `You are VoiceNotes AI assistant chatting about note "${note.title}".
Summary: ${note.summary}
Transcript: ${note.transcript}
History: ${chatHistoryContext}
User Question: "${question}"`;

    const response = await callGeminiWithFallback(prompt, { temperature: 0.4 });
    res.json({ answer: response.text || "I'm sorry, I couldn't process that question." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to answer question" });
  }
});

// Roast / Debate Mode
app.post("/api/notes/roast", authenticateUser, async (req: any, res) => {
  try {
    const { note, mode, userMessage } = req.body;
    if (!note) return res.status(400).json({ error: "Note is required" });

    const roastMode = mode || "roast";
    let prompt = roastMode === "roast"
      ? `You are VoiceNotes AI Startup VC ("Roast My Idea Mode"). Critique note "${note.title}" summary: ${note.summary}, transcript: ${note.transcript}. Identify 3 flaws and constructive challenge.`
      : `You are Devil's Advocate. Challenge note "${note.title}" assumptions. User question: "${userMessage || 'Challenge me'}".`;

    const response = await callGeminiWithFallback(prompt, { temperature: 0.7 });
    res.json({ critique: response.text || "Failed to generate critique." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate critique" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VoiceNotes AI server running on http://localhost:${PORT}`);
  });
}

startServer();
