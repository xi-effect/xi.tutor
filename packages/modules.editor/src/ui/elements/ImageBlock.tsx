import { env } from 'common.env';
import { CustomText } from '../../types';
import { type CustomRenderElementProps } from './RenderElement';

type ImageBlockPropsT = CustomRenderElementProps;

export const ImageBlock = ({ element, children, attributes }: ImageBlockPropsT) => {
  const isEmpty =
    element.children &&
    (element.children[0] as CustomText).text === '' &&
    element.children.length === 1;

  return (
    <figure>
      <img
        alt={(element.children[0] as CustomText).text || 'Подпись изображения'}
        src={`${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/${element.url}/`}
        className="border-gray-10 mx-auto h-auto max-h-[70dvh] w-auto rounded-lg border"
        width={400}
        height={225}
        {...attributes}
      />
      <figcaption className="text-gray-30 border-gray-30 relative mt-2 rounded-md border p-2 text-sm">
        {isEmpty && (
          <span className="pointer-events-none absolute" contentEditable={false}>
            Подпись изображения
          </span>
        )}
        {children}
      </figcaption>
    </figure>
  );
};
