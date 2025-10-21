import { type RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import { PaymentDataT, RoleT } from 'features.table';
import { Card } from './Card';
import { Loader } from '../Loader';
import { type TabsComponentPropsT } from '../../types';

export type CardsListPropsT<Role extends RoleT> = {
  data: PaymentDataT<Role>[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  onApprovePayment: TabsComponentPropsT['onApprovePayment'];
  colCount: number;
  gap: number;
  parentRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  currentUserRole: Role;
};

export const CardsList = <Role extends RoleT>({
  data,
  rowVirtualizer,
  onApprovePayment,
  colCount,
  gap,
  parentRef,
  isLoading,
  isFetchingNextPage,
  currentUserRole,
}: CardsListPropsT<Role>) => {
  return (
    <div className="h-[calc(100vh-204px)] w-full overflow-y-auto pr-4" ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * colCount;
          const rowItems = data.slice(startIndex, startIndex + colCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gap,
                padding: gap,
                paddingLeft: 0,
                boxSizing: 'border-box',
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((payment, index) => (
                <Card
                  key={startIndex + index}
                  payment={payment}
                  onApprovePayment={onApprovePayment}
                  currentUserRole={currentUserRole}
                  userId={
                    currentUserRole === 'student'
                      ? (payment as { tutor_id: number }).tutor_id
                      : (payment as { student_id: number }).student_id
                  }
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Индикатор загрузки */}
      <Loader isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
    </div>
  );
};
