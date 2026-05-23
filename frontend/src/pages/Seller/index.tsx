import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Globe,
  Zap,
  Headphones,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Store,
  CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FormFields {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  gst: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

// ─── Data ─────────────────────────────────────────────────────────────────────

const benefits: BenefitCard[] = [
  {
    icon: <TrendingUp className="w-8 h-8" style={{ color: '#2874f0' }} />,
    title: 'Low Commission',
    description: 'Start at just 5% per sale — one of the lowest in the industry.',
  },
  {
    icon: <Globe className="w-8 h-8" style={{ color: '#2874f0' }} />,
    title: 'Massive Reach',
    description: 'Access to 200M+ active buyers across every corner of India.',
  },
  {
    icon: <Zap className="w-8 h-8" style={{ color: '#2874f0' }} />,
    title: 'Fast Payments',
    description: 'Get paid within 7 days of successful delivery — guaranteed.',
  },
  {
    icon: <Headphones className="w-8 h-8" style={{ color: '#2874f0' }} />,
    title: 'Seller Support',
    description: '24/7 dedicated account manager and seller helpdesk.',
  },
];

const heroStats: Stat[] = [
  { value: '1.5L+', label: 'Sellers' },
  { value: '200M+', label: 'Customers' },
  { value: '₹0', label: 'Setup Fee' },
];

const platformStats: Stat[] = [
  { value: '1,50,000+', label: 'Active Sellers' },
  { value: '₹1,200 Cr+', label: 'Monthly GMV' },
  { value: '500+', label: 'Cities Served' },
];

const steps: Step[] = [
  {
    number: 1,
    title: 'Register',
    description: 'Create your seller account in minutes — just your GST & bank details needed.',
  },
  {
    number: 2,
    title: 'List Products',
    description: 'Upload your catalog using our intuitive bulk-upload tool or one by one.',
  },
  {
    number: 3,
    title: 'Start Earning',
    description: 'Receive orders, ship fast, and watch your business grow every day.',
  },
];

const faqs: FaqItem[] = [
  {
    question: 'What is the commission structure?',
    answer:
      'Commission rates start as low as 5% and vary by category. Electronics may have different rates than fashion or home goods. You can find the full category-wise commission schedule in the Seller Hub after registration.',
  },
  {
    question: 'When will I receive payment for my orders?',
    answer:
      'Payments are processed within 7–10 business days after the buyer confirms delivery. For high-volume sellers, we offer accelerated payment cycles with as little as a 2-day settlement window.',
  },
  {
    question: 'Can I sell my own brand products?',
    answer:
      'Absolutely! We actively support homegrown brands. You can list under your own brand name, set up a branded store page, and even opt in to our Brand Amplifier Program for increased visibility.',
  },
  {
    question: 'Is there a registration fee?',
    answer:
      'No — registration is completely free. There are zero setup costs, no monthly subscription fees, and no hidden charges. You only pay a small commission when you make a sale.',
  },
  {
    question: 'How do I handle returns?',
    answer:
      'Our returns portal makes it easy — buyers initiate returns through their account, and you receive a pickup request. Items are quality-checked and returned to you. Refunds to buyers are handled automatically, and disputes can be raised via the Seller Hub.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{item.question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 flex-shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-500" />
        )}
      </button>

      <div
        id={`faq-answer-${index}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 py-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SellerPage() {
  // Form state
  const [form, setForm] = useState<FormFields>({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    gst: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
    // Reset form after success
    setForm({ fullName: '', businessName: '', email: '', phone: '', gst: '' });
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────── */}
      <section
        className="relative py-16 md:py-24 px-4 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2874f0 0%, #0d47a1 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-5 bg-white" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 rounded-full px-4 py-1.5 mb-6">
            <Store className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">ZlipKart Seller Program</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Sell on ZlipKart —{' '}
            <span className="text-yellow-300">Reach Crores of Customers</span>
          </h1>

          {/* Subline */}
          <p className="text-base md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join <strong className="text-white">1.5 lakh+</strong> sellers already growing their
            business on India's most trusted marketplace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="#register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm font-bold text-white text-sm shadow-lg hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              style={{ backgroundColor: '#fb641b' }}
            >
              Start Selling
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Learn More
            </a>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white bg-opacity-10 rounded-sm px-4 py-4 border border-white border-opacity-20"
              >
                <p className="text-2xl md:text-3xl font-extrabold text-yellow-300">{stat.value}</p>
                <p className="text-xs text-blue-100 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. BENEFITS SECTION ──────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Why Sell With Us?
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Everything you need to build, grow, and scale your online business — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((card) => (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow duration-200 cursor-default"
              >
                <div className="p-2 rounded-sm bg-blue-50">{card.icon}</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STATISTICS SECTION ────────────────────────────────────────────── */}
      <section className="py-14 px-4" style={{ backgroundColor: '#f1f3f6' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our Platform by the Numbers
            </h2>
            <p className="text-sm text-gray-500">Real scale. Real results. Real sellers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {platformStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-sm p-8 text-center hover:shadow-md transition-shadow duration-200"
              >
                <p
                  className="text-4xl md:text-5xl font-extrabold mb-2"
                  style={{ color: '#2874f0' }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm text-gray-500">
              Get from sign-up to first sale in as little as 48 hours.
            </p>
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                {/* Step Card */}
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  {/* Number circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl mb-4 shadow-md"
                    style={{ backgroundColor: '#2874f0' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (desktop only, between steps) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-sm font-bold text-white text-sm hover:brightness-110 transition-all duration-200"
              style={{ backgroundColor: '#2874f0' }}
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ACCORDION ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500">
              Got questions? We've got answers — and a seller support team ready to help.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <FaqAccordionItem key={idx} item={faq} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SELLER REGISTRATION FORM ──────────────────────────────────────── */}
      <section id="register" className="py-14 px-4" style={{ backgroundColor: '#f1f3f6' }}>
        <div className="max-w-xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            {/* Form header */}
            <div
              className="px-6 py-5 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #2874f0 0%, #0d47a1 100%)' }}
            >
              <div className="flex items-center gap-3">
                <Store className="w-6 h-6 text-white opacity-80" />
                <div>
                  <h2 className="text-lg font-bold text-white">Start Your Seller Journey</h2>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Fill in the details below — it takes less than 2 minutes.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-3 py-2.5 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                    errors.fullName
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma Electronics Pvt. Ltd."
                  className={`w-full px-3 py-2.5 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                    errors.businessName
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
                )}
              </div>

              {/* Email + Phone (side by side on md+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="priya@example.com"
                    className={`w-full px-3 py-2.5 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                      errors.email
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3 py-2.5 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                      errors.phone
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* GST Number (optional) */}
              <div>
                <label
                  htmlFor="gst"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  GST Number{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="gst"
                  name="gst"
                  type="text"
                  value={form.gst}
                  onChange={handleChange}
                  placeholder="GST1234567890Z"
                  maxLength={15}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors uppercase"
                />
                <p className="mt-1 text-xs text-gray-400">
                  You can add or update your GST details later from the Seller Hub.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-sm font-bold text-white text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 mt-2"
                style={{ backgroundColor: '#fb641b' }}
              >
                Apply to Sell
              </button>

              {/* Terms note */}
              <p className="text-center text-xs text-gray-400">
                By applying, you agree to our{' '}
                <Link
                  to="/terms"
                  className="underline hover:text-gray-600 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="underline hover:text-gray-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Success Toast */}
              {submitted && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-sm px-4 py-4 animate-pulse">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Application received!
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Our seller team will contact you within 24 hours. Welcome aboard!
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Zero Setup Cost' },
              { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'No Hidden Fees' },
              { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: '24/7 Support' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                {icon}
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA BAR ───────────────────────────────────────────────────── */}
      <div
        className="py-8 px-4 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #2874f0 0%, #0d47a1 100%)' }}
      >
        <p className="text-sm font-medium mb-1 text-blue-100">Ready to grow your business?</p>
        <h3 className="text-xl font-bold mb-4">Join 1,50,000+ successful sellers today.</h3>
        <a
          href="#register"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-sm font-bold text-white text-sm hover:brightness-110 transition-all duration-200"
          style={{ backgroundColor: '#fb641b' }}
        >
          Start Selling for Free
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
