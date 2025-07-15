import { RoleT } from 'common.types';
import { RefObject } from 'react';

export type RoleButtonT = {
  ref: RefObject<HTMLButtonElement | null>;
  tab: number;
  top: number;
  text: string;
  value: RoleT;
};
