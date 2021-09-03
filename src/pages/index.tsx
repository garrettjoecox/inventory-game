/* eslint-disable consistent-return */
import { Box, Button, Flex, SimpleGrid, Spacer, Text, VStack } from '@chakra-ui/react';
import { EntityId } from '@reduxjs/toolkit';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import useDraggable from 'src/hooks/useDraggable';
import useResizeable from 'src/hooks/useResizeable';
import { useAppDispatch, useAppSelector } from 'src/state';
import { initItems, selectItemsByParentItemId } from 'src/state/itemsSlice';
import { closeWindow, focusWindow, openWindow, selectAllWindows, selectWindowById } from 'src/state/windowsSlice';

export default function Index() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      initItems([
        {
          id: '1',
          parentItemId: null,
          name: 'Bag 1',
        },
        {
          id: '2',
          parentItemId: null,
          name: 'Bag 2',
        },
        {
          id: '3',
          parentItemId: '1',
          name: 'Stone',
        },
        {
          id: '4',
          parentItemId: '2',
          name: 'Wheat',
        },
        {
          id: '5',
          parentItemId: '1',
          name: 'Wood',
        },
      ]),
    );
  }, [dispatch]);

  return (
    <Box>
      <WindowsContainer />
      <VStack spacing="2">
        <Button
          onClick={() => {
            dispatch(openWindow({ title: 'Bag 1', type: 'bag', params: { id: '1' } }));
          }}>
          Open bag 1
        </Button>
        <Button
          onClick={() => {
            dispatch(openWindow({ title: 'Bag 2', type: 'bag', params: { id: '2' } }));
          }}>
          Open bag 2
        </Button>
        <Button
          onClick={() => {
            dispatch(openWindow({ title: 'Crafting table' }));
          }}>
          Open crafting table
        </Button>
      </VStack>
    </Box>
  );
}

const Window: FC<{ id: EntityId }> = ({ id, children }) => {
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
  const { resizeableHandleRef, resizeableRef } = useResizeable({ minHeight: 200, minWidth: 200 });

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
      borderWidth="2px"
      height="200px"
      width="200px"
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
          X
        </Button>
      </Flex>
      <Box p="2">{children}</Box>
      <Box
        bgColor="red"
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

const BagWindow: FC<{ id: EntityId }> = ({ id }) => {
  const wwindow = useAppSelector(state => selectWindowById(state, id));
  const items = useAppSelector(state => selectItemsByParentItemId(state)(wwindow.params.id));

  return (
    <Window id={id}>
      <SimpleGrid minChildWidth="64px" spacing="10px">
        {items.map(item => (
          <Box bgColor="gray.200" borderWidth="2px" borderColor="gray.300" height="64px" width="64px" key={item.id}>
            {item.name}
          </Box>
        ))}
      </SimpleGrid>
    </Window>
  );
};

const componentMap = {
  bag: BagWindow,
};

function WindowsContainer() {
  const windows = useAppSelector(selectAllWindows);

  const renderWindow = useCallback((wwindow: any) => {
    if (componentMap[wwindow.type]) {
      const TempComp = componentMap[wwindow.type];
      return <TempComp key={wwindow.id} id={wwindow.id} />;
    }

    return <Window key={wwindow.id} id={wwindow.id} />;
  }, []);

  return (
    <Box zIndex="modal" position="absolute">
      {windows.map(renderWindow)}
    </Box>
  );
}
