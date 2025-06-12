import { ScrollArea } from '@xipkg/scrollarea';
import { Lessons, Materials, Payments, Classrooms } from './components';

export const MainPage = () => {
  console.log('MainPage');

  return (
    <div className="flex flex-col">
      <ScrollArea type="always" className="h-[calc(100vh-64px)] w-full">
        <Lessons />
        <Classrooms />
        <Payments />
        <Materials />
      </ScrollArea>
    </div>
  );
};
