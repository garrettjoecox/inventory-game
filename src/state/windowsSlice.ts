import { createEntityAdapter, createSlice, EntityId, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { AppState } from '.';

export type WindowType = 'bag';

export interface Window {
  id: string;
  title: string;
  type: WindowType;
  focusedAt: number;
  params: { [key: string]: any };
}

const windowsAdapter = createEntityAdapter<Window>({
  selectId: window => window.id,
  sortComparer: (a, b) => a.focusedAt - b.focusedAt,
});

export const {
  selectById: selectWindowById,
  selectIds: selectWindowIds,
  selectEntities: selectWindowEntities,
  selectAll: selectAllWindows,
  selectTotal: selectTotalWindows,
} = windowsAdapter.getSelectors((state: AppState) => state.windows);

export const windowsSlice = createSlice({
  name: 'windows',
  initialState: windowsAdapter.getInitialState({
    windowOrder: [],
  }),
  reducers: {
    initWindows(state, action: PayloadAction<Window[]>) {
      return windowsAdapter.setAll(state, action.payload);
    },
    openWindow(state, action: PayloadAction<Omit<Window, 'id' | 'focusedAt'>>) {
      return windowsAdapter.addOne(state, {
        id: nanoid(),
        focusedAt: Date.now(),
        ...action.payload,
      });
    },
    closeWindow(state, action: PayloadAction<EntityId>) {
      return windowsAdapter.removeOne(state, action.payload);
    },
    focusWindow(state, action: PayloadAction<EntityId>) {
      return windowsAdapter.updateOne(state, {
        id: action.payload,
        changes: {
          focusedAt: Date.now(),
        },
      });
    },
  },
});

// eslint-disable-next-line no-empty-pattern
export const { initWindows, openWindow, closeWindow, focusWindow } = windowsSlice.actions;

export const windowsReducer = windowsSlice.reducer;
