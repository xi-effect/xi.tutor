type ContactKindT = 'personal-telegram';

export type ContactT = {
  kind: ContactKindT;
  link: string;
  title: string;
  is_public: boolean;
};

export type ContactsT = ContactT[];
