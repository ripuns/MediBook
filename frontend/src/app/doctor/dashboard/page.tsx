import Link from 'next/link';

const queue = [
  { id: 'apt-1001', patient: 'Riya Sharma', time: '09:30 AM', status: 'Checked in' },
  { id: 'apt-1002', patient: 'David Kim', time: '10:15 AM', status: 'Waiting' },
  { id: 'apt-1003', patient: 'Nina Jones', time: '11:00 AM', status: 'Pending summary' },
];

export default function DoctorDashboardPage() {
  const calendarConnected = true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Google Calendar</h2>
          <div className="text-sm text-gray-600">
            {calendarConnected ? 'Connected and syncing visit slots' : 'Not connected'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${calendarConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
            {calendarConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button type="button" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {calendarConnected ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Today&apos;s visits</div>
          <div className="mt-2 text-3xl font-bold">12</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pending summaries</div>
          <div className="mt-2 text-3xl font-bold">3</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Follow-ups</div>
          <div className="mt-2 text-3xl font-bold">8</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Patient queue</h2>
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.patient}</div>
                <div className="text-sm text-gray-500">{item.time}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{item.status}</span>
                <Link href={`/doctor/appointments/${item.id}`} className="text-sm text-blue-600">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
