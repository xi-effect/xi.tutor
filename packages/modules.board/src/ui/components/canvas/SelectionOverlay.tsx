import { track } from '@ibodr/draw';
import { SelectionMenu } from '../toolbar/SelectionMenu';
import { SelectionOutline } from './SelectionOutline';

/** Плавающий UI и DOM-рамка выделения поверх canvas */
export const SelectionOverlay = track(function SelectionOverlay() {
  return (
    <>
      <SelectionOutline />
      <SelectionMenu />
    </>
  );
});
