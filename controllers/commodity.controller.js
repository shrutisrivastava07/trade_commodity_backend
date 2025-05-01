const commodityService = require('../services/commodity.service');

exports.getAll = async (req, res) => {
  try {
    console.log("Fetching commodities for user:");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commodityService.getAll(page, limit );
    console.log("Fetched commodities:", result.rows);
    
    return res.json(
        {

            totalRecords: result.count || 1,
            totalPage: Math.ceil(result.count / limit),
            pageNo: page,
            items: result.rows,
            isSuccess: true,
            message: 'Commodities fetched successfully',
            code: 'COMMODITY_FETCH_SUCCESSFUL',
            });
  } catch (err) {
    res.status(500).json({ message: err.message });
    //res.failure(err);
  }
};
