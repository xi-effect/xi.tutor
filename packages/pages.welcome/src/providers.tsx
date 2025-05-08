import React from 'react';

type ProtectedProviderPropsT = {
  children: React.ReactNode;
};

export const ProtectedProvider = ({ children }: ProtectedProviderPropsT) => {
  // тут будет логика провайдера для welcom страниц после подключения бэкенда
  return children;
};

export default ProtectedProvider;
