export type NotificationsSettingsT = {
  telegram: {
    connection: {
      status: 'active' | 'blocked' | 'replaced';
    };
    contact: {
      link: string;
      title: string;
      is_public: boolean;
    };
  };
};
