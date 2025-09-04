export type UserProfileSchema = {
  username: string;
  display_name: string | null;
};

export type TutorshipSchema = {
  student_id: number;
  created_at: string;
  active_classroom_count: number;
};

export type TutorStudentSchemaMarshal = {
  tutorship: TutorshipSchema;
  user: UserProfileSchema;
};
