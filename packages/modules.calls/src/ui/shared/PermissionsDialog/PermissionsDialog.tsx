import { useEffect, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { usePermissionsStore, closePermissionsDialog } from '../../../store/permissions';
import { useWatchPermissions } from '../../../hooks/useWatchPermissions';
import { isSafari } from '../../../utils/livekit';
import { Settings } from '@xipkg/icons';

/**
 * Singleton component - ensures permissions sync runs only once across the app.
 * WARNING: This component should only be instantiated once in the interface.
 * Multiple instances may cause unexpected behavior or performance issues.
 */
export const PermissionsDialog = () => {
  // Инициализируем отслеживание разрешений
  useWatchPermissions();

  const {
    isPermissionDialogOpen,
    isCameraDenied,
    isMicrophoneDenied,
    isCameraGranted,
    isMicrophoneGranted,
  } = usePermissionsStore();

  const permissionLabel = useMemo(() => {
    if (isMicrophoneDenied && isCameraDenied) {
      return 'cameraAndMicrophone';
    } else if (isCameraDenied) {
      return 'camera';
    } else if (isMicrophoneDenied) {
      return 'microphone';
    } else {
      return 'default';
    }
  }, [isCameraDenied, isMicrophoneDenied]);

  // Автоматически закрываем диалог если разрешения получены
  useEffect(() => {
    if (isPermissionDialogOpen && isCameraGranted && isMicrophoneGranted) {
      closePermissionsDialog();
    }
  }, [isPermissionDialogOpen, isCameraGranted, isMicrophoneGranted]);

  const getHeading = () => {
    switch (permissionLabel) {
      case 'cameraAndMicrophone':
        return 'Разрешите доступ к камере и микрофону';
      case 'camera':
        return 'Разрешите доступ к камере';
      case 'microphone':
        return 'Разрешите доступ к микрофону';
      default:
        return 'Разрешения на камеру и микрофон';
    }
  };

  const getDescription = () => {
    switch (permissionLabel) {
      case 'cameraAndMicrophone':
        return 'Для участия в видеоконференции необходимо разрешить доступ к камере и микрофону.';
      case 'camera':
        return 'Для участия в видеоконференции необходимо разрешить доступ к камере.';
      case 'microphone':
        return 'Для участия в видеоконференции необходимо разрешить доступ к микрофону.';
      default:
        return 'Для участия в видеоконференции необходимо разрешить доступ к камере и микрофону.';
    }
  };

  const getInstructions = () => {
    if (isSafari()) {
      return [
        `Нажмите на иконку ${window.location.origin.replace('https://', '')} в адресной строке`,
        'Выберите "Разрешить" для камеры и микрофона',
      ];
    } else {
      return [
        'Нажмите на иконку настроек в адресной строке браузера',
        'Выберите "Разрешить" для камеры и микрофона',
      ];
    }
  };

  const handleRequestPermissions = async () => {
    try {
      // Запрашиваем разрешения на камеру и микрофон
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Останавливаем поток, так как нам нужны только разрешения
      stream.getTracks().forEach((track) => track.stop());

      closePermissionsDialog();
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  if (!isPermissionDialogOpen) {
    return null;
  }

  return (
    <Modal open={isPermissionDialogOpen} onOpenChange={closePermissionsDialog}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="text-xl font-semibold">{getHeading()}</ModalTitle>
        </ModalHeader>

        <div className="flex items-center gap-8">
          {/* Иконка камеры и микрофона */}
          <div className="flex-shrink-0">
            <div className="flex h-72 w-72 items-center justify-center rounded-lg bg-gray-100">
              <div className="text-6xl">📹🎤</div>
            </div>
          </div>

          {/* Инструкции */}
          <div className="flex-1 space-y-4">
            <p className="text-gray-600">{getDescription()}</p>

            <ol className="list-inside list-decimal space-y-2 text-sm">
              {getInstructions().map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  {index === 0 && !isSafari() && (
                    <Settings className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={closePermissionsDialog}>
                Отмена
              </Button>
              <Button onClick={handleRequestPermissions}>Разрешить</Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
