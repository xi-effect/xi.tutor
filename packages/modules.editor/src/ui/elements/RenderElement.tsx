import { RenderElementProps } from 'slate-react';
import { ReactNode } from 'react';

// Импорт типов
import { CustomElement, CustomText } from '../../types';

// Импорт всех элементов
import { Typography } from './Typography';
import { Image } from './Image';
import { ImageBlock } from './ImageBlock';
import { Video } from './Video';
import { VideoBlock } from './VideoBlock';
import { Quote } from './Quote';
import { QuoteText } from './QuoteText';
import { QuoteAuthor } from './QuoteAuthor';
import { BulletedList } from './BulletedList';
import { NumberedList } from './NumberedList';
import { ListItem } from './ListItem';
import { Link } from './Link';
import { Divider } from './Divider';
import { Code } from './Code';
import { File } from './File';
import { FileBlock } from './FileBlock';
import { Tip } from './Tip';
import { Icon } from './Icon';

export type CustomRenderElementProps = RenderElementProps & {
  element: {
    type: string;
    children?: (CustomText | CustomElement)[];
    icon?: ReactNode;
    url?: string;
    fileName?: string;
    size?: number;
    color?: string;
    bg?: string;
  };
};

/**
 * Основной компонент для рендеринга всех типов элементов редактора
 */
export const RenderElement = ({ attributes, children, element }: RenderElementProps) => {
  // Теперь, благодаря типам в slate.ts, мы можем использовать style напрямую из элемента
  // Например, чтобы применить позиционирование или другие CSS свойства

  switch (element.type) {
    case 'paragraph':
      return <Typography attributes={attributes} element={element} children={children} />;

    case 'image':
      return <Image attributes={attributes} element={element} children={children} />;

    case 'imageBlock':
      return <ImageBlock attributes={attributes} element={element} children={children} />;

    case 'video':
      return <Video attributes={attributes} element={element} children={children} />;

    case 'videoBlock':
      return <VideoBlock element={element} />;

    case 'quote':
      return <Quote attributes={attributes} element={element} children={children} />;

    case 'quoteText':
      return <QuoteText attributes={attributes} element={element} children={children} />;

    case 'quoteAuthor':
      return <QuoteAuthor attributes={attributes} element={element} children={children} />;

    case 'bulleted-list':
      return <BulletedList attributes={attributes} element={element} children={children} />;

    case 'numbered-list':
      return <NumberedList attributes={attributes} element={element} children={children} />;

    case 'list-item':
      return <ListItem attributes={attributes} children={children} />;

    case 'link':
      return <Link attributes={attributes} element={element} children={children} />;

    case 'divider':
      return <Divider attributes={attributes} children={children} />;

    case 'code':
      return <Code attributes={attributes} element={element} children={children} />;

    case 'file':
      return <File attributes={attributes} element={element} children={children} />;

    case 'fileBlock':
      return <FileBlock element={element} />;

    case 'tip':
      return <Tip attributes={attributes} element={element} children={children} />;

    case 'icon':
      return <Icon attributes={attributes} element={element} children={children} />;

    default:
      return <Typography attributes={attributes} element={element} children={children} />;
  }
};
