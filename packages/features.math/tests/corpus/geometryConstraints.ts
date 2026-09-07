import type { GeometryConstraint, GeometryEntity } from '../../src/geometry';

export type GeometryConstraintCorpusCase = {
  id: string;
  category: string;
  text: string;
  entity?: GeometryEntity['type'];
  constraint?: GeometryConstraint['type'];
};

export const geometryConstraintCorpus: GeometryConstraintCorpusCase[] = [
  {
    id: 'right-triangle',
    category: 'прямоугольный треугольник',
    text: 'В треугольнике ABC угол C равен 90°.',
    entity: 'triangle',
    constraint: 'angle',
  },
  {
    id: 'isosceles-triangle',
    category: 'равнобедренный треугольник',
    text: 'Дан равнобедренный треугольник ABC, AB = AC.',
    entity: 'triangle',
    constraint: 'equal_length',
  },
  {
    id: 'equilateral-triangle',
    category: 'равносторонний треугольник',
    text: 'Дан равносторонний треугольник ABC.',
    entity: 'triangle',
    constraint: 'equal_length',
  },
  {
    id: 'median',
    category: 'медиана',
    text: 'В треугольнике ABC AM — медиана.',
    constraint: 'median',
  },
  {
    id: 'altitude',
    category: 'высота',
    text: 'В треугольнике ABC AH является высотой.',
    constraint: 'altitude',
  },
  {
    id: 'bisector',
    category: 'биссектриса',
    text: 'В треугольнике ABC AD — биссектриса угла A.',
    constraint: 'bisector',
  },
  {
    id: 'midpoint',
    category: 'середина',
    text: 'M — середина отрезка AB.',
    constraint: 'midpoint',
  },
  {
    id: 'parallel',
    category: 'параллельные прямые',
    text: 'AB параллелен CD.',
    constraint: 'parallel',
  },
  {
    id: 'perpendicular',
    category: 'перпендикулярные прямые',
    text: 'AB перпендикулярен CD.',
    constraint: 'perpendicular',
  },
  {
    id: 'similar',
    category: 'подобные треугольники',
    text: 'Треугольники ABC и DEF подобны.',
    entity: 'triangle',
    constraint: 'similar_triangles',
  },
  { id: 'circle', category: 'окружность', text: 'Дана окружность с центром O.', entity: 'circle' },
  {
    id: 'radius',
    category: 'радиус',
    text: 'OA — радиус окружности с центром O.',
    constraint: 'radius',
  },
  {
    id: 'diameter',
    category: 'диаметр',
    text: 'AB является диаметром окружности с центром O.',
    constraint: 'diameter',
  },
  {
    id: 'chord',
    category: 'хорда',
    text: 'AB — хорда окружности с центром O.',
    constraint: 'chord',
  },
  {
    id: 'tangent',
    category: 'касательная',
    text: 'AB — касательная к окружности с центром O.',
    constraint: 'tangent',
  },
  {
    id: 'inscribed-angle',
    category: 'вписанный угол',
    text: 'В окружности с центром O угол ACB равен 41°.',
    entity: 'circle',
    constraint: 'angle',
  },
  {
    id: 'central-angle',
    category: 'центральный угол',
    text: 'В окружности с центром O угол AOB равен 82°.',
    entity: 'circle',
    constraint: 'angle',
  },
  {
    id: 'quadrilateral',
    category: 'четырёхугольник',
    text: 'Дан четырёхугольник ABCD.',
    entity: 'quadrilateral',
  },
  {
    id: 'rectangle',
    category: 'прямоугольник',
    text: 'Дан прямоугольник ABCD.',
    entity: 'quadrilateral',
  },
  { id: 'rhombus', category: 'ромб', text: 'Дан ромб ABCD.', entity: 'quadrilateral' },
  { id: 'trapezoid', category: 'трапеция', text: 'Дана трапеция ABCD.', entity: 'quadrilateral' },
  {
    id: 'equal-angles',
    category: 'равные углы',
    text: 'Угол ABC = угол DEF.',
    constraint: 'equal_angle',
  },
];
