import { useCallback, useRef } from 'react';

export const useInsertMedia = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   const input = window.document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/*';
  //   input.multiple = true;
  //   inputRef.current = input;
  //   async function onchange(e: Event) {
  //     const fileList = (e.target as HTMLInputElement).files;
  //     if (!fileList || fileList.length === 0) return;
  //     await editor.putExternalContent({
  //       type: 'files',
  //       files: Array.from(fileList),
  //       point: editor.getViewportPageBounds().center,
  //       ignoreParent: false,
  //     });
  //     input.value = '';
  //   }
  //   input.addEventListener('change', onchange);
  //   return () => {
  //     // @ts-expect-error TODO: разобраться с типизацией
  //     inputRef.current = undefined;
  //     input.removeEventListener('change', onchange);
  //   };
  // }, [editor]);

  return useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);
};
