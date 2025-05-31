import { useEffect, useState, useRef, useCallback } from 'react';
import { useYjs } from './useYjs';
import { useBoardStore } from '../store';
import { BoardElement } from '../types';
import { useUndoRedo } from '../features';
import { shouldSkipSync } from '../utils';

export const useWhiteboardCollaborative = ({
  roomId = 'roomid',
  hostUrl = 'wss://hocus.xieffect.ru',
}: {
  roomId?: string;
  hostUrl?: string;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const isUpdatingRef = useRef(false);
  const hasConnectedBefore = useRef(false); // исправлено

  const { addElement, updateElement, removeElement, boardElements } = useBoardStore();
  const { yDoc, provider, yStore, yArr, getYJSKeys } = useYjs(roomId, hostUrl);

  useUndoRedo(yArr);

  const synchronizeElementFromYjs = useCallback(
    (elementId: string) => {
      const json = yStore.get(elementId);
      if (!json) return;

      try {
        const element = JSON.parse(json) as BoardElement;
        const existingElement = boardElements.find((el) => el.id === elementId);

        if (!existingElement) {
          addElement(element);
        } else if (JSON.stringify(existingElement) !== JSON.stringify(element)) {
          updateElement(elementId, element);
        }
      } catch (error) {
        console.error(`Error parsing JSON for key ${elementId} during sync:`, error);
      }
    },
    [addElement, updateElement, yStore, boardElements],
  );

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Подписка на локальный стор — пушим изменения в Yjs
    unsubs.push(
      useBoardStore.subscribe((state) => {
        if (isUpdatingRef.current || shouldSkipSync()) return;

        const { boardElements } = state;

        try {
          isUpdatingRef.current = true;
          const yjsKeys = getYJSKeys();
          const storeKeysSet = new Set(boardElements.map((el) => el.id));

          yDoc.transact(() => {
            // Удаляем из Yjs элементы, которых нет в локальном сторе
            yjsKeys.forEach((key) => {
              if (!storeKeysSet.has(key)) {
                yStore.delete(key);
              }
            });

            // Добавляем или обновляем в Yjs только изменённые элементы
            boardElements.forEach((element) => {
              const key = element.id;
              const existingJson = yStore.get(key);
              const newJson = JSON.stringify(element);

              if (!existingJson || existingJson !== newJson) {
                yStore.set(key, newJson);
              }
            });
          }, 'local');
        } catch (error) {
          console.error('Error updating YJS:', error);
        } finally {
          isUpdatingRef.current = false;
        }
      }),
    );

    // Обработка изменений из Yjs — синхронизация в локальный стор
    const handleChange = (
      changes: Map<
        string,
        | { action: 'delete'; oldValue?: string }
        | { action: 'update'; oldValue?: string; newValue: string }
        | { action: 'add'; newValue: string }
      >,
    ) => {
      if (isUpdatingRef.current) return;

      try {
        isUpdatingRef.current = true;

        changes.forEach((change, id) => {
          if (change.action === 'update' || change.action === 'add') {
            synchronizeElementFromYjs(id);
          } else if (change.action === 'delete') {
            removeElement(id);
          }
        });
      } catch (error) {
        console.error('Error updating store:', error);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    // Полная синхронизация из Yjs при первом подключении
    const handleSync = () => {
      console.log('Synchronizing data from YJS...');

      const keys = getYJSKeys();
      const yjsKeys = new Set(keys);

      // Удаляем элементы из локального стора, которых нет в Yjs
      boardElements.forEach((element) => {
        if (!yjsKeys.has(element.id)) {
          removeElement(element.id);
        }
      });

      // Синхронизируем элементы из Yjs в локальный стор
      keys.forEach((key) => {
        synchronizeElementFromYjs(key);
      });
    };

    // Обработка статуса подключения
    const handleStatusChange = ({ status }: { status: 'disconnected' | 'connected' }) => {
      setIsConnected(status === 'connected');

      if (status === 'disconnected') return;

      provider.off('synced', handleSync);

      if (status === 'connected') {
        if (hasConnectedBefore.current) return;
        hasConnectedBefore.current = true;
        provider.on('synced', handleSync);
        unsubs.push(() => provider.off('synced', handleSync));
      }
    };

    provider.on('status', handleStatusChange);
    unsubs.push(() => provider.off('status', handleStatusChange));

    yStore.on('change', handleChange);
    unsubs.push(() => yStore.off('change', handleChange));

    return () => {
      unsubs.forEach((fn) => fn());
      unsubs.length = 0;
    };
  }, [
    provider,
    yDoc,
    yArr,
    yStore,
    roomId,
    addElement,
    updateElement,
    removeElement,
    boardElements,
    getYJSKeys,
    synchronizeElementFromYjs,
  ]);

  return {
    isConnected,
  };
};
