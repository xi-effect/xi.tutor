export type TemplateT = {
  id: number;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
};

export type PaymentTemplateDataT = {
  name: string;
  price: number;
};

export type UpdateTemplateDataT = {
  template_id: number;
  templateData: PaymentTemplateDataT;
};
