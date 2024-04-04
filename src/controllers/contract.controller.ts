import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ContractService } from '@services/contract.service';
import { HttpException } from '@/exceptions/HttpException';

export class ContractController {
  public contract = Container.get(ContractService);

  public getContractById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contract = await this.contract.findContractById(id as any, (req as any).profile);
      if (!contract) throw new HttpException(404, "Contract doesn't exist");
      res.status(200).json(contract);
    } catch (error) {
      next(error);
    }
  };
}
