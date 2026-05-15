import { Op } from "sequelize";

/**
 * Reusable utility to apply filtering, pagination, and sorting to Sequelize queries.
 * 
 * @param query req.query object
 * @param allowedFilters Array of fields allowed for direct filtering (e.g. ['lead_status', 'broker_id'])
 * @param dateField The field to use for date range filtering (default: 'createdAt')
 */
export const applyFilters = (query: any, allowedFilters: string[] = [], dateField: string = "createdAt") => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
    search,
    searchFields, // e.g., ['employer_name', 'contact_email']
    dateFrom,
    dateTo,
  } = query;

  const where: any = {};

  // 1. Direct Field Filters
  allowedFilters.forEach((field) => {
    if (query[field] !== undefined && query[field] !== "") {
      if (Array.isArray(query[field])) {
        where[field] = { [Op.in]: query[field] };
      } else if (typeof query[field] === "string" && query[field].includes(",")) {
        where[field] = { [Op.in]: query[field].split(",") };
      } else {
        // Use like for string fields that aren't IDs or Enums
        const isIdOrEnum = ["id", "uuid", "status", "type", "method"].some(s => field.toLowerCase().includes(s));
        if (typeof query[field] === "string" && !isIdOrEnum) {
          where[field] = { [Op.like]: `%${query[field]}%` };
        } else {
          where[field] = query[field];
        }
      }
    }
  });

  // 2. Generic Search
  if (search && searchFields) {
    const fields = Array.isArray(searchFields) ? searchFields : [searchFields];
    where[Op.or] = fields.map((field: string) => ({
      [field]: { [Op.like]: `%${search}%` },
    }));
  }

  // 3. Date Range
  if (dateFrom || dateTo) {
    where[dateField] = {};
    if (dateFrom) where[dateField][Op.gte] = new Date(dateFrom as string);
    if (dateTo) where[dateField][Op.lte] = new Date(dateTo as string);
  }

  const offset = (Number(page) - 1) * Number(limit);

  return {
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [[sortBy as string, sortOrder as string]],
    pagination: {
      page: Number(page),
      limit: Number(limit),
    },
  };
};
