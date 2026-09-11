import { useQuery } from '@tanstack/react-query';
import {
  createMathTaskSearch,
  loadBankCatalog,
  loadBankExamIndex,
  loadBankSearchDocuments,
  type BankSubject,
} from 'features.math.bank';

export const useMathBankIndex = (subject: BankSubject, enabled = true) => {
  const documentsQuery = useQuery({
    queryKey: ['task-bank', subject, 'search-index'],
    queryFn: async () => {
      const documents = await loadBankSearchDocuments(subject);
      return { documents, search: createMathTaskSearch(documents) };
    },
    staleTime: Infinity,
    enabled,
  });

  const catalogQuery = useQuery({
    queryKey: ['task-bank', subject, 'catalog'],
    queryFn: () => loadBankCatalog(subject, documentsQuery.data?.documents),
    staleTime: Infinity,
    enabled: enabled && (subject === 'mathematics' || Boolean(documentsQuery.data)),
  });

  const examIndexQuery = useQuery({
    queryKey: ['task-bank', subject, 'exam-index'],
    queryFn: () => loadBankExamIndex(subject),
    staleTime: Infinity,
    enabled,
  });

  return {
    search: documentsQuery.data?.search ?? null,
    documents: documentsQuery.data?.documents ?? [],
    catalog: catalogQuery.data ?? [],
    examIndex: examIndexQuery.data ?? [],
    isLoading: documentsQuery.isLoading || catalogQuery.isLoading,
    isError: documentsQuery.isError || catalogQuery.isError,
  };
};
