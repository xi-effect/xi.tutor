import { Header } from './Header';
import { Tabs } from './Tabs';

export const ClassroomPage = () => {
  return (
    <div className="bg-background-page flex h-full flex-col justify-between gap-6">
      <div className="flex flex-col">
        <Header />
        <Tabs />
      </div>
    </div>
  );
};
