import { Lessons, Materials, Payments, Classrooms } from './components';

export const MainPage = () => {
  console.log('MainPage');

  return (
    <div className="flex flex-col">
      <Lessons />
      <Classrooms />
      <Materials />
      <Payments />
    </div>
  );
};
