import {HairSalonService} from "../services/hairsalon.service.js";
import {StatusCodes} from "http-status-codes";
 const getHairServices = async (req, res, next) => {
    try {
        const hairServices = await HairSalonService.getHairServices(req.query);
        res.status(StatusCodes.OK).json({message: "Hair services retrieved successfully", data: hairServices});
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
export const getServiceStatistics = async (req, res, next) => {
  try {
    const data = await HairSalonService.getServiceStatistics()

    res.status(StatusCodes.OK).json({
      message: 'Service statistics fetched successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const HairSalonController = {
    getHairServices,
    getHairServiceById,
    createHairService,
    updateHairService,
    deleteHairService,
    getServiceStatistics
};