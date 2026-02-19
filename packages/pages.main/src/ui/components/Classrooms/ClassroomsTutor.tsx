import { Button } from '@xipkg/button';
import { Group, Search } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Classroom } from './Classroom';
import { useFetchClassrooms } from 'common.services';
import { useNoteVisibility } from '../../../hooks';
import { NoteForStudent } from './NoteForStudent';
import { useState, useMemo } from 'react';
import { cn } from '@xipkg/utils';

export const ClassroomsTutor = () => {
  const { data: classrooms, isLoading } = useFetchClassrooms();
  const { isHidden, hideNote } = useNoteVisibility(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Фильтрация кабинетов по поисковому запросу и предмету
  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return [];

    return classrooms.filter((classroom) => {
      // Фильтр по поисковому запросу (по имени кабинета или ученика)
      const matchesSearch =
        searchQuery === '' || classroom.name?.toLowerCase().includes(searchQuery.toLowerCase());

      // Фильтр по предмету
      const matchesSubject =
        selectedSubject === 'all' ||
        (selectedSubject === 'english' && classroom.subject_id === 1) || // TODO: Заменить на реальные ID предметов
        (selectedSubject === 'math' && classroom.subject_id === 2);

      return matchesSearch && matchesSubject;
    });
  }, [classrooms, searchQuery, selectedSubject]);

  const subjects = [
    { id: 'all', label: 'Все предметы' },
    { id: 'english', label: 'Английский' },
    { id: 'math', label: 'Математика' },
  ];

  return (
    <div className="bg-gray-0 flex flex-col gap-4 rounded-2xl p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Кабинеты</h2>
        <div className="ml-auto">
          <Button
            variant="none"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
          >
            <Group className="fill-gray-60 size-6" />
          </Button>
        </div>
      </div>

      {/* Поиск */}
      <Input
        placeholder="Поиск по имени"
        before={<Search className="fill-gray-60" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Фильтры по предметам */}
      <div className="flex flex-row gap-2">
        {subjects.map((subject) => (
          <Button
            key={subject.id}
            variant={selectedSubject === subject.id ? 'secondary' : 'none'}
            size="s"
            className={cn(
              'rounded-lg px-4 py-2 font-medium',
              selectedSubject === subject.id
                ? 'bg-brand-80 text-gray-0'
                : 'border-gray-30 border text-gray-100',
            )}
            onClick={() => setSelectedSubject(subject.id)}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      {/* Список кабинетов */}
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
            <p className="text-m-base text-gray-60">Загрузка...</p>
          </div>
        )}
        {!isLoading && filteredClassrooms && filteredClassrooms.length > 0 && (
          <>
            {!isHidden && filteredClassrooms && filteredClassrooms.length > 0 && (
              <NoteForStudent onHide={hideNote} isTutor={true} />
            )}
            {filteredClassrooms.map((classroom) => (
              <Classroom key={classroom.id} classroom={classroom} isLoading={isLoading} />
            ))}
          </>
        )}
        {!isLoading && (!filteredClassrooms || filteredClassrooms.length === 0) && (
          <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
            <p className="text-m-base text-gray-60 text-center">
              {searchQuery || selectedSubject !== 'all'
                ? 'Ничего не найдено'
                : 'Пригласите учеников — индивидуально или в группу'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
