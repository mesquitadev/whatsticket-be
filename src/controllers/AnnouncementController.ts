import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import fs from "fs";
import path from "path";

import ListService from "../services/AnnouncementService/ListService";
import CreateService from "../services/AnnouncementService/CreateService";
import ShowService from "../services/AnnouncementService/ShowService";
import UpdateService from "../services/AnnouncementService/UpdateService";
import DeleteService from "../services/AnnouncementService/DeleteService";
import FindService from "../services/AnnouncementService/FindService";

import Announcement from "../models/Announcement";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
};

type StoreData = {
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
  mediaPath?: string;
  mediaName?: string;
};

type FindParams = {
  companyId: string;
};

interface RequestWithUser extends Request {
  user: {
    id: string;
    profile: string;
    companyId: number;
  };
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = (req as RequestWithUser).user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required(),
    status: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.emit(`company-announcement`, {
    action: "create",
    record
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    throw new AppError("Invalid ID");
  }

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required(),
    status: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;
  if (isNaN(Number(id))) {
    throw new AppError("Invalid ID");
  }

  const record = await UpdateService({
    ...data,
    id
  });

  const io = getIO();
  io.emit(`company-announcement`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    throw new AppError("Invalid ID");
  }
  const { companyId } = (req as RequestWithUser).user;

  await DeleteService(id);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-announcement`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Announcement deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: Announcement[] = await FindService(params);

  return res.status(200).json(records);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    throw new AppError("Invalid ID");
  }
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      throw new AppError("Announcement not found");
    }

    await announcement.update({
      mediaPath: file?.filename,
      mediaName: file?.originalname
    });
    await announcement.reload();

    const io = getIO();
    io.emit(`company-announcement`, {
      action: "update",
      record: announcement
    });

    return res.send({ message: "Message sent" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    throw new AppError("Invalid ID");
  }

  try {
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      throw new AppError("Announcement not found");
    }

    const filePath = path.resolve("public", announcement.mediaPath);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }

    await announcement.update({
      mediaPath: null,
      mediaName: null
    });
    await announcement.reload();

    const io = getIO();
    io.emit(`company-announcement`, {
      action: "update",
      record: announcement
    });

    return res.send({ message: "File deleted" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
