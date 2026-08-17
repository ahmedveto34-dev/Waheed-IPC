import React, { useState } from 'react';
import { RoleResponsibility } from '../types';
import { Users, UserCheck, Check, Search } from 'lucide-react';

interface RolesSectionProps {
  roles: RoleResponsibility[];
}

export const RolesSection: React.FC<RolesSectionProps> = ({ roles }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = roles.filter(
    (r) =>
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.responsibilities.some((resp) => resp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
          3. المسؤوليات والأدوار (Roles & Responsibilities)
        </h2>

        {roles.length > 2 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="تصفية حسب الدور أو المسمى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pr-8 pl-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 w-48 sm:w-56 bg-slate-50"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoles.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5"
          >
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-200/70 pb-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-blue-900 font-bold">{item.role}</span>
            </div>

            <ul className="space-y-1.5">
              {item.responsibilities.map((resp, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-2xs">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="leading-relaxed font-medium">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
