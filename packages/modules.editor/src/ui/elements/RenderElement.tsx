import { RenderElementProps } from 'slate-react';

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
import { CustomElement, CustomText } from '@xipkg/slatetypes';
import { ReactNode } from 'react';

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
  const style = { position: 'relative' };

  switch (element.type) {
    case 'paragraph':
      return (
        <Typography {...attributes} style={style}>
          {children}
        </Typography>
      );

    case 'image':
      return (
        <Image {...attributes} element={element} style={style}>
          {children}
        </Image>
      );

    case 'imageBlock':
      return (
        <ImageBlock {...attributes} element={element} style={style}>
          {children}
        </ImageBlock>
      );

    case 'video':
      return (
        <Video {...attributes} element={element} style={style}>
          {children}
        </Video>
      );

    case 'videoBlock':
      return (
        <VideoBlock {...attributes} element={element} style={style}>
          {children}
        </VideoBlock>
      );

    case 'quote':
      return (
        <Quote {...attributes} element={element} style={style}>
          {children}
        </Quote>
      );

    case 'quoteText':
      return (
        <QuoteText {...attributes} style={style}>
          {children}
        </QuoteText>
      );

    case 'quoteAuthor':
      return (
        <QuoteAuthor {...attributes} style={style}>
          {children}
        </QuoteAuthor>
      );

    case 'bulleted-list':
      return (
        <BulletedList {...attributes} style={style}>
          {children}
        </BulletedList>
      );

    case 'numbered-list':
      return (
        <NumberedList {...attributes} style={style}>
          {children}
        </NumberedList>
      );

    case 'list-item':
      return (
        <ListItem {...attributes} style={style}>
          {children}
        </ListItem>
      );

    case 'link':
      return (
        <Link {...attributes} element={element} style={style}>
          {children}
        </Link>
      );

    case 'divider':
      return (
        <Divider {...attributes} style={style}>
          {children}
        </Divider>
      );

    case 'code':
      return (
        <Code {...attributes} element={element} style={style}>
          {children}
        </Code>
      );

    case 'file':
      return (
        <File {...attributes} element={element} style={style}>
          {children}
        </File>
      );

    case 'fileBlock':
      return (
        <FileBlock {...attributes} element={element} style={style}>
          {children}
        </FileBlock>
      );

    case 'tip':
      return (
        <Tip {...attributes} element={element} style={style}>
          {children}
        </Tip>
      );

    case 'icon':
      return (
        <Icon {...attributes} element={element} style={style}>
          {children}
        </Icon>
      );

    default:
      return (
        <Typography {...attributes} style={style}>
          {children}
        </Typography>
      );
  }
};
