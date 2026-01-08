/**
 * ContactPage Component
 *
 * Contact page with:
 * - Contact form
 * - Company information
 * - FAQ quick links
 * - Support options
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  FileText,
  Loader2,
  CheckCircle,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { showError } from '@/components/ui/toast';

// ==========================================
// VALIDATION
// ==========================================

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'press', label: 'Press & Media' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
];

const quickLinks = [
  { icon: HelpCircle, title: 'FAQ', description: 'Find answers to common questions', link: '/faq' },
  { icon: FileText, title: 'Documentation', description: 'Guides for providers and clients', link: '/how-it-works' },
  { icon: MessageSquare, title: 'Community', description: 'Join discussions and get tips', link: '/blog' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const selectedSubject = watch('subject');

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Contact form submitted:', data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      showError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mint to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Message Sent!</h1>
          <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
            <Button asChild><Link to={ROUTES.HOME}>Back to Home</Link></Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint via-mint/50 to-white py-16 lg:py-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />
        <div className="container px-4 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-cyan-500 text-white mb-4"><Mail className="h-4 w-4 mr-1" />Contact Us</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6">We'd Love to Hear From You</h1>
            <p className="text-lg text-muted-foreground">Have questions, feedback, or need support? Our team is here to help.</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input id="name" placeholder="John Doe" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={selectedSubject} onValueChange={(value) => setValue('subject', value)}>
                        <SelectTrigger className={errors.subject ? 'border-red-500' : ''}><SelectValue placeholder="Select a subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (<SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" placeholder="How can we help you?" rows={6} {...register('message')} className={errors.message ? 'border-red-500' : ''} />
                      {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>) : (<><Send className="h-4 w-4 mr-2" />Send Message</>)}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600"><Mail className="h-5 w-5" /></div>
                    <div><p className="font-medium">Email</p><a href="mailto:support@bookme.com" className="text-sm text-muted-foreground hover:text-cyan-600">support@bookme.com</a></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600"><Clock className="h-5 w-5" /></div>
                    <div><p className="font-medium">Response Time</p><p className="text-sm text-muted-foreground">Usually within 24 hours</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600"><MapPin className="h-5 w-5" /></div>
                    <div><p className="font-medium">Location</p><p className="text-sm text-muted-foreground">San Francisco, CA</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Follow Us</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-cyan-100 hover:text-cyan-600 transition-colors"><Twitter className="h-5 w-5" /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-cyan-100 hover:text-cyan-600 transition-colors"><Linkedin className="h-5 w-5" /></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-cyan-100 hover:text-cyan-600 transition-colors"><Facebook className="h-5 w-5" /></a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Resources</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {quickLinks.map((item) => (
                    <Link key={item.title} to={item.link} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600"><item.icon className="h-4 w-4" /></div>
                      <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;