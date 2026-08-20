import { useEffect, useState } from "react";
import { PAGINATION } from "@/config/constants";

interface UseEntitySearchParams<T extends { search?: string | null; page?: number | null }> {
    params: T;
    setParams: (
        updater: Partial<T> | ((prev: T) => Partial<T> | T)
    ) => void | Promise<unknown>;
    debounceMs?: number;
}

export const useEntitySearch = <T extends { search?: string | null; page?: number | null }>({
    params,
    setParams,
    debounceMs = 500,
}: UseEntitySearchParams<T>) => {
    const [searchValue, setSearchValue] = useState(params.search ?? "");

    useEffect(() => {
        setSearchValue(params.search ?? "");
    }, [params.search]);

    useEffect(() => {
        if (searchValue === (params.search ?? "")) {
            return;
        }

        const handler = setTimeout(() => {
            setParams((prev) => ({
                ...prev,
                search: searchValue || null,
                page: PAGINATION.DEFAULT_PAGE,
            }));
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue, params.search, setParams, debounceMs]);

    return {
        searchValue,
        onSearchChange: setSearchValue,
    };
};
