import { dashboardStore } from '@/lib/store/dashboard-store';

export default function DashboardSocialPage() {
  const items = dashboardStore.listSocialItems();

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard Social</h1>
        <p className="text-sm text-gray-600">Manage social item CRUD, ordering, and visibility states.</p>
      </header>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Add social item</h2>
        <form className="grid gap-3 md:grid-cols-2">
          <input name="platform" placeholder="Platform (e.g. GitHub)" className="rounded border px-3 py-2" />
          <input name="url" placeholder="https://github.com/your-handle" className="rounded border px-3 py-2" />
          <label className="md:col-span-2 grid gap-1">
            <span className="text-sm">Manual icon override upload</span>
            <input name="manualIconUpload" type="file" accept="image/*" className="rounded border px-3 py-2" />
          </label>
          <button type="button" className="w-fit rounded bg-black px-4 py-2 text-white">
            Create social item (wire to server action)
          </button>
        </form>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Current social items</h2>
        <ul className="space-y-2">
          {items.length === 0 ? <li className="text-sm text-gray-600">No social items yet.</li> : null}
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded border p-3">
              <div className="flex items-center gap-3">
                <img src={item.iconUrl} alt="" className="h-6 w-6 rounded" />
                <div>
                  <p className="font-medium">{item.platform}</p>
                  <p className="text-xs text-gray-600">{item.url}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">{item.isEnabled ? 'Enabled' : 'Disabled'}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
