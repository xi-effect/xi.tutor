import { Lessons, Cabinets, Materials, Payments } from './components';

export const MainPage = () => {
  console.log('MainPage');

  return (
    <div className="flex flex-col">
      <Lessons />
      <Cabinets />
      <Materials />
      <Payments />
    </div>
  );
};
