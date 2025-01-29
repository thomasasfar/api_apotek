import {SearchStockRequest, StockResponse, toStockResponse} from "../model/stock-model";
import {FilterConfig, Pageable} from "../model/page-model";
import {validate} from "../validation/validation";
import {searchStockValidation} from "../validation/stock-validation";
import {buildFilters} from "../helpers/filter-helper";
import {prismaClient} from "../application/database";

const search = async (request: SearchStockRequest): Promise<Pageable<StockResponse>> => {
    request = validate(searchStockValidation, request);

    const filterableFields: FilterConfig[] = [
        {key: 'batch_number'},
        {key: 'product', field: 'product.name'},
        {key: 'before_expired', field: 'expired_date', operation: 'day_before'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size;

    const stocks = await prismaClient.stock.findMany({
        where: {
            AND: filters
        },
        include: {
            product: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                }
            }
        },
        take: request.size,
        skip: skip,
    })

    const totalItems = await prismaClient.stock.count({
        where: {
            AND: filters
        }
    })

    return {
        data: stocks.map(stock => toStockResponse(stock)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    search,
}