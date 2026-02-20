export type WelcomeRoleButtonPropsT = {
  buttonData: {
    ref: React.Ref<HTMLButtonElement> | undefined;
    tab: number;
    text: string;
  };
  onButtonClick: (tab: number) => void;
  active: boolean;
};

export const WelcomeRoleButton = ({
  buttonData,
  onButtonClick,
  active,
}: WelcomeRoleButtonPropsT) => {
  const { ref, tab, text } = buttonData;
  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onButtonClick(tab)}
      className="ml-0 flex w-full flex-row items-start justify-start gap-2 bg-transparent p-4"
      data-umami-event="welcome-role-select"
      data-umami-event-role={text}
    >
      <div className="flex text-start">
        <span
          className={`z-10 text-xl leading-[28px] font-medium ${
            active ? 'text-brand-100' : 'text-gray-80'
          }`}
        >
          {text}
        </span>
      </div>
    </button>
  );
};
