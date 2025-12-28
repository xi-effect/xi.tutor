import { Header } from './Header';
import { Tabs } from './Tabs';

export const ClassroomPage = () => {
  return (
    <div className="flex h-full flex-col justify-between gap-6 overflow-y-auto pr-4 max-md:pl-4">
      <div className="flex flex-col pt-1">
        <Header />
        <Tabs />
      </div>
    </div>
  );
};
