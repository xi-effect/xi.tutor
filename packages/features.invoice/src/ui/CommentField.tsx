import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type CommentFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
};

export const CommentField = ({ control }: CommentFieldProps) => {
  const { t } = useTranslation('invoice');
  const isMobile = useMediaQuery('(max-width: 500px)');

  return (
    <FormField
      control={control}
      name="comment"
      defaultValue={null}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel className="text-text-primary">
            {isMobile ? t('comment.labelMobile') : t('comment.label')}{' '}
            <span className="text-text-secondary text-xs-base">{t('comment.optional')}</span>
          </FormLabel>
          <FormControl className="my-2">
            <Input placeholder={t('comment.placeholder')} {...formField} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
