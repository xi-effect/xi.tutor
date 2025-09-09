export type TutorInfoT = {
  user_id: number;
  username: string;
  display_name: string | null;
};

export type IndividualInvitation = {
  kind: 'individual';
  tutor: TutorInfoT;
  existing_classroom_id: number | null;
};

export type GroupInfoT = {
  name: string;
};

export type GroupInvitation = {
  kind: 'group';
  tutor: TutorInfoT;
  classroom: GroupInfoT;
  has_already_joined: boolean;
};

export type InviteT = IndividualInvitation | GroupInvitation;

export type IndividualClassroomResponseT = {
  kind: 'individual';
  id: number;
  status: string;
  created_at: string;
  description: string | null;
  tutor_id: number;
  name: string;
};

export type GroupClassroomResponseT = {
  kind: 'group';
  id: number;
  status: string;
  created_at: string;
  description: string | null;
  tutor_id: number;
  name: string;
};

export type ClassroomResponseT = IndividualClassroomResponseT | GroupClassroomResponseT;
