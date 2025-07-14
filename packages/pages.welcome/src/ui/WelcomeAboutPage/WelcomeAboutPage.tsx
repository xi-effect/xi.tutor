// import { useRouter, useCanGoBack } from '@tanstack/react-router';
// import { useTranslation } from 'react-i18next';
// import { WelcomeButtons, WelcomePageLayout } from '../../ui';
// import { useWelcomeAboutForm } from '../../hooks';
// import { WelcomeAboutFormData } from '../../model';
// import { Input } from '@xipkg/input';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   useForm,
// } from '@xipkg/form';

// export const WelcomeAboutPage = () => {
//   const { t } = useTranslation('welcomeAbout');

//   const form = useForm<WelcomeAboutFormData>();

//   const { control, watch, handleSubmit } = form;

//   const [inputValue] = watch(['question']);

//   const { onWelcomeAboutForm } = useWelcomeAboutForm();
//   const onSubmit = () => {
//     onWelcomeAboutForm();
//   };

//   // Временные хэндлеры (на период, пока не подключен бэкенд)
//   const router = useRouter();
//   const canGoBack = useCanGoBack();
//   const backButtonHandler = () => canGoBack && router.history.back();

//   return (
//     <WelcomePageLayout title={t('title')} step={3}>
//       <Form {...form}>
//         <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-col">
//           <FormField
//             control={control}
//             name="question"
//             defaultValue=""
//             render={({ field }) => (
//               <FormItem className="mt-8">
//                 <FormLabel>{t('tutor_question')}</FormLabel>
//                 <FormControl>
//                   <Input
//                     className="mt-1"
//                     autoComplete="off"
//                     type="text"
//                     placeholder={t('tutor_placeholder')}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <WelcomeButtons
//             continueType={inputValue?.length ? 'continue' : 'next'}
//             backButtonHandler={backButtonHandler}
//           />
//         </form>
//       </Form>
//     </WelcomePageLayout>
//   );
// };
