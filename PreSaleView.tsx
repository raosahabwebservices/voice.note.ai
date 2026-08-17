import React, { useState } from 'react';
import { 
  Zap, Mic, Brain, Target, Tag, ShieldCheck, CheckCircle2, 
  ArrowRight, QrCode, MessageSquare, Copy, Check, Sparkles, 
  Clock, TrendingUp, Send, FileText, Lock, Smartphone, HelpCircle, User, Star
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface PreSaleViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  showToast: (msg: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth?: () => void;
}

export const PreSaleView: React.FC<PreSaleViewProps> = ({ setActiveTab, showToast, currentUser, onOpenAuth }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    whatsapp: currentUser?.phone || '',
    utrNumber: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState({
    name: 'Lifetime Access',
    price: 1999,
    priceStr: '₹1,999',
    duration: 'Lifetime',
    minutes: '6,000 min',
  });

  const pricingPlans = [
    { name: 'Monthly', price: 149, priceStr: '₹149', duration: 'Monthly', minutes: '300 min', popular: false },
    { name: '3 Months', price: 399, priceStr: '₹399', duration: '3 Months', minutes: '1,000 min', popular: false },
    { name: '6 Months', price: 699, priceStr: '₹699', duration: '6 Months', minutes: '2,000 min', popular: false },
    { name: '1 Year', price: 1199, priceStr: '₹1,199', duration: '1 Year', minutes: '4,500 min', popular: false },
    { name: '🔥 Unlimited', price: 499, priceStr: '₹499/mo', duration: 'Monthly Sub', minutes: '3,000 min fair-use', popular: false },
    { name: 'Lifetime Access', price: 1999, priceStr: '₹1,999', duration: 'Lifetime', minutes: '6,000 min', popular: true },
  ];

  const [testimonials, setTestimonials] = useState<Array<{ name: string; role: string; comment: string; rating: number; initials: string; bg: string }>>(() => {
    try {
      const saved = localStorage.getItem('voicenotes_ai_testimonials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        name: 'Rohan Verma',
        role: 'Startup Founder, Bangalore',
        comment: 'VoiceNotes AI has completely transformed how I capture client meeting takeaways. The Hinglish transcription and automated action items are shockingly accurate!',
        rating: 5,
        initials: 'RV',
        bg: 'bg-blue-100 text-blue-700'
      },
      {
        name: 'Priya Sharma',
        role: 'Medical Student, Delhi',
        comment: 'As a medical student, recording lectures and getting instant D3 mind maps and bullet summaries has saved me 15+ hours every week. Absolute game-changer!',
        rating: 5,
        initials: 'PS',
        bg: 'bg-indigo-100 text-indigo-700'
      },
      {
        name: 'Aman Kumar',
        role: 'Tech Content Creator',
        comment: 'No recurring subscriptions! Paid ₹1,999 once during pre-sale and got lifetime unlimited access. Best software investment I\'ve made this year.',
        rating: 5,
        initials: 'AK',
        bg: 'bg-emerald-100 text-emerald-700'
      }
    ];
  });

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: currentUser?.name || '',
    role: 'Beta Tester & Creator',
    comment: '',
    rating: 5
  });

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.comment.trim()) {
      showToast('Please enter your name and feedback.');
      return;
    }
    const initials = newTestimonial.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AI';
    const entry = {
      name: newTestimonial.name,
      role: newTestimonial.role || 'Early Adopter',
      comment: newTestimonial.comment,
      rating: Number(newTestimonial.rating) || 5,
      initials,
      bg: 'bg-blue-100 text-blue-700'
    };
    const updated = [entry, ...testimonials];
    setTestimonials(updated);
    try {
      localStorage.setItem('voicenotes_ai_testimonials', JSON.stringify(updated));
    } catch (e) {}
    setIsTestimonialModalOpen(false);
    setNewTestimonial({ name: currentUser?.name || '', role: 'Beta Tester & Creator', comment: '', rating: 5 });
    showToast('Thank you! Your feedback has been published successfully.');
  };

  const spotsClaimed = 5;
  const totalSpots = 100;
  const percentage = (spotsClaimed / totalSpots) * 100;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('raos38908@okhdfcbank');
    setCopied(true);
    showToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.utrNumber) {
      showToast('Please enter your email and UTR / Transaction ID.');
      return;
    }
    setSubmitted(true);
    showToast('Payment submission received! Activation in progress...');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500 selection:text-white font-sans">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-2.5 px-4 text-center text-xs sm:text-sm font-semibold text-white flex items-center justify-center space-x-2 shadow-sm">
        <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>LIMITED PRE-SALE DEAL: First 100 Early Adopters Get Lifetime Access for ₹1,999 instead of ₹9,999/year!</span>
      </div>

      {/* Top Navigation Bar with Logo and Sign In Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-950 tracking-tight">VoiceNotes AI</span>
        </div>
        {!currentUser && (
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow transition-all flex items-center space-x-1.5"
          >
            <span>🔐 Sign In / Register</span>
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                {(currentUser.name || 'U').charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-600">Signed in as <strong className="text-slate-900">{currentUser.email}</strong></p>
                <p className="text-xs text-slate-700">
                  Status: {currentUser.isPremium ? <span className="text-emerald-600 font-bold">⚡ Premium Lifetime Active</span> : <span className="text-amber-600 font-bold">🔒 Payment Pending (₹1,999)</span>}
                </p>
              </div>
            </div>
            {currentUser.isPremium ? (
              <button
                onClick={() => setActiveTab('notes')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
              >
                Go to My Voice Notes →
              </button>
            ) : (
              <a
                href="#pricing-section"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow"
              >
                Pay ₹1,999 & Submit UTR ↓
              </a>
            )}
          </div>
        )}

        {/* HERO SECTION */}
        <div className="text-center space-y-6 pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold shadow-sm">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>LIMITED PRE-SALE DEAL (FIRST 100 USERS ONLY)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Turn Messy Voice Rambles into{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Structured Actionable Notes
            </span>{' '}
            in Seconds.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop typing long thoughts. Speak in Hinglish, English, or Hindi — VoiceNotes AI automatically transcribes, cleans filler words, and generates instant summaries, tasks, and key insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#pricing-section"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/25 hover:scale-105 transition-all text-center flex items-center justify-center space-x-3"
            >
              <span>Claim Lifetime Access • ₹1,999</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <button
              onClick={() => {
                if (currentUser) {
                  setActiveTab('dashboard');
                } else if (onOpenAuth) {
                  onOpenAuth();
                } else {
                  setActiveTab('dashboard');
                }
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-base transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Explore Live App Demo</span>
            </button>
          </div>
        </div>

        {/* LIVE URGENCY & COUNTER WIDGET */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-wide">LIVE PRE-SALE STATUS</h2>
            </div>
            
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-sm">
              <span className="text-2xl font-black text-blue-600">{spotsClaimed}</span>
              <span className="text-slate-600 font-medium">/ {totalSpots} Spots Claimed</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-slate-200 rounded-full h-4 p-0.5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>0 claimed</span>
              <span className="text-blue-600 font-bold">{totalSpots - spotsClaimed} spots remaining</span>
              <span>100 sold</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 flex items-start space-x-3 text-slate-700 text-sm shadow-sm">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">⚡ First 100 early adopters get Lifetime Access for ₹1,999.</strong> Price jumps to ₹9,999/year after all 100 seats fill up. No recurring monthly bills ever.
            </p>
          </div>
        </div>

        {/* WHAT YOU GET — FEATURES */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What You Get — Powerful AI Features</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
              Designed specifically for fast-moving founders, students, creators, and professionals who think out loud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🎙️ 1-Tap Instant Audio Recording & Upload</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Record live meetings, lectures, or random thoughts directly in your browser, or upload existing audio files in any format (MP3, WAV, M4A).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🧠 Hinglish & Local Accent First</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Understands mixed Hindi-English speech, Indian terminology, slang, names, and regional context perfectly without breaking a sweat.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🎯 Auto Action-Items</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Extracts tasks, follow-ups, and action items directly into clean checklist formats so nothing ever slips through the cracks.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🏷️ Smart Categorization</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatically tags and categorizes your notes for Founders, Students, Creators, and Professionals with key takeaways and timelines.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">⚡ Zero Monthly Subscription</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Say goodbye to recurring $15/month SaaS software fees. Pay once during this exclusive pre-sale window and use forever without recurring charges.
              </p>
            </div>

          </div>

          {/* NEW ADVANCED AI CAPABILITIES SHOWCASE */}
          <div className="mt-16 bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
            <div className="text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                ✨ Advanced AI Capabilities
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                More Than Just Transcripts — Visual Thinking & AI Debate Partners
              </h3>
              <p className="text-slate-600 text-sm max-w-2xl mx-auto">
                VoiceNotes AI transforms your raw audio notes into interactive visual graphs, brutal VC critiques, and logic decision matrices instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  🧠
                </div>
                <h4 className="font-bold text-slate-900 text-base">D3.js Visual Mind-Map</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Automatically turns your rambling voice notes and key points into interactive force-directed flowcharts and mind maps. Process complex ideas 10x faster.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                  🔥
                </div>
                <h4 className="font-bold text-slate-900 text-base">AI Opponent / Roast My Idea</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Acts as a brutally honest Startup VC & Tech Mentor. Critiques your voice notes, highlights 3 fatal flaws, and tests your conviction with hard debate questions.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  ⚖️
                </div>
                <h4 className="font-bold text-slate-900 text-base">Voice-to-Logic Decision Maker</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Confused between options (e.g. ₹1,999 vs $49 pricing)? Automatically generates a Pro vs. Con table with a strategic AI recommendation.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* PRICING & PAYMENT SECTION */}
        <div id="pricing-section" className="bg-slate-50 border-2 border-blue-200 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden space-y-10">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm">
            Choose Your Plan
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
              🎁 20-Min Free Trial Included in All Plans
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">Select Your VoiceNotes AI Plan</h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">
              Every plan includes a 20-min free trial so you can experience AI transcription and smart notes risk-free before unlocking full access.
            </p>
          </div>

          {/* 6 PLANS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => {
              const isSelected = selectedPlan.name === plan.name;
              return (
                <div
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative rounded-3xl p-6 cursor-pointer transition-all flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      🔥 Most Popular Lifetime Deal
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {plan.duration}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-black text-slate-900">{plan.priceStr}</span>
                      <span className="text-xs text-slate-500">/{plan.duration === 'Lifetime' ? 'lifetime' : plan.duration.toLowerCase()}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 text-sm">
                      <div className="flex items-center space-x-2 text-blue-700 font-semibold bg-blue-50 p-2 rounded-xl border border-blue-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>🎁 20 Min Free Trial Included</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong className="text-slate-900">{plan.minutes}</strong> allocation</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Hinglish & Local Accents</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>AI Summaries & Action Items</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{isSelected ? '✓ Selected Plan' : 'Select Plan'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAYMENT & QR CODE CARD FOR SELECTED PLAN */}
          <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-300 space-y-6 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Selected Plan</span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedPlan.name} ({selectedPlan.priceStr})</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Audio Minutes</span>
                <p className="text-sm font-bold text-emerald-600">{selectedPlan.minutes}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Receiver: <strong className="text-slate-900">Rao Sahab</strong></span>
                <span className="font-mono text-blue-600">raos38908@okhdfcbank</span>
              </div>

              {/* Real Scannable UPI QR Code */}
              <div className="bg-slate-50 p-6 rounded-2xl shadow-inner flex flex-col items-center justify-center space-y-4 border border-slate-200">
                <div className="w-52 h-52 bg-white rounded-xl p-3 flex items-center justify-center relative shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={`upi://pay?pa=raos38908@okhdfcbank&pn=Rao%20Sahab&am=${selectedPlan.price}&cu=INR`}
                    size={180}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.svg",
                      x: undefined,
                      y: undefined,
                      height: 36,
                      width: 36,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-800 font-bold">Scan & Pay {selectedPlan.priceStr} via PhonePe, GPay, Paytm</p>
                  <p className="text-[11px] text-slate-500">Receiver: Rao Sahab (raos38908@okhdfcbank)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-600 font-medium block">UPI ID for Direct Transfer:</label>
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                  <code className="text-sm font-mono text-blue-600 font-bold">raos38908@okhdfcbank</code>
                  <button
                    onClick={handleCopyUpi}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Submit {selectedPlan.priceStr} Payment & Activate</span>
                <Send className="w-4 h-4" />
              </button>
              
              <a
                href={`https://wa.me/919034675743?text=Hi%20Rao%20Sahab,%20I%20have%20paid%20${encodeURIComponent(selectedPlan.priceStr)}%20for%20VoiceNotes%20AI%20(${encodeURIComponent(selectedPlan.name)}).%20Here%20is%20my%20UTR%20and%20details:`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* TESTIMONIALS SECTION */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                💬 Early Adopter Reviews
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">Loved by Founders, Students & Creators</h2>
              <p className="text-slate-600 text-sm">
                See what early beta testers are saying about VoiceNotes AI.
              </p>
            </div>
            <button
              onClick={() => setIsTestimonialModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow transition-all flex items-center space-x-2 shrink-0"
            >
              <Star className="w-4 h-4 text-amber-300 fill-current" />
              <span>✍️ Add Your Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-slate-200">
                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${t.bg}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm">Everything you need to know about the Pre-Sale Lifetime Deal.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">Q: How soon is my account activated after paying ₹1,999?</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Accounts are manually verified and activated within <strong className="text-blue-600">2 hours</strong> of submitting your UTR or messaging us on WhatsApp. You'll receive instant confirmation.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">Q: Does VoiceNotes AI support Hinglish and Indian accents?</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Yes! VoiceNotes AI is specifically fine-tuned for mixed Hindi-English (Hinglish), Indian terminology, regional accents, and fast technical meetings.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">Q: Are there any monthly or recurring charges?</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Zero recurring fees! This is an exclusive pre-sale lifetime access offer for the first 100 early adopters. Pay ₹1,999 once and use forever.
              </p>
            </div>
          </div>
        </div>

        {/* TRUST & GUARANTEE FOOTER */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-sm">
          <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Instant Manual Activation within 2 Hours | Direct VIP Onboarding Support</span>
          </div>
          <p className="text-slate-600 text-xs">
            Questions? Contact WhatsApp support at <strong className="text-slate-900">+91 9034675743</strong> or email support anytime.
          </p>
        </div>

      </div>

      {/* PAYMENT SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Payment Details</h3>
                <p className="text-xs text-slate-500">For instant activation of VoiceNotes AI Lifetime Access</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Submission Successful!</h4>
                <p className="text-slate-700 text-sm">
                  Thank you! We have logged your UTR and details. Your lifetime account will be activated within <strong className="text-blue-600">2 hours</strong>. We will also reach out via WhatsApp / Email.
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmitted(false);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow"
                >
                  Close & Explore App Demo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Email Address (for Account Login)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., +91 98765 43210"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">UTR / UPI Transaction ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 4235XXXXXXXX"
                    value={formData.utrNumber}
                    onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Submit & Claim Lifetime Access</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TESTIMONIAL SUBMISSION MODAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Your Review & Feedback</h3>
                <p className="text-xs text-slate-500">Share your experience with VoiceNotes AI</p>
              </div>
              <button
                onClick={() => setIsTestimonialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ananya Patel"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Your Role / Profession</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Startup Founder, Student, Developer"
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Rating (1 to 5 Stars)</label>
                <select
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value={5}>★★★★★ (5 Stars - Amazing)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Your Feedback / Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write what you love about VoiceNotes AI..."
                  value={newTestimonial.comment}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Publish Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
