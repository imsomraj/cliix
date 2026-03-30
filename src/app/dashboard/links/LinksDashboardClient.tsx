'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ZodError } from 'zod';

import {
  createLinkAction,
  deleteLinkAction,
  reorderLinksAction,
  setLinkEnabledAction,
  updateLinkAction,
} from '@/app/dashboard/actions';
import type { DashboardLink } from '@/lib/repositories/dashboard-repository';
import { createLinkSchema, updateLinkSchema } from '@/lib/validation/dashboard';

type CreateLinkFormValues = {
  title: string;
  url: string;
  manualIconUrl: string;
  isEnabled: boolean;
};

type EditLinkFormValues = {
  title: string;
  url: string;
  manualIconUrl: string;
};

function zodMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Validation failed.';
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function LinksDashboardClient({ initialLinks }: { initialLinks: DashboardLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const createForm = useForm<CreateLinkFormValues>({
    defaultValues: {
      title: '',
      url: '',
      manualIconUrl: '',
      isEnabled: true,
    },
  });

  const editForm = useForm<EditLinkFormValues>({
    defaultValues: {
      title: '',
      url: '',
      manualIconUrl: '',
    },
  });

  const sortedLinks = [...links].sort((a, b) => a.position - b.position);

  const onCreate = createForm.handleSubmit(async (rawValues) => {
    setFeedback(null);

    try {
      const payload = createLinkSchema.parse({
        ...rawValues,
        manualIconUrl: rawValues.manualIconUrl.trim() || undefined,
      });

      const created = await createLinkAction(payload);
      setLinks((current) => [...current, created]);
      createForm.reset({
        title: '',
        url: '',
        manualIconUrl: '',
        isEnabled: true,
      });
      setFeedback({ type: 'success', message: `Created “${created.title}”.` });
    } catch (error) {
      setFeedback({ type: 'error', message: `Create failed: ${zodMessage(error)}` });
    }
  });

  const startEdit = (link: DashboardLink) => {
    setEditingId(link.id);
    editForm.reset({
      title: link.title,
      url: link.url,
      manualIconUrl: link.manualIconUrl ?? '',
    });
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset({ title: '', url: '', manualIconUrl: '' });
  };

  const saveEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) {
      return;
    }

    const previous = links;

    try {
      const parsed = updateLinkSchema.parse({
        id: editingId,
        title: values.title,
        url: values.url,
        manualIconUrl: values.manualIconUrl.trim() || undefined,
      });

      setLinks((current) =>
        current.map((link) =>
          link.id === editingId
            ? {
                ...link,
                title: parsed.title ?? link.title,
                url: parsed.url ?? link.url,
                manualIconUrl: parsed.manualIconUrl ?? null,
              }
            : link,
        ),
      );

      const updated = await updateLinkAction(parsed);
      setLinks((current) => current.map((link) => (link.id === updated.id ? updated : link)));
      setEditingId(null);
      setFeedback({ type: 'success', message: `Updated “${updated.title}”.` });
    } catch (error) {
      setLinks(previous);
      setFeedback({ type: 'error', message: `Update failed: ${zodMessage(error)}` });
    }
  });

  const removeLink = async (id: string) => {
    const previous = links;
    const target = links.find((item) => item.id === id);

    if (!target) {
      return;
    }

    setFeedback(null);

    const nextList = previous
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));

    setLinks(nextList);

    try {
      await deleteLinkAction({ id });
      setFeedback({ type: 'success', message: `Deleted “${target.title}”.` });
    } catch (error) {
      setLinks(previous);
      setFeedback({ type: 'error', message: `Delete failed: ${zodMessage(error)}` });
    }
  };

  const toggleEnabled = async (id: string, isEnabled: boolean) => {
    const previous = links;

    setLinks((current) => current.map((item) => (item.id === id ? { ...item, isEnabled } : item)));

    try {
      const updated = await setLinkEnabledAction({ id, isEnabled });
      setLinks((current) => current.map((item) => (item.id === id ? updated : item)));
      setFeedback({
        type: 'success',
        message: `Link ${updated.isEnabled ? 'enabled' : 'disabled'}: “${updated.title}”.`,
      });
    } catch (error) {
      setLinks(previous);
      setFeedback({ type: 'error', message: `Status change failed: ${zodMessage(error)}` });
    }
  };

  const reorder = async (id: string, direction: 'up' | 'down') => {
    const previous = sortedLinks;
    const index = previous.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= previous.length) {
      return;
    }

    const reordered = [...previous];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const optimistic = reordered.map((item, position) => ({ ...item, position }));
    setLinks(optimistic);

    try {
      await reorderLinksAction({
        items: optimistic.map(({ id: linkId, position }) => ({ id: linkId, position })),
      });
      setFeedback({ type: 'success', message: 'Link order updated.' });
    } catch (error) {
      setLinks(previous);
      setFeedback({ type: 'error', message: `Reorder failed: ${zodMessage(error)}` });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard Links</h1>
        <p className="text-sm text-gray-600">Manage link CRUD, ordering, and enable/disable states.</p>
      </header>

      {feedback ? (
        <p
          className={`rounded border px-3 py-2 text-sm ${
            feedback.type === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Add link</h2>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <input {...createForm.register('title')} placeholder="Title" className="rounded border px-3 py-2" />
          <input {...createForm.register('url')} placeholder="https://example.com" className="rounded border px-3 py-2" />
          <input
            {...createForm.register('manualIconUrl')}
            placeholder="Manual icon URL (optional)"
            className="rounded border px-3 py-2 md:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" {...createForm.register('isEnabled')} />
            Enabled
          </label>
          <button type="submit" className="w-fit rounded bg-black px-4 py-2 text-white" disabled={createForm.formState.isSubmitting}>
            {createForm.formState.isSubmitting ? 'Creating...' : 'Create link'}
          </button>
        </form>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Current links</h2>
        <ul className="space-y-2">
          {sortedLinks.length === 0 ? <li className="text-sm text-gray-600">No links yet.</li> : null}
          {sortedLinks.map((link, index) => {
            const isEditing = editingId === link.id;

            return (
              <li key={link.id} className="space-y-3 rounded border p-3">
                {isEditing ? (
                  <form onSubmit={saveEdit} className="grid gap-2 md:grid-cols-2">
                    <input {...editForm.register('title')} className="rounded border px-3 py-2" />
                    <input {...editForm.register('url')} className="rounded border px-3 py-2" />
                    <input
                      {...editForm.register('manualIconUrl')}
                      placeholder="Manual icon URL (optional)"
                      className="rounded border px-3 py-2 md:col-span-2"
                    />
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" className="rounded bg-black px-3 py-1.5 text-white" disabled={editForm.formState.isSubmitting}>
                        Save
                      </button>
                      <button type="button" className="rounded border px-3 py-1.5" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={link.iconUrl} alt="" className="h-6 w-6 rounded" />
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-xs text-gray-600">{link.url}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{link.isEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                )}

                {!isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => startEdit(link)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      onClick={() => toggleEnabled(link.id, !link.isEnabled)}
                    >
                      {link.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => removeLink(link.id)}>
                      Delete
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      disabled={index === 0}
                      onClick={() => reorder(link.id, 'up')}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      disabled={index === sortedLinks.length - 1}
                      onClick={() => reorder(link.id, 'down')}
                    >
                      Move down
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
