// src/pages/customer/home/Contact.jsx
import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  // spring mount
  const springs = useSpring({
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 30 },
  });

  return (
    <animated.section style={springs} className="bg-[hsl(210 , 40% , 98%)] px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        {/* left – info */}
        <div className="space-y-8">
          <h2 className="text-4xl font-black text-indigo-700 md:text-5xl">Get in touch</h2>
          <p className="text-gray-600">Questions, partnerships, or feedback/reach out directly.</p>

          <div className="space-y-4">
            <a href="mailto:hello@compatx.com" className="flex items-center gap-3 rounded-xl bg-violet-100 p-4 text-indigo-700 shadow-sm hover:bg-violet-200 transition">
              <Mail size={20} />
              <span className="font-medium">CompatXBuisness@gmail.com</span>
            </a>
            <a href="tel:+911234567890" className="flex items-center gap-3 rounded-xl bg-violet-100 p-4 text-indigo-700 shadow-sm hover:bg-violet-200 transition">
              <Phone size={20} />
              <span className="font-medium">+91 8879342852</span>
            </a>
            <div className="flex items-center gap-3 rounded-xl bg-violet-100 p-4 text-indigo-700">
              <MapPin size={20} />
              <span className="font-medium">Mumbai, India</span>
            </div>
          </div>
        </div>

        {/* right – form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message"
            required
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white shadow-md hover:bg-indigo-800 transition"
          >
            <Send size={18} />
            {sent ? 'Sent ✓' : 'Send Message'}
          </button>
        </form>
      </div>
    </animated.section>
  );
}