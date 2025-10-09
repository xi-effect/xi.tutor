export type StudentT = {
  id: string;
  name: string;
  subjects: SubjectT[];
};

export type SubjectT = {
  id: string;
  name: string;
  variant: string;
  pricePerLesson: number;
  unpaidLessonsAmount?: number;
};

export interface CreateInvoicePayload {
  invoice: {
    comment: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  student_ids: number[];
}
