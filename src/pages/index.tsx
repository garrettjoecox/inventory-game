/* eslint-disable consistent-return */
import { Box, Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { EntityId } from '@reduxjs/toolkit';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import usePortal from 'react-cool-portal';
import useDraggable from 'src/hooks/useDraggable';
import useResizeable from 'src/hooks/useResizeable';
import { useAppDispatch, useAppSelector } from 'src/state';
import {
  initItems,
  Item,
  moveItem,
  selectItemById,
  selectItemsByParentItemId,
  selectItemsByType,
} from 'src/state/itemsSlice';
import { closeWindow, focusWindow, openWindow, selectAllWindows, selectWindowById } from 'src/state/windowsSlice';

export default function Index() {
  const dispatch = useAppDispatch();
  const vaults = useAppSelector(selectItemsByType)(/^container:vault/);
  const workers = useAppSelector(selectItemsByType)(/^worker/);

  useEffect(() => {
    dispatch(
      initItems([
        {
          id: '1',
          parentItemId: '7',
          name: 'Small Bag',
          type: 'container:bag',
          size: 3,
        },
        {
          id: '2',
          parentItemId: '7',
          name: 'Large Bag',
          type: 'container:bag',
          size: 18,
        },
        {
          id: '3',
          parentItemId: '7',
          name: 'Stone',
          type: 'resource:stone',
        },
        {
          id: '4',
          parentItemId: '7',
          name: 'Wheat',
          type: 'resource:wheat',
        },
        {
          id: '5',
          parentItemId: '1',
          name: 'Wood',
          type: 'resource:wood',
        },
        {
          id: '6',
          parentItemId: null,
          name: 'Worker 1',
          type: 'worker:main',
        },
        {
          id: '7',
          parentItemId: null,
          name: 'Vault',
          type: 'container:vault',
        },
      ]),
    );
  }, [dispatch]);

  return (
    <Box>
      <WindowsContainer />
      <Flex wrap="wrap" p="2">
        {vaults.map(item => (
          <ItemBox key={item.id} itemId={item.id} />
        ))}
      </Flex>
      <Flex wrap="wrap" p="2">
        {workers.map(item => (
          <ItemBox key={item.id} itemId={item.id} />
        ))}
      </Flex>
    </Box>
  );
}

const Window: FC<{ id: EntityId; focused: boolean }> = ({ id, children, focused }) => {
  const wwindow = useAppSelector(state => selectWindowById(state, id));
  const dispatch = useAppDispatch();
  const focusedRef = useRef<HTMLDivElement>(null);
  const { draggableHandleRef, draggableRef } = useDraggable({
    bounds: {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
    },
  });
  const { resizeableHandleRef, resizeableRef } = useResizeable({ minHeight: 250, minWidth: 250 });

  useEffect(() => {
    if (!focusedRef.current) {
      return;
    }

    focusedRef.current.addEventListener('mousedown', () => {
      dispatch(focusWindow(id));
    });
  }, [dispatch, focusedRef, id]);

  if (!wwindow) {
    return null;
  }

  return (
    <Box
      key={wwindow.id}
      position="absolute"
      bgColor="gray.50"
      borderColor={focused ? 'gray.400' : 'gray.200'}
      borderWidth="2px"
      height="250px"
      maxHeight="250px"
      width="250px"
      maxWidth="250px"
      display="flex"
      flexDirection="column"
      ref={el => {
        focusedRef.current = el;
        draggableRef.current = el;
        resizeableRef.current = el;
      }}>
      <Flex borderBottomWidth="2px" borderColor="gray.200" bgColor="gray.100" ref={draggableHandleRef}>
        <Box p="2">
          <Text>{wwindow.title}</Text>
        </Box>
        <Spacer />
        <Button
          borderLeftWidth="2px"
          borderColor="gray.200"
          borderRadius="none"
          onClick={() => {
            dispatch(closeWindow(id));
          }}>
          ╳
        </Button>
      </Flex>
      <Box overflow="auto" height="full">
        {children}
      </Box>
      <Box
        bgColor="gray.200"
        height="20px"
        width="20px"
        position="absolute"
        bottom="0"
        right="0"
        ref={resizeableHandleRef}
      />
    </Box>
  );
};

const ContainerWindow: FC<{ id: EntityId; focused: boolean }> = ({ id, focused }) => {
  const wwindow = useAppSelector(state => selectWindowById(state, id));
  const containerItem = useAppSelector(state => selectItemById(state, wwindow.id) as Item);
  const items = useAppSelector(state => selectItemsByParentItemId(state)(wwindow.id));
  const emptySlots = containerItem.size ? containerItem.size - items.length : 0;
  const emptySlotItems = Array.from({ length: emptySlots });

  return (
    <Window id={id} focused={focused}>
      <Flex wrap="wrap" p="2" height="full" alignContent="flex-start" data-container-id={containerItem.id}>
        {items.map(item => (
          <ItemBox key={item.id} itemId={item.id} data-container-id={containerItem.id} />
        ))}
        {emptySlots > 0 &&
          emptySlotItems.map((_, index) => (
            <Box
              key={index.toString()}
              data-container-id={containerItem.id}
              borderWidth="2px"
              borderColor="gray.200"
              height="64px"
              width="64px"
              m="2"
            />
          ))}
      </Flex>
    </Window>
  );
};

const WorkerWindow: FC<{ id: EntityId; focused: boolean }> = ({ id, focused }) => {
  const wwindow = useAppSelector(state => selectWindowById(state, id));
  const items = useAppSelector(state => selectItemsByParentItemId(state)(wwindow.id));

  return (
    <Window id={id} focused={focused}>
      <Flex wrap="wrap" p="2" height="full" alignContent="flex-start">
        {items.map(item => (
          <ItemBox key={item.id} itemId={item.id} />
        ))}
      </Flex>
    </Window>
  );
};

const componentMap = {
  container: ContainerWindow,
  worker: WorkerWindow,
};

function WindowsContainer() {
  const windows = useAppSelector(selectAllWindows);

  const renderWindow = useCallback(
    (wwindow: any, index: number) => {
      if (componentMap[wwindow.type]) {
        const TempComp = componentMap[wwindow.type];
        return <TempComp key={wwindow.id} id={wwindow.id} focused={index === windows.length - 1} />;
      }

      return <Window key={wwindow.id} id={wwindow.id} focused={index === windows.length - 1} />;
    },
    [windows.length],
  );

  return (
    <Box zIndex="1" position="absolute">
      {windows.map(renderWindow)}
    </Box>
  );
}

const ItemBox: FC<{ itemId: EntityId }> = ({ itemId, ...props }) => {
  const item = useAppSelector(state => selectItemById(state, itemId) as Item);
  const { Portal, isShow, show, hide, toggle } = usePortal({
    defaultShow: false,
    onShow: e => {},
    onHide: e => {},
  });
  const { draggableHandleRef, draggableRef, forceDragEnd } = useDraggable({
    bounds: {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
    },
    onDragStart: e => {
      show();
    },
    onDragEnd: e => {
      if (e.target?.dataset?.containerId) {
        dispatch(moveItem({ id: itemId, parentItemId: e.target.dataset.containerId }));
      }
      hide();
    },
  });
  const dispatch = useAppDispatch();

  return isShow ? (
    <>
      <Box borderWidth="2px" borderColor="gray.200" height="64px" width="64px" m="2" />
      <Portal>
        <Box
          zIndex="2"
          pointerEvents="none"
          position="absolute"
          ref={draggableRef}
          bgColor="gray.200"
          borderWidth="2px"
          borderColor="gray.300"
          height="64px"
          width="64px"
          m="2"
          display="flex"
          fontSize="sm"
          textAlign="center"
          alignItems="center"
          justifyContent="center">
          {item.name}
        </Box>
      </Portal>
    </>
  ) : (
    <Box
      {...props}
      ref={draggableHandleRef}
      bgColor="gray.200"
      borderWidth="2px"
      borderColor="gray.300"
      height="64px"
      width="64px"
      m="2"
      display="flex"
      fontSize="sm"
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      onClick={() => {
        if (item.type.match(/^container/)) {
          dispatch(
            openWindow({
              id: item.id,
              title: item.name,
              type: 'container',
              params: {},
            }),
          );
        } else if (item.type.match(/^worker/)) {
          dispatch(
            openWindow({
              id: item.id,
              title: item.name,
              type: 'worker',
              params: {},
            }),
          );
        }
      }}>
      {item.name}
    </Box>
  );
};
