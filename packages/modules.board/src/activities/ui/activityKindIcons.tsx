import type { ComponentType, SVGProps } from 'react';
import { cn } from '@xipkg/utils';
import type { ActivityKind } from '../model/kinds';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0 fill-current', className)} {...rest}>
      {children}
    </svg>
  );
}

export const ActivityGapTextIcon = (props: IconProps) => (
  <Svg {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6Zm0 2h12v14H6V5Z"
    />
    <path d="M8 8a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8Z" />
    <path d="M8 11.5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H8Z" />
    <path d="M14 11.5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Z" />
    <path d="M8 15a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Z" />
  </Svg>
);

export const ActivityMatchingIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6.7 3.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z" />
    <path d="M6.7 13.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z" />
    <path d="M15.7 3.8h3.2a1.6 1.6 0 0 1 1.6 1.6v3.2a1.6 1.6 0 0 1-1.6 1.6h-3.2a1.6 1.6 0 0 1-1.6-1.6V5.4a1.6 1.6 0 0 1 1.6-1.6Z" />
    <path d="M15.7 13.8h3.2a1.6 1.6 0 0 1 1.6 1.6v3.2a1.6 1.6 0 0 1-1.6 1.6h-3.2a1.6 1.6 0 0 1-1.6-1.6v-3.2a1.6 1.6 0 0 1 1.6-1.6Z" />
  </Svg>
);

export const ActivitySortingIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 4h4a2 2 0 1 1 0 4H5a2 2 0 1 1 0-4Z" />
    <path d="M5 10h4a2 2 0 1 1 0 4H5a2 2 0 1 1 0-4Z" />
    <path d="M5 16h4a2 2 0 1 1 0 4H5a2 2 0 1 1 0-4Z" />
    <path d="M15 10h4a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4Z" />
    <path d="M15 16h4a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4Z" />
  </Svg>
);

export const ActivityOrderingIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    <path d="M10 6.5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z" />
    <path d="M5 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    <path d="M10 12a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z" />
    <path d="M5 16a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    <path d="M10 17.5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Z" />
  </Svg>
);

export const ActivityLabelImageIcon = (props: IconProps) => (
  <Svg {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6.05c-.66-.04-1.33-.05-2-.05V5H6v12h6.1c.07.7.3 1.36.66 1.95H6a2 2 0 0 1-2-2V5Z"
    />
    <path d="M8.25 7.25a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.5 12.5a2.75 2.75 0 0 0-2.37 4.15L17.5 21.2l2.37-4.55A2.75 2.75 0 0 0 17.5 12.5Zm0 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
    />
  </Svg>
);

export const ActivityMultipleChoiceIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
    <path d="M13 5.5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 14a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Zm2 0h3v3H6v-3Z"
    />
    <path d="M13 15.5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6Z" />
  </Svg>
);

export const ActivityMysteryTilesIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm.5 2h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Z"
    />
    <path d="M5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" />
    <path d="M15 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" />
  </Svg>
);

export const ActivityRandomCardIcon = (props: IconProps) => (
  <Svg {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H7Zm0 2h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
    />
    <path
      transform="translate(12 13) scale(0.42) translate(-12 -12)"
      d="M10.5732 4.1543C11.0083 2.81561 12.8567 2.77407 13.3799 4.0293L13.4268 4.1543L14.7471 8.21875H19.0205C20.4736 8.21875 21.0779 10.0785 19.9023 10.9326L16.4453 13.4443L17.7656 17.5088C18.2145 18.8907 16.6326 20.0396 15.457 19.1855L12 16.6729L8.54297 19.1855C7.36745 20.0396 5.78553 18.8907 6.23438 17.5088L7.55371 13.4443L4.09766 10.9326C2.92209 10.0785 3.52641 8.21875 4.97949 8.21875H9.25293L10.5732 4.1543Z"
    />
  </Svg>
);

export const ACTIVITY_KIND_ICONS: Record<ActivityKind, ComponentType<IconProps>> = {
  'gap-text': ActivityGapTextIcon,
  matching: ActivityMatchingIcon,
  sorting: ActivitySortingIcon,
  ordering: ActivityOrderingIcon,
  'label-image': ActivityLabelImageIcon,
  'multiple-choice': ActivityMultipleChoiceIcon,
  'mystery-tiles': ActivityMysteryTilesIcon,
  'random-card': ActivityRandomCardIcon,
};
