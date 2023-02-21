import { createEntityAdapter, createSelector, createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit';
import memoize from 'lodash.memoize';
import type { AppState } from '.';

export interface Item {
  id: string;
  parentItemId: null | EntityId;
  type: string;
  name: string;
  size?: number;
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
  memoize((parentItemId: EntityId | null) => items.filter(item => item.parentItemId === parentItemId)),
);

export const selectItemsByType = createSelector(selectAllItems, items =>
  memoize((regex: RegExp) => items.filter(item => item.type.match(regex))),
);

export const itemsSlice = createSlice({
  name: 'items',
  initialState: itemsAdapter.getInitialState(),
  reducers: {
    initItems(state, action: PayloadAction<Item[]>) {
      itemsAdapter.setAll(state, action.payload);
    },
    moveItem(state, action: PayloadAction<{ id: EntityId; parentItemId: EntityId }>) {
      const { id, parentItemId } = action.payload;
      itemsAdapter.updateOne(state, {
        id,
        changes: {
          parentItemId,
        },
      });
    },
  },
});

export const { initItems, moveItem } = itemsSlice.actions;

export const itemsReducer = itemsSlice.reducer;
