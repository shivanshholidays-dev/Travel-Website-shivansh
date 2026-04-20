import axiosInstance from './axios';

export const customToursApi = {
    submit: (data: Record<string, any>) =>
        axiosInstance.post('/custom-tours/request', data).then((r: any) => r.data),
};
