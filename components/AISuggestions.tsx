
import React, { useEffect, useState } from 'react';
import { Member } from '../types';
import { getPastoralInsights } from '../services/geminiService';
import { ICONS } from '../constants';

interface AISuggestionsProps {
  member: Member;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ member }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{
    ministryMatches: string[];
    pastoralSteps: string[];
    biblicalEncouragement: string;
  } | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    const data = await getPastoralInsights(member);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [member]);

  if (loading) {
    return (
      <div className="bg-gray-100 p-6 rounded-3xl border border-slate-200 animate-pulse flex flex-col items-center justify-center space-y-4 min-h-[220px]">
        <div className="text-blue-600">{ICONS.AI}</div>
        <p className="text-slate-500 font-bold text-sm text-center">Analizando el espíritu de servicio de {member.firstName}...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gray-100 p-6 rounded-3xl border border-slate-300 space-y-6 shadow-sm">
      <div className="flex items-center gap-3 text-blue-700 pb-4 border-b border-slate-200">
        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          {ICONS.AI}
        </div>
        <h3 className="font-black uppercase tracking-widest text-sm">Guía Pastoral IA</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Vocación Sugerida</h4>
          <div className="flex flex-wrap gap-2">
            {insights.ministryMatches.map((m, i) => (
              <span key={i} className="px-4 py-1.5 bg-white rounded-xl text-xs font-bold text-blue-700 border border-slate-200 shadow-sm">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Pasos Pastorales</h4>
          <ul className="space-y-3">
            {insights.pastoralSteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start text-xs font-medium text-slate-700 bg-white/50 p-3 rounded-xl border border-slate-200">
                <span className="mt-0.5 flex-shrink-0 text-blue-500">{ICONS.ChevronRight}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm italic text-slate-500 leading-relaxed font-serif bg-white p-4 rounded-2xl border border-slate-200">
            "{insights.biblicalEncouragement}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
