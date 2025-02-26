import axios, { AxiosInstance } from 'axios';

interface AxiosLoader {
  (instance: AxiosInstance): Promise<AxiosInstance>;
}

interface AxiosLoaders {
  request?: AxiosLoader;
  response?: AxiosLoader;
}

// Теперь оба загрузчика просто возвращают экземпляр без дополнительных изменений
const defaultLoaders: Required<AxiosLoaders> = {
  request: async (instance) => instance,
  response: async (instance) => instance,
};

const axiosInstance = axios.create({
  headers: { 'Content-type': 'application/json; charset=UTF-8' },
});

export const getAxiosInstance = async (): Promise<AxiosInstance> => {
  const { request, response } = defaultLoaders;
  return response(await request(axiosInstance));
};
