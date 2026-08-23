import Link from 'next/link';

const doctors = [
  { id: 'dr-101', name: 'Dr. Maya Patel', specialty: 'Cardiology', status: 'Available', location: 'Downtown Clinic' },
  { id: 'dr-102', name: 'Dr. Leo Nguyen', specialty: 'Dermatology', status: 'Busy', location: 'North Wing' },
  { id: 'dr-103', name: 'Dr. Aisha Khan', specialty: 'Pediatrics', status: 'Available', location: 'Children Center' },
  { id: 'dr-104', name: 'Dr. Luis Gomez', specialty: 'Neurology', status: 'On leave', location: 'Research Campus' },
];

export default function AdminDoctorsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doctors</h2>
        <Link href="/admin/doctors/new" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Add Doctor
        </Link>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Specialty</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-xs text-gray-500">{doctor.id}</div>
                  </td>
                  <td className="px-4 py-3">{doctor.specialty}</td>
                  <td className="px-4 py-3">{doctor.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        doctor.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : doctor.status === 'Busy'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/doctors/${doctor.id}`} className="text-blue-600">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
