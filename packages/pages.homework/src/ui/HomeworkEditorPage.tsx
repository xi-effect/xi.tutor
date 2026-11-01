/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useNavigate, useParams } from '@tanstack/react-router';
import { NotFoundPage } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { HomeworkEditor } from 'modules.homework';
import { useTranslation } from 'react-i18next';
import { useHomeworkLibrary } from '../hooks/useHomeworkLibrary';

export const HomeworkEditorPage = () => {
  const { homeworkId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { t } = useTranslation('homework');
  const { data: user } = useCurrentUser();
  const { items, saveDraft } = useHomeworkLibrary();
  const item = items.find((entry) => entry.id === homeworkId);
  const isTutor = user?.default_layout === 'tutor';

  if (!isTutor || !item) {
    return <NotFoundPage withLogo={false} />;
  }

  const tab = item.feed;

  return (
    <HomeworkEditor
      key={item.id}
      initial={{
        title: item.title,
        description: item.description,
        content: item.content,
      }}
      fallbackTitle={t('draftTitle')}
      onSave={(draft, meta) => saveDraft(item.id, draft, meta.questionsChanged)}
      onBack={() => {
        // @ts-ignore
        navigate({ to: '/homework', search: { tab } });
      }}
    />
  );
};
