import {FilterConfig} from "../model/page-model";
import {DateRange} from "../model/page-model";

type Filter = Record<string, any>;
type FilterOperation = 'contains' | 'lt' | 'lte' | 'gt' | 'gte' | 'month' | 'day_before' | 'date_range';

const getMonthDateRange = (year: number, month: number) => {
    // Bulan dalam JavaScript dimulai dari 0 (Januari) sampai 11 (Desember)
    const startDate = new Date(year, month - 1, 1); // Tanggal 1 dari bulan yang dipilih
    const endDate = new Date(year, month, 0); // Tanggal terakhir dari bulan yang dipilih
    return [startDate, endDate];
};

const createFilter = (
    config: FilterConfig,
    value: any,
    exact = false,
    operation: FilterOperation = 'contains',
): Filter | null => {
    if (!value) return null;

    if (operation === 'date_range') {
        const dateRange = value as DateRange | undefined;
        if (!dateRange?.start_date || !dateRange?.end_date) return null;

        const field = config.field || config.key;
        if (!field) {
            throw new Error("Field or key must be provided in the config");
        }

        // Handle nested fields (misal: "sale.created_at")
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            return {
                [parent]: {
                    [child]: {
                        gte: dateRange.start_date,
                        lte: dateRange.end_date
                    }
                }
            };
        }

        return {
            [field]: {
                gte: dateRange.start_date,
                lte: dateRange.end_date
            }
        };
    }

    if (operation === 'day_before') {
        const field = config.field || config.key;
        if (!field) {
            throw new Error("Field or key must be provided in the config");
        }

        const days = Number(value);
        if (isNaN(days)) return null;

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            return {
                [parent]: {
                    [child]: {
                        lte: targetDate
                    }
                }
            };
        }
        return {
            [field]: {
                lte: targetDate
            }
        };
    }


    if (operation === 'month') {
        const [year, month] = Array.isArray(value) ? value : value.split('-');
        if (!year || !month) return null;

        const [startDate, endDate] = getMonthDateRange(Number(year), Number(month));

        const field = config.field || config.key;
        if (!field) {
            throw new Error("Field or key must be provided in the config");
        }

        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            return {
                [parent]: {
                    [child]: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            };
        }

        return {
            [field]: {
                gte: startDate,
                lte: endDate
            }
        };
    }

    if (Array.isArray(config.fields)) {
        return {
            OR: config.fields.map((field) => ({
                [field]: operation === 'contains'
                    ? (exact ? value : {contains: value, mode: "insensitive"})
                    : {[operation]: value},
            })),
        };
    }

    const field = config.field || config.key;
    if (!field) {
        throw new Error("Field or key must be provided in the config");
    }

    if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
            [parent]: {
                [child]: operation === 'contains'
                    ? (exact ? value : {contains: value, mode: "insensitive"})
                    : {[operation]: value},
            },
        };
    }

    return {
        [field]: operation === 'contains'
            ? (exact ? value : {contains: value, mode: "insensitive"})
            : {[operation]: value},
    };
};

const buildFilters = (fields: FilterConfig[], request: Record<string, any>): Filter[] => {
    return fields
        .filter(({key}) => key && request[key] !== undefined)
        .map((field) => {
            const operation = field.operation || 'contains';
            return createFilter(field, request[field.key as string], field.exact, operation);
        })
        .filter((filter): filter is Filter => filter !== null);
};
export {
    buildFilters
};
