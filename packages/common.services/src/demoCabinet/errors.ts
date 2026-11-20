export class DemoCabinetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoCabinetError';
  }
}
