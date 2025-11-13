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

  if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
    permissionNames.forEach((name) => {
      permissions[name] = 'не поддерживается';
    });
    return permissions;
  }

  for (const name of permissionNames) {
    try {
      const result = await navigator.permissions
        .query({ name: name as PermissionName })
        .catch(() => null);
      permissions[name] = result?.state || 'не определен';
    } catch {
      permissions[name] = 'не определен';
    }
  }

  return permissions;
};
