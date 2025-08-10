import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP as CerbosClient } from '@cerbos/http';

const cerbos = new CerbosClient('http://localhost:3592'); // Cerbos server adresi

export function authorize(resource: string, action: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user; // authenticateJWT middleware ile eklenmiş user objesi

      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const checkRequest = {
        principal: {
          id: user.userId.toString(),
          roles: [user.role],
        },
        resources: [
          {
            resource: {
              id: user.userId.toString(),
              kind: resource,
              attributes: {
                ownerId: user.userId,
              },
            },
            actions: [action],
          },
        ],
      };

      const response = await cerbos.checkResources(checkRequest);

      if (response.isAllowed({ resource: { kind: resource, id: user.userId.toString() }, action })) {
        return next();
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
