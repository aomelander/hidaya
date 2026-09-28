"use client";

import React, { useState } from 'react';
import { X, ShieldCheck, Check, AlertCircle, FileText, ExternalLink, Filter } from 'lucide-react';
import { Language } from '../types';
import { LICENSE_REGISTRY } from '../data/licenseRegistry';

interface LicenseRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const LicenseRegistryModal: React.FC<LicenseRegistryModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEntries =
    filterType === 'all'
      ? LICENSE_REGISTRY
      : LICENSE_REGISTRY.filter((e) => e.contentType === filterType);

  const t = {
    en: {
      title: 'Content License & Theological Audit Registry',
      subtitle: 'Complete transparency on scripture sources, translation rights, exegesis, and legal compliance.',
      coreRuleTitle: 'Our Sacred Data Principle',
      coreRuleText:
        'Never invent Quranic Arabic. Never guess or hallucinate verse associations. Never scrape unverified internet sources. Always maintain source → copyright → license → permitted use.',
      filterAll: 'All Sources',
      colSource: 'Source & Authority',
      colType: 'Content Type',
      colLicense: 'License & Rights',
      colPermissions: 'Permissions Matrix',
      colAudit: 'Verification Audit',
      display: 'Display',
      store: 'Store',
      export: 'Export',
      close: 'Close Registry',
    },
    sv: {
      title: 'Innehållslicenser & Teologiskt Granskningsregister',
      subtitle: 'Fullständig transparens kring skriftkällor, översättningsrättigheter, exeges och juridisk efterlevnad.',
      coreRuleTitle: 'Vår orubbliga dataprincip',
      coreRuleText:
        'Uppfinn aldrig arabisk Quran-text. Gissa eller hallucinera aldrig verskopplingar. Skrapa aldrig overifierat material från internet. Kontrollera alltid källa → upphovsrätt → licens → tillåten användning.',
      filterAll: 'Alla källor',
      colSource: 'Källa & Institution',
      colType: 'Innehållstyp',
      colLicense: 'Licens & Villkor',
      colPermissions: 'Rättighetsmatris',
      colAudit: 'Verifieringsgranskning',
      display: 'Visa',
      store: 'Lagra',
      export: 'Exportera',
      close: 'Stäng register',
    },
    fr: {
      title: 'Registre des Licences & Audit Théologique',
      subtitle: 'Transparence totale sur les sources scripturaires, les droits de traduction, l\'exégèse et la conformité légale.',
      coreRuleTitle: 'Notre principe éthique fondamental',
      coreRuleText:
        'Ne jamais inventer le texte coranique. Ne jamais halluciner de correspondances. Ne jamais copier de contenu non vérifié. Toujours vérifier la chaîne : source → copyright → licence → utilisation autorisée.',
      filterAll: 'Toutes les sources',
      colSource: 'Source & Autorité',
      colType: 'Type de contenu',
      colLicense: 'Licence & Droits',
      colPermissions: 'Matrice d\'autorisations',
      colAudit: 'Audit de vérification',
      display: 'Afficher',
      store: 'Stocker',
      export: 'Exporter',
      close: 'Fermer le registre',
    },
  }[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-registry-title"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#071813] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="license-registry-title" className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Sacred Data Principle Banner */}
          <div className="p-4 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-800/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.coreRuleTitle}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {t.coreRuleText}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {['all', 'Quran Text', 'Translation', 'Tafsir', 'Audio Recitation'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-emerald-900/30 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 hover:bg-emerald-50'
                }`}
              >
                {type === 'all' ? t.filterAll : type}
              </button>
            ))}
          </div>

          {/* Registry Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/20 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-emerald-800/40 bg-slate-50/80 dark:bg-emerald-900/40 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4">{t.colSource}</th>
                  <th className="py-3 px-3">{t.colType}</th>
                  <th className="py-3 px-3">{t.colLicense}</th>
                  <th className="py-3 px-3 text-center">{t.colPermissions}</th>
                  <th className="py-3 px-4">{t.colAudit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-emerald-900/20 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-emerald-950 dark:text-emerald-100">{item.sourceName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sourceOrg}</div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">{item.language}</div>
                    </td>
                    <td className="py-3.5 px-3 align-top whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {item.contentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{item.license}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 leading-snug">
                        {item.attributionRule}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <div className="flex items-center justify-center gap-1.5 text-[10px]">
                        <span
                          title={`${t.display}: ${item.canDisplay ? 'Allowed' : 'Prohibited'}`}
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            item.canDisplay
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Disp {item.canDisplay ? '✓' : '✗'}
                        </span>
                        <span
                          title={`${t.store}: ${item.canStore ? 'Allowed' : 'Prohibited'}`}
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            item.canStore
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          Store {item.canStore ? '✓' : '✗'}
                        </span>
                        <span
                          title={`${t.export}: ${item.canExport ? 'Allowed' : 'Prohibited'}`}
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            item.canExport
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Exp {item.canExport ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {item.verificationAudit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audited for academic integrity & digital waqf non-commercial distribution.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
