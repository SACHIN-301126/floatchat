import React from 'react';
import { motion } from 'motion/react';
import { 
  Waves, 
  Database, 
  BarChart3, 
  MessageSquare, 
  Github, 
  Twitter, 
  Mail,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Activity
} from 'lucide-react';

interface FooterProps {
  user?: any;
  onContactClick?: () => void;
}

export function Footer({ user, onContactClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'ARGO Data Access', href: '#', icon: Database },
        { name: 'AI Insights', href: '#', icon: MessageSquare },
        { name: 'Ocean Analytics', href: '#', icon: BarChart3 },
        { name: 'Live Monitoring', href: '#', icon: Activity }
      ]
    },
    {
      title: 'Features',
      links: [
        { name: 'Global Ocean Data', href: '#', icon: Globe },
        { name: 'Real-time Analysis', href: '#', icon: Zap },
        { name: 'Voice Queries', href: '#', icon: MessageSquare },
        { name: 'Data Export', href: '#', icon: ExternalLink }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#', external: true },
        { name: 'API Reference', href: '#', external: true },
        { name: 'Research Papers', href: '#', external: true },
        { name: 'Ocean Data Guide', href: '#', external: true }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Support', href: '#', onClick: onContactClick },
        { name: 'Community Forum', href: '#', external: true },
        { name: 'Status Page', href: '#', external: true }
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Email', href: 'mailto:support@oceandata.ai', icon: Mail }
  ];

  return (
    <footer className="bg-dark-navy-darker border-t border-slate-600/30 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Waves className="w-8 h-8 text-cyan-teal" />
                <div className="absolute inset-0 animate-pulse">
                  <Waves className="w-8 h-8 text-cyan-teal/30" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white">OceanAI</h3>
                <p className="text-xs text-slate-400">Analytics Platform</p>
              </div>
            </motion.div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced ocean data analytics powered by AI, providing real-time insights 
              from ARGO float networks worldwide.
            </p>

            {/* Platform Stats */}
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Floats</span>
                <span className="text-cyan-teal font-medium">3,847</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Data Points</span>
                <span className="text-cyan-teal font-medium">2.3M+</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Global Coverage</span>
                <span className="text-emerald-400 font-medium">89%</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="space-y-4"
            >
              <h4 className="font-medium text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      onClick={link.onClick}
                      className="text-sm text-slate-400 hover:text-cyan-teal transition-colors duration-200 flex items-center gap-2 group cursor-pointer"
                      whileHover={{ x: 2 }}
                    >
                      {link.icon && (
                        <link.icon className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      )}
                      {link.name}
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      )}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* User Status & Live Data */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-slate-600/30"
          >
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Connected as {user.name}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {user.stats.totalChats} chats • {user.stats.dataQueriesCount} queries
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  System Healthy
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-teal" />
                  Secure Connection
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-slate-600/30 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass-card p-2 hover:bg-cyan-teal/10 transition-all duration-200 glow-hover group"
                title={social.name}
              >
                <social.icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-teal" />
              </motion.a>
            ))}
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>© {currentYear} OceanAI Analytics Platform</span>
              <div className="w-1 h-1 bg-slate-600 rounded-full hidden md:block"></div>
              <a href="#" className="hover:text-cyan-teal transition-colors">Privacy Policy</a>
              <div className="w-1 h-1 bg-slate-600 rounded-full hidden md:block"></div>
              <a href="#" className="hover:text-cyan-teal transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Technology Credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 pt-4 border-t border-slate-600/30 text-center"
        >
          <p className="text-xs text-slate-500">
            Powered by{' '}
            <span className="text-cyan-teal">ARGO Float Network</span> •{' '}
            <span className="text-cyan-teal">OpenAI</span> •{' '}
            <span className="text-cyan-teal">Supabase</span> •{' '}
            <span className="text-cyan-teal">React</span>
          </p>
        </motion.div>
      </div>

      {/* Ocean Wave Effect */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{
            x: [-100, 0, -100],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-teal/30 to-transparent"
        ></motion.div>
      </div>
    </footer>
  );
}