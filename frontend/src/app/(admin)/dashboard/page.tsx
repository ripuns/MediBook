import Link from 'next/link';

const stats = [
  { label: 'Total Patients', value: '1,248', detail: '+12% this month' },
  { label: 'Active Doctors', value: '34', detail: '3 onboarding' },
  { label: 'Appointments', value: '482', detail: '92 confirmed' },
  { label: 'Revenue', value: '$24.8k', detail: '+8.4%' },
];

const recentActions = [
  'Dr. Maya Patel updated clinic availability.',
  '12 appointment reminders sent this morning.',
  '2 new doctor profiles pending approval.',
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="mt-2 text-3xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs text-green-600">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Operational Overview</h2>
            <Link href="/doctors" className="text-sm text-blue-600">View doctors</Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm text-gray-600">Bookings filled</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[72%] rounded bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm text-gray-600">No-show rate</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[14%] rounded bg-amber-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm text-gray-600">Follow-ups sent</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[86%] rounded bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {recentActions.map((item) => (
              <li key={item} className="border-b pb-2 last:border-0 last:pb-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
