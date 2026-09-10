import { useQuery } from '@tanstack/react-query';
import {
  createMathTaskSearch,
  loadMathCatalog,
  loadMathExamIndex,
  loadMathSearchDocuments,
} from 'features.math.bank';

export const useMathBankIndex = (enabled = true) => {
  const documentsQuery = useQuery({
    queryKey: ['math-bank', 'search-index'],
    queryFn: async () => {
      const documents = await loadMathSearchDocuments();
      return { documents, search: createMathTaskSearch(documents) };
    },
    staleTime: Infinity,
    enabled,
  });

  const catalogQuery = useQuery({
    queryKey: ['math-bank', 'catalog'],
    queryFn: () => loadMathCatalog(),
    staleTime: Infinity,
    enabled,
  });

  const examIndexQuery = useQuery({
    queryKey: ['math-bank', 'exam-index'],
    queryFn: () => loadMathExamIndex(),
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
