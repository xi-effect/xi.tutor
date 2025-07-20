export type MaterialT = {
  id: number;
  name: string;
  kind: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
  ydoc_id: string;
};

export type UpdateMaterialDataT = {
  name?: string;
  kind?: string;
};
