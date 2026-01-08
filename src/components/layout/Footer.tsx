/**
 * Footer Component - ENHANCED VERSION
 *
 * Comprehensive footer with:
 * - Newsletter subscription
 * - Multiple navigation columns
 * - Social media links
 * - Trust badges
 * - Legal links
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  Award,
  CheckCircle,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { Button, Input, Separator } from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';

// ==========================================
// COMPONENT
// ==========================================

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess('Thanks for subscribing! Check your email for confirmation.');
      setEmail('');
    } catch (error) {
      showError('Something went wrong. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">
              Stay Updated with BookMe
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest updates on new features, provider tips, and exclusive offers.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {isSubscribing ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              No spam, unsubscribe at any time. Read our{' '}
              <Link to="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-bold text-lg">
                B
              </div>
              <span className="font-bold text-2xl">
                Book<span className="text-cyan-400">Me</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              The free appointment booking platform connecting clients with verified
              service providers. Simple, fast, and always free.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-5 w-5 text-green-400" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Award className="h-5 w-5 text-amber-400" />
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span>100% Free</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">For Clients</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  to={ROUTES.SEARCH}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Find a Provider
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-cyan-400 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-cyan-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">For Providers</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  to={ROUTES.REGISTER}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Join as Provider
                </Link>
              </li>
              <li>
                <Link
                  to="/for-providers"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Why BookMe?
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Compare Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/provider-resources"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Resources & Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-cyan-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Press Kit
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {currentYear} BookMe. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-cyan-400 transition-colors">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="hover:text-cyan-400 transition-colors">
                Accessibility
              </Link>
            </div>

            {/* Made with love */}
            <p className="text-sm text-gray-400">
              Made with ❤️ by Fonou Tech
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;