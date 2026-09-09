import { type YookassaSavedCardUiUser } from 'common.subscription';
import { SubscriptionOverview } from './SubscriptionOverview';

export const SubscriptionSettings = ({ user }: { user?: YookassaSavedCardUiUser }) => {
  return (
    <div>
      <SubscriptionOverview user={user} />
    </div>
  );
};
