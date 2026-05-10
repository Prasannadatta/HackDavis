import { UserPlus, PhoneCall, ShieldCheck, ShieldAlert, Clock } from 'lucide-react'

const FAMILY_MEMBERS = [
  {
    id: 'fam_001',
    name: 'Mom',
    phone: '+1 (530) 204-8096',
    callCount: 4,
    scamsBlocked: 2,
    lastSeen: 'Today, 11:25 AM',
    protected: true,
    lastScam: 'IRS Impersonation',
  },
  {
    id: 'fam_002',
    name: 'Grandpa Joe',
    phone: '+1 (916) 555-0147',
    callCount: 7,
    scamsBlocked: 3,
    lastSeen: 'Yesterday, 3:40 PM',
    protected: true,
    lastScam: 'Gift Card Scam',
  },
  {
    id: 'fam_003',
    name: 'Aunt Rita',
    phone: '+1 (415) 555-0293',
    callCount: 2,
    scamsBlocked: 0,
    lastSeen: 'May 8, 9:10 AM',
    protected: true,
    lastScam: null,
  },
]

export default function Family() {
  return (
    <div className="p-8 h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Family</h1>
        <p className="text-sm text-stone-400 mt-1">Monitor call protection across your family members</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left — member list */}
        <div className="xl:col-span-2 space-y-4">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Linked Members</p>

          {FAMILY_MEMBERS.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-stone-100 shadow-soft p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-sage-100 rounded-full flex items-center justify-center font-bold text-sage-700 text-base shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{member.name}</p>
                    <p className="text-xs text-stone-400">{member.phone}</p>
                  </div>
                </div>

                {/* Protection badge */}
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                  member.protected ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-stone-100 text-stone-400'
                }`}>
                  <ShieldCheck size={11} />
                  Protected
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-stone-50 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-lg font-extrabold text-stone-800">{member.callCount}</p>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mt-0.5">Total Calls</p>
                </div>
                <div className={`rounded-xl px-3 py-2.5 text-center ${member.scamsBlocked > 0 ? 'bg-red-50' : 'bg-stone-50'}`}>
                  <p className={`text-lg font-extrabold ${member.scamsBlocked > 0 ? 'text-red-600' : 'text-stone-800'}`}>
                    {member.scamsBlocked}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mt-0.5">Scams Blocked</p>
                </div>
                <div className="bg-stone-50 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-lg font-extrabold text-stone-800">
                    {member.callCount > 0 ? `${Math.round((member.scamsBlocked / member.callCount) * 100)}%` : '—'}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mt-0.5">Scam Rate</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Clock size={11} />
                  Last active: {member.lastSeen}
                </div>
                {member.lastScam ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                    <ShieldAlert size={11} />
                    Last: {member.lastScam}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-sage-600 font-semibold">
                    <ShieldCheck size={11} />
                    No scams detected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right — summary + invite */}
        <div className="space-y-4">

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-soft p-5">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Family Summary</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Members protected</span>
                <span className="text-sm font-bold text-stone-800">{FAMILY_MEMBERS.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Total calls monitored</span>
                <span className="text-sm font-bold text-stone-800">
                  {FAMILY_MEMBERS.reduce((a, m) => a + m.callCount, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Scams blocked</span>
                <span className="text-sm font-bold text-red-600">
                  {FAMILY_MEMBERS.reduce((a, m) => a + m.scamsBlocked, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Invite CTA */}
          <div className="bg-cream-100 rounded-2xl border border-cream-300 border-dashed p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center mb-3">
              <UserPlus size={18} className="text-sage-600" />
            </div>
            <h3 className="text-sm font-bold text-stone-800 mb-1">Add a family member</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-5">
              Send an invite link so they can join your family dashboard and get protected.
            </p>
            <button
              disabled
              className="bg-sage-500 text-white text-xs font-bold px-5 py-2.5 rounded-full opacity-50 cursor-not-allowed w-full"
              title="Coming soon"
            >
              Send Invite Link
            </button>
            <p className="text-[10px] text-stone-400 mt-2">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
