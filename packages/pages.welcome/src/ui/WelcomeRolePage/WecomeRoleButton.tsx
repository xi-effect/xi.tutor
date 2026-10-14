export type WelcomeRoleButtonPropsT = {
  buttonData: {
    ref: React.Ref<HTMLButtonElement> | undefined;
    tab: number;
    text: string;
    value: 'tutor' | 'student';
  };
  onButtonClick: (tab: number) => void;
  active: boolean;
};

export const WelcomeRoleButton = ({
  buttonData,
  onButtonClick,
  active,
}: WelcomeRoleButtonPropsT) => {
  const { ref, tab, text, value } = buttonData;
  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onButtonClick(tab)}
      className="ml-0 flex w-full flex-row items-start justify-start gap-2 bg-transparent p-4"
      data-umami-event="welcome-role-select"
      data-umami-event-role={value}
    >
      <div className="flex text-start">
        <span
          className={`z-10 text-xl leading-[28px] font-medium ${
            active ? 'text-text-link' : 'text-text-primary dark:text-text-primary'
          }`}
        >
          {text}
        </span>
      </div>
    </button>
  );
};
