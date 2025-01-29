export type Paging = {
    page: number;
    total_page: number;
    total_item: number;
}

export type Pageable<T> = {
    data: Array<T>;
    paging: Paging
}

export interface DateRange {
    start_date: Date;
    end_date: Date;
}

export type FilterConfig = {
    key?: string;
    field?: string;
    fields?: string[];
    exact?: boolean;
    isEnum?: boolean;
    operation?: 'contains' | 'lt' | 'lte' | 'gt' | 'gte' | 'month' | 'day_before' | 'date_range';
}