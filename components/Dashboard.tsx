
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Member } from '../types';
import { ICONS, COLORS } from '../constants';

interface DashboardProps {
  members: Member[];
}

const Dashboard: React.FC<DashboardProps> = ({ members }) => {
  const stats = useMemo(() => {
    const total = members.length;
    const groupCounts: Record<string, number> = {};
    members.forEach(m => {
      groupCounts[m.group] = (groupCounts[m.group] || 0) + 1;
    });

    const groupData = Object.entries(groupCounts).map(([name, value]) => ({ name, value }));
    
    return { total, groupData };
  }, [members]);

  const PIE_COLORS = ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Registrados" value={stats.total} icon={ICONS.Users} accentColor="#b91c1c" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">Participación por Grupo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.groupData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }} />
                <Bar dataKey="value" fill="#b91c1c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">DISTRIBUCION IGLESIA</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.groupData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                  {stats.groupData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; accentColor: string }> = ({ title, value, icon, accentColor }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 transition-all hover:border-red-200 hover:shadow-lg group">
    <div className="p-4 rounded-2xl border border-slate-200 bg-gray-50 flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-100 transition-all" style={{ color: accentColor }}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
