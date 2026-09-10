import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, HelpCircle, BookOpen, MessageCircle, Mail, Phone, 
  Video, FileText, Search, ChevronRight, ExternalLink,
  Keyboard, Heart, CheckCircle
} from 'lucide-react';

const HelpSupportModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('guide');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const helpGuides = [
    {
      id: 'getting-started',
      title: t('help.guides.gettingStarted.title'),
      description: t('help.guides.gettingStarted.description'),
      items: [
        t('help.guides.gettingStarted.item1'),
        t('help.guides.gettingStarted.item2'),
        t('help.guides.gettingStarted.item3'),
        t('help.guides.gettingStarted.item4'),
      ],
    },
    {
      id: 'games',
      title: t('help.guides.games.title'),
      description: t('help.guides.games.description'),
      items: [
        t('help.guides.games.item1'),
        t('help.guides.games.item2'),
        t('help.guides.games.item3'),
        t('help.guides.games.item4'),
      ],
    },
    {
      id: 'voice',
      title: t('help.guides.voice.title'),
      description: t('help.guides.voice.description'),
      items: [
        t('help.guides.voice.item1'),
        t('help.guides.voice.item2'),
        t('help.guides.voice.item3'),
        t('help.guides.voice.item4'),
      ],
    },
    {
      id: 'reminders',
      title: t('help.guides.reminders.title'),
      description: t('help.guides.reminders.description'),
      items: [
        t('help.guides.reminders.item1'),
        t('help.guides.reminders.item2'),
        t('help.guides.reminders.item3'),
        t('help.guides.reminders.item4'),
      ],
    },
    {
      id: 'accessibility',
      title: t('help.guides.accessibility.title'),
      description: t('help.guides.accessibility.description'),
      items: [
        t('help.guides.accessibility.item1'),
        t('help.guides.accessibility.item2'),
        t('help.guides.accessibility.item3'),
        t('help.guides.accessibility.item4'),
      ],
    },
    {
      id: 'privacy',
      title: t('help.guides.privacy.title'),
      description: t('help.guides.privacy.description'),
      items: [
        t('help.guides.privacy.item1'),
        t('help.guides.privacy.item2'),
        t('help.guides.privacy.item3'),
        t('help.guides.privacy.item4'),
      ],
    },
  ];

  const faqs = [
    { q: t('help.faqs.q1'), a: t('help.faqs.a1') },
    { q: t('help.faqs.q2'), a: t('help.faqs.a2') },
    { q: t('help.faqs.q3'), a: t('help.faqs.a3') },
    { q: t('help.faqs.q4'), a: t('help.faqs.a4') },
    { q: t('help.faqs.q5'), a: t('help.faqs.a5') },
    { q: t('help.faqs.q6'), a: t('help.faqs.a6') },
    { q: t('help.faqs.q7'), a: t('help.faqs.a7') },
    { q: t('help.faqs.q8'), a: t('help.faqs.a8') },
  ];

  const shortcuts = [
    { keys: ['⌘', 'K'], desc: t('help.shortcuts.openSearch') },
    { keys: ['Ctrl', 'K'], desc: t('help.shortcuts.openSearchWindows') },
    { keys: ['Esc'], desc: t('help.shortcuts.closeModal') },
    { keys: ['↑', '↓'], desc: t('help.shortcuts.navigateResults') },
    { keys: ['Enter'], desc: t('help.shortcuts.selectResult') },
  ];

  const contacts = [
    {
      icon: Mail,
      label: t('help.contact.emailLabel'),
      value: t('help.contact.emailValue'),
      action: 'mailto:support@reminiplay.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      label: t('help.contact.phoneLabel'),
      value: t('help.contact.phoneValue'),
      action: 'tel:+9118001234567',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Video,
      label: t('help.contact.videoLabel'),
      value: t('help.contact.videoValue'),
      action: 'https://youtube.com',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: FileText,
      label: t('help.contact.docsLabel'),
      value: t('help.contact.docsValue'),
      action: 'https://docs.reminiplay.com',
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  const tabs = [
    { id: 'guide', label: t('help.tabs.guide'), icon: BookOpen },
    { id: 'faq', label: t('help.tabs.faq'), icon: MessageCircle },
    { id: 'shortcuts', label: t('help.tabs.shortcuts'), icon: Keyboard },
    { id: 'contact', label: t('help.tabs.contact'), icon: Mail },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-[28px] shadow-[0_25px_80px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700/50 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white overflow-hidden flex-shrink-0">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('help.title')}</h2>
                <p className="text-sm text-white/80">{t('help.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {t('help.welcome.title')}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {t('help.welcome.description')}
                    </p>
                  </div>
                </div>
              </div>

              {helpGuides.map((guide) => (
                <div 
                  key={guide.id} 
                  className="rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white">{guide.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {guide.description}
                    </p>
                  </div>
                  <ul className="p-4 space-y-2">
                    {guide.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-primary-500 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('help.faqs.searchPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all"
                />
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">{t('help.faqs.noResults')}</p>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => (
                  <details 
                    key={idx} 
                    className="group rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                  >
                    <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors flex items-center justify-between list-none">
                      <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 pb-3 pt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50 mt-1">
                      {faq.a}
                    </div>
                  </details>
                ))
              )}
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30 mb-4">
                <div className="flex items-start gap-3">
                  <Keyboard className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      {t('help.shortcuts.title')}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {t('help.shortcuts.description')}
                    </p>
                  </div>
                </div>
              </div>

              {shortcuts.map((s, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-gray-400 text-xs mx-0.5">+</span>}
                        <kbd className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {t('help.contact.heading')}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {t('help.contact.subheading')}
                    </p>
                  </div>
                </div>
              </div>

              {contacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={contact.action}
                  target={contact.action.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <contact.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{contact.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{contact.value}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('help.version')} • © 2025 ReminiPlay
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary-500/30"
          >
            {t('help.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;