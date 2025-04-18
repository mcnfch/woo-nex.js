declare module '@woocommerce/woocommerce-rest-api' {
  export interface WooCommerceRestApiOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version: string;
    wpAPIPrefix?: string;
    queryStringAuth?: boolean;
    encoding?: string;
    axiosConfig?: any;
  }

  export default class WooCommerceRestApi {
    constructor(options: WooCommerceRestApiOptions);
    get(endpoint: string, params?: any): Promise<{ data: any }>;
    post(endpoint: string, data: any, params?: any): Promise<{ data: any }>;
    put(endpoint: string, data: any, params?: any): Promise<{ data: any }>;
    delete(endpoint: string, params?: any): Promise<{ data: any }>;
    options(endpoint: string, params?: any): Promise<{ data: any }>;
  }
}
