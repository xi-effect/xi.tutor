import { Circle, Rectangle, Trapezoid, Triangle, Star, Diamond } from '@xipkg/icons';
import {
  ConeIcon,
  CubeIcon,
  CylinderIcon,
  HexagonIcon,
  NumberLineIcon,
  OctagonIcon,
  OvalIcon,
  Parallelogram2Icon,
  ParallelogramIcon,
  PentagonIcon,
  PyramidIcon,
  AxesIcon,
  VectorIcon,
  TriangleElementsIcon,
  IsoscelesTriangleIcon,
  CircleElementsIcon,
  IonicBondIcon,
  CovalentBondIcon,
  PolarBondIcon,
  HydrogenBondIcon,
  WaterIcon,
  CarbonDioxideIcon,
  MethaneIcon,
  BenzeneIcon,
} from './figureIcons';
import type { BoardTemplateGroup, SolidFigureOption, TShapeOption } from './types';

export const shapes: TShapeOption[] = [
  {
    name: 'rectangle',
    icon: <Rectangle />,
    geo: 'rectangle',
    labelKey: 'shapesPopup.geo.rectangle',
  },
  { name: 'ellipse', icon: <Circle />, geo: 'ellipse', labelKey: 'shapesPopup.geo.ellipse' },
  { name: 'oval', icon: <OvalIcon />, geo: 'oval', labelKey: 'shapesPopup.geo.oval' },
  { name: 'triangle', icon: <Triangle />, geo: 'triangle', labelKey: 'shapesPopup.geo.triangle' },
  { name: 'diamond', icon: <Diamond />, geo: 'diamond', labelKey: 'shapesPopup.geo.diamond' },
  {
    name: 'rhombus',
    icon: <ParallelogramIcon />,
    geo: 'rhombus',
    labelKey: 'shapesPopup.geo.rhombus',
  },
  {
    name: 'rhombus-2',
    icon: <Parallelogram2Icon />,
    geo: 'rhombus-2',
    labelKey: 'shapesPopup.geo.rhombus2',
  },
  {
    name: 'trapezoid',
    icon: <Trapezoid />,
    geo: 'trapezoid',
    labelKey: 'shapesPopup.geo.trapezoid',
  },
  {
    name: 'pentagon',
    icon: <PentagonIcon />,
    geo: 'pentagon',
    labelKey: 'shapesPopup.geo.pentagon',
  },
  { name: 'hexagon', icon: <HexagonIcon />, geo: 'hexagon', labelKey: 'shapesPopup.geo.hexagon' },
  { name: 'octagon', icon: <OctagonIcon />, geo: 'octagon', labelKey: 'shapesPopup.geo.octagon' },
  { name: 'star', icon: <Star />, geo: 'star', labelKey: 'shapesPopup.geo.star' },
];

export const solidFigures: SolidFigureOption[] = [
  { kind: 'cube', icon: <CubeIcon />, labelKey: 'shapesPopup.kinds.cube' },
  { kind: 'pyramid', icon: <PyramidIcon />, labelKey: 'shapesPopup.kinds.pyramid' },
  { kind: 'cylinder', icon: <CylinderIcon />, labelKey: 'shapesPopup.kinds.cylinder' },
  { kind: 'cone', icon: <ConeIcon />, labelKey: 'shapesPopup.kinds.cone' },
];

export const boardTemplateGroups: BoardTemplateGroup[] = [
  {
    subjectKey: 'math',
    items: [
      { id: 'cube', icon: <CubeIcon />, labelKey: 'shapesPopup.kinds.cube' },
      { id: 'pyramid', icon: <PyramidIcon />, labelKey: 'shapesPopup.kinds.pyramid' },
      { id: 'cylinder', icon: <CylinderIcon />, labelKey: 'shapesPopup.kinds.cylinder' },
      { id: 'cone', icon: <ConeIcon />, labelKey: 'shapesPopup.kinds.cone' },
      { id: 'number-line', icon: <NumberLineIcon />, labelKey: 'shapesPopup.kinds.numberLine' },
      { id: 'triangle', icon: <TriangleElementsIcon />, labelKey: 'shapesPopup.kinds.triangle' },
      { id: 'right-triangle', icon: <Triangle />, labelKey: 'shapesPopup.kinds.rightTriangle' },
      {
        id: 'isosceles-triangle',
        icon: <IsoscelesTriangleIcon />,
        labelKey: 'shapesPopup.kinds.isoscelesTriangle',
      },
      { id: 'rectangle', icon: <Rectangle />, labelKey: 'shapesPopup.kinds.rectangle' },
      { id: 'circle', icon: <CircleElementsIcon />, labelKey: 'shapesPopup.kinds.circle' },
      { id: 'axes', icon: <AxesIcon />, labelKey: 'shapesPopup.templates.axes' },
    ],
  },
  {
    subjectKey: 'physics',
    items: [
      { id: 'vector', icon: <VectorIcon />, labelKey: 'shapesPopup.templates.vector' },
      { id: 'axes', icon: <AxesIcon />, labelKey: 'shapesPopup.templates.axes' },
    ],
  },
  {
    subjectKey: 'chemistry',
    items: [
      { id: 'ionic-bond', icon: <IonicBondIcon />, labelKey: 'shapesPopup.kinds.ionicBond' },
      { id: 'covalent-bond', icon: <CovalentBondIcon />, labelKey: 'shapesPopup.kinds.covalentBond' },
      { id: 'polar-bond', icon: <PolarBondIcon />, labelKey: 'shapesPopup.kinds.polarBond' },
      { id: 'hydrogen-bond', icon: <HydrogenBondIcon />, labelKey: 'shapesPopup.kinds.hydrogenBond' },
      { id: 'water', icon: <WaterIcon />, labelKey: 'shapesPopup.kinds.water' },
      { id: 'carbon-dioxide', icon: <CarbonDioxideIcon />, labelKey: 'shapesPopup.kinds.carbonDioxide' },
      { id: 'methane', icon: <MethaneIcon />, labelKey: 'shapesPopup.kinds.methane' },
      { id: 'benzene', icon: <BenzeneIcon />, labelKey: 'shapesPopup.kinds.benzene' },
    ],
  },
];
