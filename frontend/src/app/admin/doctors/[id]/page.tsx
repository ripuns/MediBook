import Link from 'next/link';

const doctor = {
  id: 'dr-101',
  name: 'Dr. Maya Patel',
  specialty: 'Cardiology',
  email: 'maya.patel@medibook.health',
  clinic: 'Downtown Clinic',
  status: 'Available',
  nextSlots: ['Mon 09:00', 'Tue 11:30', 'Wed 14:00', 'Thu 10:00'],
};

export default function DoctorProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{doctor.name}</h2>
            <div className="text-sm text-gray-600">{doctor.specialty}</div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">{doctor.status}</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div>{doctor.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Clinic</div>
            <div>{doctor.clinic}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Upcoming Availability</h3>
          <Link href="/admin/doctors" className="text-sm text-blue-600">Back to list</Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {doctor.nextSlots.map((slot) => (
            <div key={slot} className="rounded border bg-slate-50 px-3 py-2 text-sm">
              {slot}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
