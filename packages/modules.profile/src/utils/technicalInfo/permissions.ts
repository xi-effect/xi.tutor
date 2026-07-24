import { tProfile } from '../tProfile';

export const getPermissions = async (): Promise<Record<string, string>> => {
  const permissions: Record<string, string> = {};
  const permissionNames: (PermissionName | string)[] = [
    'geolocation',
    'notifications',
    'midi',
    'camera',
    'microphone',
    'background-sync',
    'persistent-storage',
    'accelerometer',
    'gyroscope',
    'magnetometer',
    'clipboard-read',
    'clipboard-write',
    'payment-handler',
  ];

  const unsupported = tProfile('report.values.unsupported');
  const undefinedValue = tProfile('report.values.undefined');

  if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
    permissionNames.forEach((name) => {
      permissions[name] = unsupported;
    });
    return permissions;
  }

  for (const name of permissionNames) {
    try {
      const result = await navigator.permissions
        .query({ name: name as PermissionName })
        .catch(() => null);
      permissions[name] = result?.state || undefinedValue;
    } catch {
      permissions[name] = undefinedValue;
    }
  }

  return permissions;
};
