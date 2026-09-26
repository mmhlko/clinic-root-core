import type { AxiosInstance, AxiosResponse } from "axios";

export interface ApiRequestOptions {
	accessToken?: string;
	cookie?: string;
}

export class RootApi {
	constructor(protected readonly client: AxiosInstance) {}

	protected async requestGet<T>(
		url: string,
		options?: ApiRequestOptions,
	): Promise<T> {
		const response = await this.client.get<T>(url, {
			headers: this.getHeaders(options),
		});

		return response.data;
	}

	protected async requestPost<TResponse, TBody = unknown>(
		url: string,
		body?: TBody,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		const response = await this.client.post<TResponse>(
			url,
			body,
			{ headers: this.getHeaders(options) },
		);

		return response.data;
	}

	protected async requestPatch<TResponse, TBody = unknown>(
		url: string,
		body?: TBody,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		const response = await this.client.patch<TResponse>(
			url,
			body,
			{ headers: this.getHeaders(options) },
		);

		return response.data;
	}

	protected async requestPut<TResponse, TBody = unknown>(
		url: string,
		body?: TBody,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		const response = await this.client.put<TResponse>(
			url,
			body,
			{ headers: this.getHeaders(options) },
		);

		return response.data;
	}

	protected async requestDelete<TResponse>(
		url: string,
		options?: ApiRequestOptions,
	): Promise<TResponse> {
		const response: AxiosResponse<TResponse> = await this.client.delete<TResponse>(
			url,
			{ headers: this.getHeaders(options) },
		);

		return response.data;
	}

	private getHeaders(options?: ApiRequestOptions) {
		return {
			...(options?.accessToken
				? { Authorization: `Bearer ${options.accessToken}` }
				: {}),
			...(options?.cookie ? { Cookie: options.cookie } : {}),
		};
	}
}
