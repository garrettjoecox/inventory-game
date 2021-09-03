import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { AppState } from '.';

export interface Item {
  id: string;
}

const itemsAdapter = createEntityAdapter<Item>({
  selectId: item => item.id,
});

export const {
  selectById: selectItemById,
  selectIds: selectItemIds,
  selectEntities: selectItemEntities,
  selectAll: selectAllItems,
  selectTotal: selectTotalItems,
} = itemsAdapter.getSelectors((state: AppState) => state.items);

export const itemsSlice = createSlice({
  name: 'items',
  initialState: itemsAdapter.getInitialState(),
  reducers: {},
});

// eslint-disable-next-line no-empty-pattern
export const {} = itemsSlice.actions;

export const itemsReducer = itemsSlice.reducer;
