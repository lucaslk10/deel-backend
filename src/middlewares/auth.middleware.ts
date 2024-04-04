import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { Profile } from '@/models';

const getAuthorization = req => {
  const profileId = req.get('profile_id');
  if (profileId) return profileId;

  return null;
};

export const AuthMiddleware = async (req, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);

    if (!Authorization) next(new HttpException(404, 'Authentication token missing'));

    const profile = await Profile.findOne({ where: { id: Authorization || 0 } });
    if (!profile) return next(new HttpException(401, 'Wrong authentication token'));

    req.profile = profile;
    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};
