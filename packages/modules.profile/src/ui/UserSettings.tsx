import React from 'react';
import { useMediaQuery } from '@xipkg/utils';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// import { deleteQuery } from 'pkg.router.url';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Header } from './Header';
import { Menu } from './Menu';
import { Content } from './Content';

export const UserSettings = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const isMobile = useMediaQuery('(max-width: 719px)');
  const [activeContent, setActiveContent] = React.useState<number>(0);
  const [showContent, setShowContent] = React.useState(false);
  // const searchParams = useSearchParams();
  // const pathname = usePathname();
  // const router = useRouter();

  // const category = searchParams.get('category');
  const handleClose = () => {
    setShowContent(false);
    // const updatedParams = deleteQuery(deleteQuery(searchParams, 'profileIsOpen'), 'category');
    // router.push(`${pathname}?${updatedParams}`);
  };

  const [activeQuery, setActiveQuery] = React.useState<string>('home');

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.body.style.pointerEvents = '';
        }}
        variant="full"
        className="p-4 lg:p-6"
      >
        <ModalTitle className="hidden"> Настройки пользователя </ModalTitle>
        <div className="flex w-full items-center justify-center">
          <div className="flex h-full min-h-full w-full max-w-[1132px] flex-col">
            <Header
              activeItem={activeContent}
              showContent={showContent}
              setShowContent={setShowContent}
              handleClose={handleClose}
            />
            <div className="mt-4 flex h-full flex-row">
              {isMobile ? (
                <div className="flex-1">
                  {showContent ? (
                    <Content activeQuery={activeQuery} />
                  ) : (
                    <Menu
                      setActiveQuery={setActiveQuery}
                      setActiveContent={setActiveContent}
                      setShowContent={setShowContent}
                    />
                  )}
                </div>
              ) : (
                <>
                  <Menu
                    setActiveQuery={setActiveQuery}
                    setActiveContent={setActiveContent}
                    setShowContent={setShowContent}
                  />
                  <Content activeQuery={activeQuery} />
                </>
              )}
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
