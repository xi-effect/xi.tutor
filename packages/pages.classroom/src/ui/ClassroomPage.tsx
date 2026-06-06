import { Header } from './Header';
import { Tabs } from './Tabs';

export const ClassroomPage = () => {
  return (
    <div className="bg-gray-5 flex h-full flex-col justify-between gap-6">
      <div className="xs:pl-4 flex flex-col pl-0">
        <Header />
        <Tabs />
      </div>
    </div>
  );
};
