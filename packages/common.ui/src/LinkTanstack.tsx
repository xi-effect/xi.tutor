import { createLink, LinkComponent } from '@tanstack/react-router';
import { Link } from '@xipkg/link';

const CreatedLinkComponent = createLink(Link);

export const LinkTanstack: LinkComponent<typeof Link> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};
