export * from './errorHandler';
export * from './findNextAvailableName';
export {
  isStorageLimitReachedError,
  preventStorageWrite,
  reportStorageLimitReached,
  setStorageWriteGuard,
  setTutorStorageLimitHandler,
} from '../storageLimit/storageLimitReached';
