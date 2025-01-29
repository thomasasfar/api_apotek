import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";

export const convertToSmallestUnit = async (
    productUnitId: number,
    amount: number
): Promise<number> => {
    let currentUnitId = productUnitId;
    let quantityInSmallestUnit = amount;

    while (true) {
        const conversion = await prismaClient.unitConversion.findFirst({
            where: {from_product_unit_id: currentUnitId},
            include: {toProductUnit: true},
        });

        if (!conversion) {
            const isBaseUnit = await prismaClient.productUnit.findUnique({
                where: {id: currentUnitId},
                select: {is_base: true},
            });

            if (isBaseUnit?.is_base) {
                break;
            }

            throw new ResponseError(
                400,
                `Tidak ada jalur konversi ke unit terkecil untuk unit ID ${currentUnitId}`
            );
        }

        quantityInSmallestUnit *= conversion.conversion_value;
        currentUnitId = conversion.toProductUnit.id;
    }

    return Math.floor(quantityInSmallestUnit);
};
