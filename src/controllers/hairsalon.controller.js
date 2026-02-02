import {HairSalonService} from "../services/hairsalon.service.js";
import {StatusCodes} from "http-status-codes";
const getHairServices = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      discountOnly,
      sort
    } = req.query;
     const pagination = req.pagination;
    const result = await HairSalonService.getHairServices({
     category,
        search,
        minPrice,
        maxPrice,
        discountOnly: discountOnly === "true",
        sort
    }, pagination);

    res.status(StatusCodes.OK).json({
      message: "Services retrieved successfully",
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};
const getLatestHairServices = async (req, res, next) => {
  try {
    const services = await HairSalonService.getLatestHairServices(5);
    res.status(StatusCodes.OK).json({
      message: "Latest services retrieved successfully",
      data: services
    });
  } catch (err) {
    next(err);
  }
};

 const getHairServiceById = async (req, res, next) => {
    try {
        const hairService = await HairSalonService.getHairServiceById(req.params.id);
        res.status(StatusCodes.OK).json({message: "Hair service retrieved successfully", data: hairService});
    } catch (err) {
        next(err);
    }
};
 const createHairService = async (req, res, next) => {
    try {
        const hairService = await HairSalonService.createHairService(req.body);
        res.status(StatusCodes.CREATED).json({message: "Hair service created successfully", data: hairService});
    } catch (err) {
        next(err);
    }   
};

 const updateHairService = async (req, res, next) => {
    try {
        const hairService = await HairSalonService.updateHairService(req.params.id, req.body);
        res.status(StatusCodes.OK).json({message: "Hair service updated successfully", data: hairService});
    } catch (err) {
        next(err);
    }   
};
 const deleteHairService = async (req, res, next) => {
    try {
        await HairSalonService.deleteHairService(req.params.id);
        res.status(StatusCodes.NO_CONTENT).end();
    } catch (err) {
        next(err);
    }
};
const getMostFavoritedServices = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 10;

      const services =
        await HairSalonService.getMostFavoritedServices(limit);

      res.status(StatusCodes.OK).json({
        message: "Most favorited services retrieved successfully",
        data: services
      });
    } catch (err) {
      next(err);
    }
  };

export const HairSalonController = {
    getHairServices,
    getHairServiceById,
    createHairService,
    updateHairService,
    deleteHairService,
    getLatestHairServices,
    getMostFavoritedServices

};