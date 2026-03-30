'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ZodError } from 'zod';

import {
  createSocialItemAction,
  deleteSocialItemAction,
  reorderSocialItemsAction,
  setSocialItemEnabledAction,
  updateSocialItemAction,
} from '@/app/dashboard/actions';
import type { SocialItem } from '@/lib/repositories/dashboard-repository';
import { createSocialItemSchema, updateSocialItemSchema } from '@/lib/validation/dashboard';

type CreateSocialFormValues = {
  platform: string;
  url: string;
  manualIconUrl: string;
  isEnabled: boolean;
};

type EditSocialFormValues = {
  platform: string;
  url: string;
  manualIconUrl: string;
};

function zodMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Validation failed.';
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function SocialDashboardClient({ initialItems }: { initialItems: SocialItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const createForm = useForm<CreateSocialFormValues>({
    defaultValues: {
      platform: '',
      url: '',
      manualIconUrl: '',
      isEnabled: true,
    },
  });

  const editForm = useForm<EditSocialFormValues>({
    defaultValues: {
      platform: '',
      url: '',
      manualIconUrl: '',
    },
  });

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  const onCreate = createForm.handleSubmit(async (rawValues) => {
    setFeedback(null);

    try {
      const payload = createSocialItemSchema.parse({
        ...rawValues,
        manualIconUrl: rawValues.manualIconUrl.trim() || undefined,
      });

      const created = await createSocialItemAction(payload);
      setItems((current) => [...current, created]);
      createForm.reset({ platform: '', url: '', manualIconUrl: '', isEnabled: true });
      setFeedback({ type: 'success', message: `Created “${created.platform}”.` });
    } catch (error) {
      setFeedback({ type: 'error', message: `Create failed: ${zodMessage(error)}` });
    }
  });

  const startEdit = (item: SocialItem) => {
    setEditingId(item.id);
    editForm.reset({
      platform: item.platform,
      url: item.url,
      manualIconUrl: item.manualIconUrl ?? '',
    });
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset({ platform: '', url: '', manualIconUrl: '' });
  };

  const saveEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) {
      return;
    }

    const previous = items;

    try {
      const payload = updateSocialItemSchema.parse({
        id: editingId,
        platform: values.platform,
        url: values.url,
        manualIconUrl: values.manualIconUrl.trim() || undefined,
      });

      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                platform: payload.platform ?? item.platform,
                url: payload.url ?? item.url,
                manualIconUrl: payload.manualIconUrl ?? null,
              }
            : item,
        ),
      );

      const updated = await updateSocialItemAction(payload);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditingId(null);
      setFeedback({ type: 'success', message: `Updated “${updated.platform}”.` });
    } catch (error) {
      setItems(previous);
      setFeedback({ type: 'error', message: `Update failed: ${zodMessage(error)}` });
    }
  });

  const removeItem = async (id: string) => {
    const previous = items;
    const target = items.find((item) => item.id === id);

    if (!target) {
      return;
    }

    const nextList = previous
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));

    setItems(nextList);

    try {
      await deleteSocialItemAction({ id });
      setFeedback({ type: 'success', message: `Deleted “${target.platform}”.` });
    } catch (error) {
      setItems(previous);
      setFeedback({ type: 'error', message: `Delete failed: ${zodMessage(error)}` });
    }
  };

  const toggleEnabled = async (id: string, isEnabled: boolean) => {
    const previous = items;

    setItems((current) => current.map((item) => (item.id === id ? { ...item, isEnabled } : item)));

    try {
      const updated = await setSocialItemEnabledAction({ id, isEnabled });
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      setFeedback({
        type: 'success',
        message: `${updated.platform} ${updated.isEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      setItems(previous);
      setFeedback({ type: 'error', message: `Status change failed: ${zodMessage(error)}` });
    }
  };

  const reorder = async (id: string, direction: 'up' | 'down') => {
    const previous = sortedItems;
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
    setItems(optimistic);

    try {
      await reorderSocialItemsAction({
        items: optimistic.map(({ id: itemId, position }) => ({ id: itemId, position })),
      });
      setFeedback({ type: 'success', message: 'Social item order updated.' });
    } catch (error) {
      setItems(previous);
      setFeedback({ type: 'error', message: `Reorder failed: ${zodMessage(error)}` });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard Social</h1>
        <p className="text-sm text-gray-600">Manage social item CRUD, ordering, and visibility states.</p>
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
        <h2 className="mb-3 text-lg font-medium">Add social item</h2>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <input {...createForm.register('platform')} placeholder="Platform (e.g. GitHub)" className="rounded border px-3 py-2" />
          <input {...createForm.register('url')} placeholder="https://github.com/your-handle" className="rounded border px-3 py-2" />
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
            {createForm.formState.isSubmitting ? 'Creating...' : 'Create social item'}
          </button>
        </form>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-medium">Current social items</h2>
        <ul className="space-y-2">
          {sortedItems.length === 0 ? <li className="text-sm text-gray-600">No social items yet.</li> : null}
          {sortedItems.map((item, index) => {
            const isEditing = editingId === item.id;

            return (
              <li key={item.id} className="space-y-3 rounded border p-3">
                {isEditing ? (
                  <form onSubmit={saveEdit} className="grid gap-2 md:grid-cols-2">
                    <input {...editForm.register('platform')} className="rounded border px-3 py-2" />
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
                      <img src={item.iconUrl} alt="" className="h-6 w-6 rounded" />
                      <div>
                        <p className="font-medium">{item.platform}</p>
                        <p className="text-xs text-gray-600">{item.url}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{item.isEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                )}

                {!isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      onClick={() => toggleEnabled(item.id, !item.isEnabled)}
                    >
                      {item.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" className="rounded border px-2 py-1 text-sm" onClick={() => removeItem(item.id)}>
                      Delete
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      disabled={index === 0}
                      onClick={() => reorder(item.id, 'up')}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-sm"
                      disabled={index === sortedItems.length - 1}
                      onClick={() => reorder(item.id, 'down')}
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
