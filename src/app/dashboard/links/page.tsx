import { dashboardStore } from '@/lib/store/dashboard-store';

export default function DashboardLinksPage() {
  const links = dashboardStore.listLinks();

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard Links</h1>
        <p className="text-sm text-gray-600">Manage link CRUD, ordering, and enable/disable states.</p>
      </header>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Add link</h2>
        <form className="grid gap-3 md:grid-cols-2">
          <input name="title" placeholder="Title" className="rounded border px-3 py-2" />
          <input name="url" placeholder="https://example.com" className="rounded border px-3 py-2" />
          <label className="md:col-span-2 grid gap-1">
            <span className="text-sm">Manual icon override upload</span>
            <input name="manualIconUpload" type="file" accept="image/*" className="rounded border px-3 py-2" />
          </label>
          <button type="button" className="w-fit rounded bg-black px-4 py-2 text-white">
            Create link (wire to server action)
          </button>
        </form>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Current links</h2>
        <ul className="space-y-2">
          {links.length === 0 ? <li className="text-sm text-gray-600">No links yet.</li> : null}
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between rounded border p-3">
              <div className="flex items-center gap-3">
                <img src={link.iconUrl} alt="" className="h-6 w-6 rounded" />
                <div>
                  <p className="font-medium">{link.title}</p>
                  <p className="text-xs text-gray-600">{link.url}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">{link.isEnabled ? 'Enabled' : 'Disabled'}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
