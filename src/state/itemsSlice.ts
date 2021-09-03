import { createEntityAdapter, createSelector, createSlice, EntityId } from '@reduxjs/toolkit';
import memoize from 'lodash.memoize';
import type { AppState } from '.';

export interface Item {
  id: string;
  parentItemId: null | EntityId;
  name: string;
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

export const selectItemsByParentItemId = createSelector(selectAllItems, items =>
  memoize((parentItemId: EntityId) => items.filter(item => item.parentItemId === parentItemId)),
);

export const itemsSlice = createSlice({
  name: 'items',
  initialState: itemsAdapter.getInitialState(),
  reducers: {
    initItems(state, action) {
      itemsAdapter.setAll(state, action.payload);
    },
  },
});

export const { initItems } = itemsSlice.actions;

export const itemsReducer = itemsSlice.reducer;
