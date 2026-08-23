import Link from 'next/link';

const upcoming = [
  { doctor: 'Dr. Maya Patel', date: 'Tue, 9:30 AM', status: 'Confirmed' },
  { doctor: 'Dr. Leo Nguyen', date: 'Thu, 2:00 PM', status: 'Pending' },
];

export default function PatientDashboardPage() {
  const calendarConnected = true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Google Calendar</h2>
          <div className="text-sm text-gray-600">
            {calendarConnected ? 'Connected and syncing appointments' : 'Not connected'}
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
          <div className="text-sm text-gray-500">Upcoming visits</div>
          <div className="mt-2 text-3xl font-bold">2</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Available doctors</div>
          <div className="mt-2 text-3xl font-bold">12</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Care reminders</div>
          <div className="mt-2 text-3xl font-bold">4</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming appointments</h2>
          <Link href="/patient/doctors" className="text-sm text-blue-600">Find a doctor</Link>
        </div>

        <div className="space-y-3">
          {upcoming.map((appt) => (
            <div key={appt.doctor} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{appt.doctor}</div>
                <div className="text-sm text-gray-500">{appt.date}</div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">{appt.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
